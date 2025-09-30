import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import bcrypt from "bcryptjs";

export const userRouter = createTRPCRouter({
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        username: true,
        phone: true,
        businessEnrolled: true,
        capsuleEnrolled: true,
        createdAt: true,
      },
    });
  }),

  updateProfile: protectedProcedure
    .input(z.object({
      name: z.string().min(2, "Name must be at least 2 characters").optional(),
      username: z.string().min(3, "Username must be at least 3 characters").optional(),
      bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: input,
      });
    }),

  enrollInBusiness: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: { businessEnrolled: true },
      });
    }),

  register: publicProcedure
    .input(z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters"),
      phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number").optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.user.findFirst({
        where: {
          OR: [
            { email: input.email },
            ...(input.phone ? [{ phone: input.phone }] : []),
          ],
        },
      });

      if (existingUser) {
        throw new Error("User already exists with this email or phone");
      }

      const hashedPassword = await bcrypt.hash(input.password, 12);

      return await ctx.db.user.create({
        data: {
          name: input.name,
          email: input.email,
          password: hashedPassword,
          phone: input.phone,
          businessEnrolled: true, // Auto-enroll in business management
        },
      });
    }),
});