import { initTRPC, TRPCError } from "@trpc/server";
import { type NextRequest } from "next/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { getUserFromHeaders } from "@/lib/shared-auth-middleware";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const user = getUserFromHeaders(opts.headers);

  return {
    db,
    user,
    ...opts,
  };
};

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const createCallerFactory = t.createCallerFactory;

export const createTRPCRouter = t.router;

export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      user: ctx.user,
    },
  });
});

export const businessOwnerProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user.businessEnrolled) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "User not enrolled in business management"
    });
  }
  return next({
    ctx,
  });
});