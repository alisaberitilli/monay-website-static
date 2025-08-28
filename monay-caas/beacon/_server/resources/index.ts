import { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import { router } from "../trpc";
import addressRouter from "./address";
import billerRouter from "./biller";
import faqRouter from "./faq";
import { hydrateClient } from "./hydrate";
import appInputsRouter from "./inputs.queries";
import kybRouter from "./kyb";
import paymentsRouter from "./payments";
import userRouter from "./user";
import xdexRouter from "./xdex";

const appRouter = router({
  user: userRouter,
  faq: faqRouter,
  appInputs: appInputsRouter,
  biller: billerRouter,
  kyb: kybRouter,
  xdex: xdexRouter,
  address: addressRouter,
  hydrate: hydrateClient,
  paymenets: paymentsRouter,
});

export type AppRouter = typeof appRouter;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export default appRouter;
