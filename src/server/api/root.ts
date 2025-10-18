import { createTRPCRouter } from "@/server/api/trpc";
import { postRouter } from "./routers/post";
import { userRouter } from "./routers/user";
import { newsRouter } from "./routers/news";
import { exploreRouter } from "./routers/explore";
import { capsuleRouter } from "./routers/capsule";
import { chatRouter } from "./routers/chat";
import { referralRouter } from "./routers/referral";
import { notificationRouter } from "./routers/notification";
import { filesRouter } from "./routers/files";
import { walletRouter } from "./routers/wallet";
import { businessRouter } from "./routers/business";
import { productRouter } from "./routers/product";
import { customerRouter } from "./routers/customer";
import { orderRouter } from "./routers/order";
import { trackingLinkRouter } from "./routers/tracking-link";
import { checkoutLinkRouter } from "./routers/checkout-link";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  user: userRouter,
  news: newsRouter,
  explore: exploreRouter,
  capsule: capsuleRouter,
  chat: chatRouter,
  referral: referralRouter,
  notification: notificationRouter,
  files: filesRouter,
  wallet: walletRouter,
  business: businessRouter,
  product: productRouter,
  customer: customerRouter,
  order: orderRouter,
  trackingLink: trackingLinkRouter,
  checkoutLink: checkoutLinkRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

// Export a server-side caller factory
export const createCaller = (ctx: {
  user: { id: string; email: string; name?: string; userRole?: string; } | null;
  db: typeof import("@/server/db").db;
}) => {
  return appRouter.createCaller(ctx);
};