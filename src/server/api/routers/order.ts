import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { generateOrderNumber } from "@/lib/utils";

const createOrderSchema = z.object({
  businessId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    variant: z.record(z.string()).optional(),
    notes: z.string().optional(),
  })).min(1, "Order must have at least one item"),
  shippingAddress: z.object({
    name: z.string().min(2, "Name is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(10, "Complete address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    zipCode: z.string().min(5, "Valid ZIP code is required"),
  }),
  billingAddress: z.object({
    name: z.string(),
    phone: z.string(),
    address: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }).optional(),
  notes: z.string().optional(),
});

export const orderRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createOrderSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify business exists and is active
      const business = await ctx.db.business.findUnique({
        where: { id: input.businessId, isActive: true },
        select: { id: true, name: true },
      });

      if (!business) {
        throw new Error("Business not found or inactive");
      }

      // Get products and calculate totals
      const productIds = input.items.map(item => item.productId);
      const products = await ctx.db.product.findMany({
        where: {
          id: { in: productIds },
          businessId: input.businessId,
          isActive: true,
        },
      });

      if (products.length !== productIds.length) {
        throw new Error("Some products are not available");
      }

      // Check inventory
      for (const item of input.items) {
        const product = products.find(p => p.id === item.productId);
        if (!product) {
          throw new Error(`Product not found: ${item.productId}`);
        }
        if (product.inventory < item.quantity) {
          throw new Error(`Insufficient inventory for product: ${product.name}`);
        }
      }

      // Calculate totals
      let totalAmount = 0;
      const orderItems = input.items.map(item => {
        const product = products.find(p => p.id === item.productId)!;
        const unitPrice = product.price;
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          variant: item.variant,
          notes: item.notes,
        };
      });

      const discountAmount = 0; // TODO: Implement discount logic
      const taxAmount = totalAmount * 0.18; // 18% GST
      const shippingAmount = totalAmount > 500 ? 0 : 50; // Free shipping above ₹500
      const finalAmount = totalAmount - discountAmount + taxAmount + shippingAmount;

      // Generate order number
      const orderNumber = generateOrderNumber();

      // Create order in transaction
      const order = await ctx.db.$transaction(async (tx) => {
        // Create order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            userId: ctx.user.id,
            businessId: input.businessId,
            totalAmount,
            discountAmount,
            taxAmount,
            shippingAmount,
            finalAmount,
            shippingAddress: input.shippingAddress,
            billingAddress: input.billingAddress || input.shippingAddress,
            notes: input.notes,
            items: {
              create: orderItems,
            },
          },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
        });

        // Update product inventory
        for (const item of input.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              inventory: {
                decrement: item.quantity,
              },
              totalSales: {
                increment: item.quantity,
              },
            },
          });
        }

        // Create or update customer record
        await tx.customer.upsert({
          where: {
            userId_businessId: {
              userId: ctx.user.id,
              businessId: input.businessId,
            },
          },
          create: {
            userId: ctx.user.id,
            businessId: input.businessId,
            orderCount: 1,
            lastOrderDate: new Date(),
          },
          update: {
            orderCount: {
              increment: 1,
            },
            lastOrderDate: new Date(),
          },
        });

        return newOrder;
      });

      return order;
    }),

  getMyOrders: protectedProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().min(1).max(50).default(10),
      status: z.enum(["all", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).default("all"),
    }))
    .query(async ({ ctx, input }) => {
      const skip = (input.page - 1) * input.limit;

      const where = {
        userId: ctx.user.id,
        ...(input.status !== "all" && { status: input.status }),
      };

      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
          where,
          include: {
            business: {
              select: {
                id: true,
                name: true,
                logoUrl: true,
              },
            },
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
        }),
        ctx.db.order.count({ where }),
      ]);

      return {
        orders,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      };
    }),

  getBusinessOrders: protectedProcedure
    .input(z.object({
      businessId: z.string(),
      page: z.number().default(1),
      limit: z.number().min(1).max(50).default(20),
      status: z.enum(["all", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).default("all"),
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

      const skip = (input.page - 1) * input.limit;

      const where = {
        businessId: input.businessId,
        ...(input.status !== "all" && { status: input.status }),
        ...(input.search && {
          OR: [
            { orderNumber: { contains: input.search, mode: "insensitive" as const } },
            { user: { name: { contains: input.search, mode: "insensitive" as const } } },
            { user: { email: { contains: input.search, mode: "insensitive" as const } } },
          ],
        }),
      };

      const [orders, total] = await Promise.all([
        ctx.db.order.findMany({
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
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    images: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: input.limit,
        }),
        ctx.db.order.count({ where }),
      ]);

      return {
        orders,
        total,
        pages: Math.ceil(total / input.limit),
        currentPage: input.page,
      };
    }),

  getOrderById: protectedProcedure
    .input(z.object({ orderId: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
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
          business: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
              ownerId: true,
            },
          },
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Check if user owns the order or the business
      if (order.userId !== ctx.user.id && order.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      return order;
    }),

  updateOrderStatus: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]),
      estimatedDelivery: z.date().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify business ownership
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: {
          business: {
            select: { ownerId: true },
          },
        },
      });

      if (!order || order.business.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      const updateData: any = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.status === "DELIVERED") {
        updateData.deliveredAt = new Date();
        updateData.paymentStatus = "COMPLETED";
      }

      if (input.estimatedDelivery) {
        updateData.estimatedDelivery = input.estimatedDelivery;
      }

      // Update customer total spent if order is completed
      if (input.status === "DELIVERED" && order.paymentStatus !== "COMPLETED") {
        await ctx.db.customer.updateMany({
          where: {
            userId: order.userId,
            businessId: order.businessId,
          },
          data: {
            totalSpent: {
              increment: order.finalAmount,
            },
          },
        });

        // Update business revenue
        await ctx.db.business.update({
          where: { id: order.businessId },
          data: {
            totalRevenue: {
              increment: order.finalAmount,
            },
            totalOrders: {
              increment: 1,
            },
          },
        });
      }

      return await ctx.db.order.update({
        where: { id: input.orderId },
        data: updateData,
      });
    }),

  cancelOrder: protectedProcedure
    .input(z.object({
      orderId: z.string(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.db.order.findUnique({
        where: { id: input.orderId },
        include: {
          items: true,
          business: {
            select: { ownerId: true },
          },
        },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      // Check if user can cancel (customer or business owner)
      const canCancel = order.userId === ctx.user.id || order.business.ownerId === ctx.user.id;
      if (!canCancel) {
        throw new Error("Access denied");
      }

      // Can only cancel pending or confirmed orders
      if (!["PENDING", "CONFIRMED"].includes(order.status)) {
        throw new Error("Cannot cancel order in current status");
      }

      // Cancel order and restore inventory
      return await ctx.db.$transaction(async (tx) => {
        // Update order status
        await tx.order.update({
          where: { id: input.orderId },
          data: {
            status: "CANCELLED",
            notes: input.reason ? `Cancellation reason: ${input.reason}` : undefined,
          },
        });

        // Restore inventory
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              inventory: {
                increment: item.quantity,
              },
              totalSales: {
                decrement: item.quantity,
              },
            },
          });
        }

        return { success: true };
      });
    }),

  getOrderAnalytics: protectedProcedure
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

      if (business?.ownerId !== ctx.user.id) {
        throw new Error("Access denied");
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.days);

      const [
        totalOrders,
        completedOrders,
        totalRevenue,
        averageOrderValue,
        ordersByStatus,
        dailyOrders,
      ] = await Promise.all([
        ctx.db.order.count({
          where: {
            businessId: input.businessId,
            createdAt: { gte: startDate },
          },
        }),
        ctx.db.order.count({
          where: {
            businessId: input.businessId,
            status: "DELIVERED",
            createdAt: { gte: startDate },
          },
        }),
        ctx.db.order.aggregate({
          where: {
            businessId: input.businessId,
            paymentStatus: "COMPLETED",
            createdAt: { gte: startDate },
          },
          _sum: { finalAmount: true },
        }),
        ctx.db.order.aggregate({
          where: {
            businessId: input.businessId,
            paymentStatus: "COMPLETED",
            createdAt: { gte: startDate },
          },
          _avg: { finalAmount: true },
        }),
        ctx.db.order.groupBy({
          by: ["status"],
          where: {
            businessId: input.businessId,
            createdAt: { gte: startDate },
          },
          _count: true,
        }),
        ctx.db.order.findMany({
          where: {
            businessId: input.businessId,
            createdAt: { gte: startDate },
          },
          select: { createdAt: true, finalAmount: true },
          orderBy: { createdAt: "asc" },
        }),
      ]);

      // Process daily data
      const dailyData = dailyOrders.reduce((acc, order) => {
        const date = order.createdAt.toISOString().split('T')[0];
        if (!acc[date]) {
          acc[date] = { orders: 0, revenue: 0 };
        }
        acc[date].orders += 1;
        acc[date].revenue += order.finalAmount;
        return acc;
      }, {} as Record<string, { orders: number; revenue: number }>);

      return {
        totalOrders,
        completedOrders,
        pendingOrders: totalOrders - completedOrders,
        totalRevenue: totalRevenue._sum.finalAmount || 0,
        averageOrderValue: averageOrderValue._avg.finalAmount || 0,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        ordersByStatus,
        dailyData,
      };
    }),
});