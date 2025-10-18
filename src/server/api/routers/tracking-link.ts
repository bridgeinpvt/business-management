import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";

const createTrackingLinkSchema = z.object({
  businessId: z.string(),
  name: z.string().min(2, "Campaign name must be at least 2 characters"),
  url: z.string().url("Must be a valid URL"),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

const updateTrackingLinkSchema = z.object({
  id: z.string(),
  name: z.string().min(2).optional(),
  url: z.string().url().optional(),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const trackingLinkRouter = createTRPCRouter({
  // Create a new tracking link
  create: protectedProcedure
    .input(createTrackingLinkSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify business ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.trackingLink.create({
        data: input,
      });
    }),

  // Get all tracking links for a business
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
          { url: { contains: input.search, mode: "insensitive" } },
        ];
      }

      const links = await ctx.db.trackingLink.findMany({
        where,
        orderBy: { createdAt: "desc" },
      });

      return links;
    }),

  // Get analytics for a tracking link
  getAnalytics: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const link = await ctx.db.trackingLink.findUnique({
        where: { id: input.id },
        include: {
          business: {
            select: {
              ownerId: true,
            },
          },
        },
      });

      if (!link || link.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return {
        name: link.name,
        url: link.url,
        clicks: link.clicks,
        conversions: link.conversions,
        revenue: link.revenue,
        conversionRate: link.clicks > 0 ? (link.conversions / link.clicks) * 100 : 0,
      };
    }),

  // Update tracking link
  update: protectedProcedure
    .input(updateTrackingLinkSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const link = await ctx.db.trackingLink.findUnique({
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

      return await ctx.db.trackingLink.update({
        where: { id },
        data,
      });
    }),

  // Delete tracking link
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const link = await ctx.db.trackingLink.findUnique({
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

      return await ctx.db.trackingLink.delete({
        where: { id: input.id },
      });
    }),

  // Increment click count (public endpoint for tracking)
  incrementClick: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.trackingLink.update({
        where: { id: input.id },
        data: {
          clicks: {
            increment: 1,
          },
        },
      });
    }),

  // Record conversion
  recordConversion: publicProcedure
    .input(z.object({
      id: z.string(),
      revenue: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.trackingLink.update({
        where: { id: input.id },
        data: {
          conversions: {
            increment: 1,
          },
          ...(input.revenue && {
            revenue: {
              increment: input.revenue,
            },
          }),
        },
      });
    }),
});
