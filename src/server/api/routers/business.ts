import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const createBusinessSchema = z.object({
  name: z.string().min(2, "Business name must be at least 2 characters"),
  description: z.string().optional(),
  category: z.string().optional(),
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().default("India"),
  website: z.string().url().optional(),
  socialMedia: z.record(z.string()).optional(),
  businessHours: z.record(z.any()).optional(),
  upiId: z.string().optional(),
  bankAccount: z.string().optional(),
  ifscCode: z.string().optional(),
  gstin: z.string().optional(),
});

export const businessRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createBusinessSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.business.create({
        data: {
          ...input,
          ownerId: ctx.user.id,
        },
      });
    }),

  getMyBusinesses: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.business.findMany({
      where: { ownerId: ctx.user.id },
      include: {
        _count: {
          select: {
            products: true,
            customers: true,
            orders: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const business = await ctx.db.business.findUnique({
        where: { id: input.id },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          _count: {
            select: {
              products: true,
              customers: true,
              orders: true,
            },
          },
        },
      });

      // Check if user owns this business or if it's public
      if (business?.ownerId !== ctx.user.id && !business?.isActive) {
        throw new Error("Business not found or access denied");
      }

      return business;
    }),

  getPublicBusiness: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.business.findUnique({
        where: {
          id: input.id,
          isActive: true,
        },
        include: {
          owner: {
            select: {
              name: true,
              image: true,
            },
          },
          products: {
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              shortDescription: true,
              price: true,
              originalPrice: true,
              images: true,
              rating: true,
              reviewCount: true,
              isFeatured: true,
            },
            orderBy: [
              { isFeatured: "desc" },
              { totalSales: "desc" },
            ],
            take: 12,
          },
          _count: {
            select: {
              products: true,
              customers: true,
            },
          },
        },
      });
    }),

  getAllPublic: publicProcedure
    .input(z.object({
      category: z.string().optional(),
      city: z.string().optional(),
      search: z.string().optional(),
      page: z.number().default(1),
      limit: z.number().min(1).max(50).default(12),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where = {
        isActive: true,
        ...(input.category && { category: input.category }),
        ...(input.city && { city: input.city }),
        ...(input.search && {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { description: { contains: input.search, mode: "insensitive" as const } },
          ],
        }),
      };

      const [businesses, total] = await Promise.all([
        ctx.db.business.findMany({
          where,
          include: {
            owner: {
              select: {
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                products: true,
                customers: true,
              },
            },
          },
          orderBy: [
            { isVerified: "desc" },
            { rating: "desc" },
            { totalOrders: "desc" },
          ],
          skip,
          take: input.limit,
        }),
        ctx.db.business.count({ where }),
      ]);

      return {
        businesses,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: createBusinessSchema.partial(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.business.update({
        where: { id: input.id },
        data: input.data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.business.delete({
        where: { id: input.id },
      });
    }),

  toggleActive: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.id },
        select: { ownerId: true, isActive: true },
      });

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.business.update({
        where: { id: input.id },
        data: { isActive: !business.isActive },
      });
    }),

  getAnalytics: protectedProcedure
    .input(z.object({
      businessId: z.string(),
      days: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      // Verify ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const [
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        recentOrders,
        topProducts,
      ] = await Promise.all([
        ctx.db.order.aggregate({
          where: {
            businessId: input.businessId,
            paymentStatus: "COMPLETED",
            createdAt: { gte: startDate },
          },
          _sum: { finalAmount: true },
        }),
        ctx.db.order.count({
          where: {
            businessId: input.businessId,
            createdAt: { gte: startDate },
          },
        }),
        ctx.db.customer.count({
          where: { businessId: input.businessId },
        }),
        ctx.db.product.count({
          where: { businessId: input.businessId, isActive: true },
        }),
        ctx.db.order.findMany({
          where: { businessId: input.businessId },
          include: {
            user: {
              select: { name: true, email: true },
            },
            items: {
              include: {
                product: {
                  select: { name: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        ctx.db.product.findMany({
          where: { businessId: input.businessId },
          orderBy: { totalSales: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            totalSales: true,
            price: true,
            images: true,
          },
        }),
      ]);

      return {
        revenue: totalRevenue._sum.finalAmount || 0,
        orders: totalOrders,
        customers: totalCustomers,
        products: totalProducts,
        recentOrders,
        topProducts,
      };
    }),
});