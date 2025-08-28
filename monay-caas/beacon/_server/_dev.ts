import type { Express } from "express";
import { json } from "express";

import log from "./log";
import appRouter from "./resources";
import { createContext } from "./trpc";

type TestRequest = { method: string; input: JsonValue };

export const setupDevRoutes = (app: Express) => {
  app.use("/test-api", json(), async (req, res) => {
    const ctx = createContext({ req, res });
    const caller = appRouter.createCaller(ctx);
    const { method, input }: TestRequest = req.body;

    type BaseCaller = typeof caller;
    type BaseCallerKey = keyof BaseCaller;
    const funcParts = method.split(".") as [
      BaseCallerKey,
      ...(keyof BaseCaller[BaseCallerKey])[]
    ];
    const routerKey = funcParts.shift() as BaseCallerKey;
    const baseRouter = caller[routerKey];

    console.log("RUNNING METHOD", method, "\n", "with input\n", input);

    type BaseRouter = typeof baseRouter;
    type BaseRouterKey = Exclude<keyof BaseRouter, "query" | "mutation">;
    type AllRouterKeys = AllKeys<BaseRouter>;
    type Caller =
      | BaseRouter
      | Record<AllRouterKeys, BaseRouter[BaseRouterKey]>
      | Function;
    let callerObj: Caller = baseRouter;
    let response: unknown = {};

    let currentCaller = funcParts.shift() as BaseRouterKey;
    while (currentCaller) {
      if (currentCaller) callerObj = callerObj[currentCaller];
      currentCaller = funcParts.shift() as BaseRouterKey;
    }

    if (typeof callerObj === "function") {
      try {
        const procedure = callerObj as Function;
        response = await procedure(input ?? undefined);
      } catch (e) {
        log.warn(e, "TEST API CALL FAILED.");
        response = {
          error: e,
          message: e && typeof e === "object" && "message" in e && e?.message,
        };
      }
    }

    res.json({ response });
  });
};
