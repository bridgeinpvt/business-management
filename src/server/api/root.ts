import { createCallerFactory, createTRPCRouter } from "./trpc";
import { businessRouter } from "./routers/business";
import { productRouter } from "./routers/product";
import { customerRouter } from "./routers/customer";
import { orderRouter } from "./routers/order";
import { userRouter } from "./routers/user";

export const appRouter = createTRPCRouter({
  user: userRouter,
  business: businessRouter,
  product: productRouter,
  customer: customerRouter,
  order: orderRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);