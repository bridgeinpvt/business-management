import "server-only";

import {
  createTRPCMsw,
  httpBatchLink,
  loggerLink,
  unstable_httpBatchStreamLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { headers } from "next/headers";

import { type AppRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const createContext = () => {
  const heads = new Headers(headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
};

export const api = createTRPCMsw<AppRouter>({
  createContext,
  links: [
    loggerLink({
      enabled: (op) =>
        process.env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    unstable_httpBatchStreamLink({
      url: "/api/trpc",
    }),
  ],
});