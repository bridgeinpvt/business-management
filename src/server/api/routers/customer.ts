import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

export const customerRouter = createTRPCRouter({
  getByBusinessId: protectedProcedure
    .input(z.object({
      businessId: z.string(),
      page: z.number().default(1),
      limit: z.number().min(1).max(50).default(20),
      search: z.string().optional(),
      sortBy: z.enum(["newest", "oldest", "highest_spent", "most_orders"]).default("newest"),
    }))
    .query(async ({ ctx, input }) => {
      // Verify business ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.session.user.id) {
        throw new Error("Access denied");
      }

      const skip = (input.page - 1) * input.limit;

      const orderBy = (() => {
        switch (input.sortBy) {
          case "oldest":
            return { createdAt: "asc" as const };
          case "highest_spent":
            return { totalSpent: "desc" as const };
          case "most_orders":
            return { orderCount: "desc" as const };
          default:
            return { createdAt: "desc" as const };
        }
      })();

      const where = {
        businessId: input.businessId,
        ...(input.search && {
          user: {
            OR: [
              { name: { contains: input.search, mode: "insensitive" as const } },
              { email: { contains: input.search, mode: "insensitive" as const } },
              { phone: { contains: input.search, mode: "insensitive" as const } },
            ],
          },
        }),
      };

      const [customers, total] = await Promise.all([
        ctx.db.customer.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
              },
            },
          },
          orderBy,
          skip,
          take: input.limit,
        }),
        ctx.db.customer.count({ where }),
      ]);

      return {
        customers,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      };
    }),

  getCustomerDetails: protectedProcedure
    .input(z.object({
      customerId: z.string(),
      businessId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      // Verify business ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.session.user.id) {
        throw new Error("Access denied");
      }

      const customer = await ctx.db.customer.findUnique({
        where: {
          id: input.customerId,
          businessId: input.businessId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              image: true,
              createdAt: true,
            },
          },
          orders: {
            include: {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      images: true,
                      price: true,
                    },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
      });

      if (!customer) {
        throw new Error("Customer not found");
      }

      // Get customer analytics
      const [
        totalOrders,
        completedOrders,
        totalSpent,
        averageOrderValue,
        topCategories,
      ] = await Promise.all([
        ctx.db.order.count({
          where: {
            customerId: input.customerId,
            businessId: input.businessId,
          },
        }),
        ctx.db.order.count({
          where: {
            customerId: input.customerId,
            businessId: input.businessId,
            status: "DELIVERED",
          },
        }),
        ctx.db.order.aggregate({
          where: {
            customerId: input.customerId,
            businessId: input.businessId,
            paymentStatus: "COMPLETED",
          },
          _sum: { finalAmount: true },
        }),
        ctx.db.order.aggregate({
          where: {
            customerId: input.customerId,
            businessId: input.businessId,
            paymentStatus: "COMPLETED",
          },
          _avg: { finalAmount: true },
        }),
        ctx.db.orderItem.findMany({
          where: {
            order: {
              customerId: input.customerId,
              businessId: input.businessId,
            },
          },
          include: {
            product: {
              select: { category: true },
            },
          },
        }),
      ]);

      // Process top categories
      const categoryCount = topCategories.reduce((acc, item) => {
        const category = item.product.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + item.quantity;
        return acc;
      }, {} as Record<string, number>);

      const sortedCategories = Object.entries(categoryCount)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category, count]) => ({ category, count }));

      return {
        customer,
        analytics: {
          totalOrders,
          completedOrders,
          totalSpent: totalSpent._sum.finalAmount || 0,
          averageOrderValue: averageOrderValue._avg.finalAmount || 0,
          topCategories: sortedCategories,
        },
      };
    }),

  updateCustomerNotes: protectedProcedure
    .input(z.object({
      customerId: z.string(),
      businessId: z.string(),
      notes: z.string().max(1000, "Notes must be less than 1000 characters"),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify business ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.session.user.id) {
        throw new Error("Access denied");
      }

      return await ctx.db.customer.update({
        where: {
          id: input.customerId,
          businessId: input.businessId,
        },
        data: { notes: input.notes },
      });
    }),

  getCustomerAnalytics: protectedProcedure
    .input(z.object({
      businessId: z.string(),
      days: z.number().default(30),
    }))
    .query(async ({ ctx, input }) => {
      // Verify business ownership
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId },
        select: { ownerId: true },
      });

      if (business?.ownerId !== ctx.session.user.id) {
        throw new Error("Access denied");
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const [
        totalCustomers,
        newCustomers,
        returningCustomers,
        topCustomers,
        customersByMonth,
      ] = await Promise.all([
        ctx.db.customer.count({
          where: { businessId: input.businessId },
        }),
        ctx.db.customer.count({
          where: {
            businessId: input.businessId,
            createdAt: { gte: startDate },
          },
        }),
        ctx.db.customer.count({
          where: {
            businessId: input.businessId,
            orderCount: { gt: 1 },
          },
        }),
        ctx.db.customer.findMany({
          where: { businessId: input.businessId },
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { totalSpent: "desc" },
          take: 10,
        }),
        ctx.db.customer.findMany({
          where: {
            businessId: input.businessId,
            createdAt: { gte: new Date(new Date().getFullYear(), 0, 1) }, // This year
          },
          select: { createdAt: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

      // Process monthly data
      const monthlyData = customersByMonth.reduce((acc, customer) => {
        const month = customer.createdAt.toISOString().substring(0, 7); // YYYY-MM format
        acc[month] = (acc[month] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalCustomers,
        newCustomers,
        returningCustomers,
        repeatCustomerRate: totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0,
        topCustomers,
        monthlyData,
      };
    }),
});