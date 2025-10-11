import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { generateSKU } from "@/lib/utils";

const createProductSchema = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters"),
  description: z.string().optional(),
  shortDescription: z.string().max(200, "Short description must be less than 200 characters").optional(),
  price: z.number().min(0, "Price must be positive"),
  originalPrice: z.number().min(0, "Original price must be positive").optional(),
  images: z.array(z.string().url()).default([]),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  inventory: z.number().min(0, "Inventory must be positive").default(0),
  lowStockAlert: z.number().min(0, "Low stock alert must be positive").default(5),
  weight: z.number().min(0, "Weight must be positive").optional(),
  dimensions: z.record(z.number()).optional(),
  specifications: z.record(z.any()).optional(),
  variants: z.record(z.array(z.string())).optional(),
  businessId: z.string(),
});

export const productRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify business ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true, name: true },
      });

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      // Generate SKU
      const sku = generateSKU(input.name, business.name);

      return await ctx.db.product.create({
        data: {
          ...input,
          sku,
        },
      });
    }),

  getByBusinessId: protectedProcedure
    .input(z.object({
      businessId: z.string(),
      page: z.number().default(1),
      limit: z.number().min(1).max(50).default(12),
      category: z.string().optional(),
      search: z.string().optional(),
      status: z.enum(["all", "active", "inactive"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      // Verify business ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      const skip = (input.page - 1) * input.limit;

      const where = {
        businessId: input.businessId,
        ...(input.category && { category: input.category }),
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { description: { contains: input.search, mode: "insensitive" as const } },
            { tags: { has: input.search } },
          ],
        }),
        ...(input.status !== "all" && {
          isActive: input.status === "active",
        }),
      };

      const [products, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          include: {
            productCategory: true,
            _count: {
              select: {
                orderItems: true,
                reviews: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
        }),
        ctx.db.product.count({ where }),
      ]);

      return {
        products,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      };
    }),

  getPublicByBusinessId: publicProcedure
    .input(z.object({
      businessId: z.string(),
      page: z.number().default(1),
      limit: z.number().min(1).max(50).default(12),
      category: z.string().optional(),
      search: z.string().optional(),
      sortBy: z.enum(["newest", "price_low", "price_high", "popular"]).default("newest"),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where = {
        businessId: input.businessId,
        isActive: true,
        ...(input.category && { category: input.category }),
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { shortDescription: { contains: input.search, mode: "insensitive" as const } },
            { tags: { has: input.search } },
          ],
        }),
      };

      const orderBy = (() => {
        switch (input.sortBy) {
          case "price_low":
            return { price: "asc" as const };
          case "price_high":
            return { price: "desc" as const };
          case "popular":
            return { totalSales: "desc" as const };
          default:
            return { createdAt: "desc" as const };
        }
      })();

      const [products, total] = await Promise.all([
        ctx.db.product.findMany({
          where,
          select: {
            id: true,
            name: true,
            shortDescription: true,
            price: true,
            originalPrice: true,
            images: true,
            category: true,
            tags: true,
            rating: true,
            reviewCount: true,
            totalSales: true,
            isFeatured: true,
            inventory: true,
            createdAt: true,
          },
          orderBy: [
            { isFeatured: "desc" },
            orderBy,
          ],
          skip,
          take: input.limit,
        }),
        ctx.db.product.count({ where }),
      ]);

      return {
        products,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              ownerId: true,
            },
          },
          productCategory: true,
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          _count: {
            select: {
              orderItems: true,
              reviews: true,
            },
          },
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Check if user owns the business
      if (product.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return product;
    }),

  getPublicById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.product.findUnique({
        where: {
          id: input.id,
          isActive: true,
        },
        include: {
          business: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              rating: true,
              reviewCount: true,
            },
          },
          productCategory: true,
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  image: true,
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: createProductSchema.omit({ businessId: true }).partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          business: {
            select: { ownerId: true },
          },
        },
      });

      if (product?.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.product.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          business: {
            select: { ownerId: true },
          },
        },
      });

      if (product?.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.product.delete({
        where: { id: input.id },
      });
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          business: {
            select: { ownerId: true },
          },
        },
        select: {
          isActive: true,
          business: {
            select: { ownerId: true },
          },
        },
      });

      if (product?.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.product.update({
        where: { id: input.id },
        data: { isActive: !product.isActive },
      });
    }),

  updateInventory: protectedProcedure
    .input(z.object({
      id: z.string(),
      inventory: z.number().min(0, "Inventory must be positive"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const product = await ctx.db.product.findUnique({
        where: { id: input.id },
        include: {
          business: {
            select: { ownerId: true },
          },
        },
      });

      if (product?.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.product.update({
        where: { id: input.id },
        data: { inventory: input.inventory },
      });
    }),

  getLowStockProducts: protectedProcedure
    .input(z.object({ businessId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Verify business ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.product.findMany({
        where: {
          businessId: input.businessId,
          isActive: true,
          inventory: {
            lte: ctx.db.product.fields.lowStockAlert,
          },
        },
        select: {
          id: true,
          name: true,
          inventory: true,
          lowStockAlert: true,
          images: true,
          price: true,
        },
        orderBy: { inventory: "asc" },
      });
    }),
});