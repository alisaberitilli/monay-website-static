import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { type NextRequest } from "next/server";

import { env } from "#portal/env.mjs";
import { appRouter } from "#portal/server/api/root";
import { createTRPCContext } from "#portal/server/api/trpc";

const handler = (req: NextRequest) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError:
      env.NODE_ENV === "development"
        ? ({ path, error }) => {
            console.error(
              `❌ tRPC failed on ${path ?? "<no-path>"}: ${error.message}`
            );
          }
        : undefined,
  });

// {URL}/api/trpc <-
// [trpc] <- all requests under parent folder
// route.ts <- expects some type of route handler
// with functions named GET, POST, PUT, or DELETE

export { handler as GET, handler as POST };
