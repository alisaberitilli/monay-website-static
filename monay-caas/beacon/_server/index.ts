import {
  CreateWSSContextFnOptions,
  applyWSSHandler,
} from "@trpc/server/adapters/ws";
import "dotenv/config";
import http from "node:http";
import type { Server } from "node:http";
import { WebSocketServer } from "ws";

import app from "./app";
import config from "./config";
import log from "./log";
import type { AppRouter } from "./resources";
import appRouter from "./resources";
import { prisma } from "./services/prisma";
import { createContext } from "./trpc";

const timer = process.hrtime.bigint();

let server: Server;
let wss: WebSocketServer;

/**
 * `main()` bootstraps the web server and sets up base error handling
 */
async function main() {
  await prisma.$connect();

  server = http.createServer(app);
  wss = new WebSocketServer({ server });

  applyWSSHandler<AppRouter>({
    wss,
    router: appRouter,
    createContext,
  });
  server.listen(config.port, () => {
    log.info(`Server listening at ${config.baseUrl}:${config.port}`);
  });
}

const exitHandler = () => {
  prisma.$disconnect().then(() => {
    if (server) {
      server.close(() => {
        process.exit(1);
      });
    } else {
      process.exit(1);
    }
  });
};

const errorHandler = (error: Error) => {
  log.error(error);
  exitHandler();
};
process.on("uncaughtException", errorHandler);
process.on("unhandledRejection", errorHandler);

process.on("SIGTERM", () => {
  if (config.dev) log.info("SIGTERM received");
  exitHandler();
});

main()
  .catch(errorHandler)
  .finally(() => {
    const time = Number(process.hrtime.bigint() - timer) / 10 ** 6;
    log.info(`Server setup complete: ${time}ms`);
  });

// if(config.dev) {
//   import("remotedev-server").then(remotedev => {
//     remotedev.default({
//       hostname: "localhost",
//       port: parseInt(process.env.VITE_REMOTEDEV_PORT ?? "4000", 10)
//     }).then(() => {
//       log.info("Remotedev server setup complete");
//     });
//   });
// }
