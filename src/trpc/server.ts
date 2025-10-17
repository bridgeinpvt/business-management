import "server-only";

import { createCaller } from "@/server/api/root";

import { db } from "@/server/db";
import { headers } from "next/headers";
import { getUserFromHeaders } from "@/lib/shared-auth-middleware";

/**
 * This function is used to create a caller for the tRPC server.
 * It allows us to call tRPC procedures directly in server-side code.
 */

/**
 * Creates the server API caller with proper context.
 */
const createContext = async () => {
  // Get user from headers for server-side calls
  const headersList = await headers();
  const user = getUserFromHeaders(headersList);
  return {
    user,
    db,
  };
};

const getApi = async () => {
  const context = await createContext();
  return createCaller(context);
};

export const api = {
  async getCaller() {
    return await getApi();
  }
};
