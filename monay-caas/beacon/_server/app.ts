import * as trpcExpress from "@trpc/server/adapters/express";
import compression from "compression";
import cors from "cors";
import { randomUUID } from "crypto";
import express from "express";
import helmet from "helmet";

import { setupDevRoutes } from "./_dev";
import config from "./config";
import log, { attachLogger, errorHandler, successHandler } from "./log";
import appRouter from "./resources";
import upload from "./services/s3";
import { apmHandler, traceHandler } from "./services/sentry";
import { createContext, getApiKey } from "./trpc";

const app = express();

const setupMiddlewares = (app: ReturnType<typeof express>) => {
  app.disable("x-powered-by");
  if (config.env !== "test" && config.env !== "e2e") {
    app.use(successHandler);
    app.use(errorHandler);
    app.use(attachLogger);
    app.use(apmHandler());
    app.use(traceHandler());
  }

  app.use(helmet());
  app.use(compression());
  app.use(cors());
};

setupMiddlewares(app);
if (config.dev) {
  setupDevRoutes(app);
}

app.use("/health-check", (_, res) => {
  res.status(200).send("Healthy!");
});

app.use(`/${config.apiKeyPath}`, (_, res) => {
  return res.status(200).json({
    key: getApiKey(),
  });
});

const apiRouter = express.Router();

apiRouter.post("/media-upload", upload.array(""));

apiRouter.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, req, ctx, input, path, type }) {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        const id = randomUUID();
        log.error(
          {
            path,
            input,
            type,
            method: req.method,
            ip: ctx?.ip,
          },
          id
        );
        log.error(error, id);
      } else {
        log.error(error, `FOR PATH: ${path}`);
      }
    },
  })
);

app.use("/api", apiRouter);

// app.use("/*", express.static("../build"));

export default app;
