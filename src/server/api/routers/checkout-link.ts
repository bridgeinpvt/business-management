import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { nanoid } from "nanoid";

const createCheckoutLinkSchema = z.object({
  businessId: z.string(),
  productId: z.string().optional(),
  name: z.string().min(2, "Link name must be at least 2 characters"),
});

const updateCheckoutLinkSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  isActive: z.boolean().optional(),
});

export const checkoutLinkRouter = createTRPCRouter({
  // Create a new checkout link
  create: protectedProcedure
    .input(createCheckoutLinkSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify business ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      // If productId is provided, verify product belongs to business
      if (input.productId) {
        const product = await ctx.db.product.findUnique({
          where: { id: input.productId },
          select: { businessId: true },
        });

        if (product?.businessId !== input.businessId) {
          throw new Error("Product does not belong to this business");
        }
      }

      // Generate unique slug
      const slug = nanoid(10);
      const baseUrl = process.env.NEXT_PUBLIC_BUSINESS_URL || "http://localhost:3000";
      const url = `${baseUrl}/checkout/${slug}`;

      return await ctx.db.checkoutLink.create({
        data: {
          ...input,
          slug,
          url,
        },
      });
    }),

  // Get all checkout links for a business
  getByBusinessId: protectedProcedure
    .input(z.object({
      businessId: z.string(),
      search: z.string().optional(),
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

      const where: any = {
        businessId: input.businessId,
      };

      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: "insensitive" } },
          { slug: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const links = await ctx.db.checkoutLink.findMany({
        where,
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return links;
    }),

  // Get by slug (public)
  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.checkoutLink.findUnique({
        where: { slug: input.slug },
        include: {
          business: true,
          product: true,
        },
      });

      if (!link || !link.isActive) {
        throw new Error("Checkout link not found or inactive");
      }

      return link;
    }),

  // Update checkout link
  update: protectedProcedure
    .input(updateCheckoutLinkSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const link = await ctx.db.checkoutLink.findUnique({
        where: { id },
        include: {
          business: {
            select: { ownerId: true },
          },
        },
      });

      if (!link || link.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.checkoutLink.update({
        where: { id },
        data,
      });
    }),

  // Delete checkout link
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.checkoutLink.findUnique({
        where: { id: input.id },
        include: {
          business: {
            select: { ownerId: true },
          },
        },
      });

      if (!link || link.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.checkoutLink.delete({
        where: { id: input.id },
      });
    }),

  // Increment click count (public endpoint for tracking)
  incrementClick: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.checkoutLink.update({
        where: { slug: input.slug },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    }),

  // Record conversion
  recordConversion: publicProcedure
    .input(z.object({ slug: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.checkoutLink.update({
        where: { slug: input.slug },
        data: {
          conversions: {
            increment: 1,
          },
        },
      });
    }),
});
