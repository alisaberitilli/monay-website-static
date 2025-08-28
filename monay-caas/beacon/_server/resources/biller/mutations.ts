//ModelClauseInput
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  /* BillerFindManySchema, */
  BillerWhereInputObjectSchema,
} from "#schema";
// import adminAuthClient from "#server/services/session";
// import { z } from "zod";
// import adminAuthClient from "#server/services/session";
import { authProcedure, freeProcedure } from "#server/trpc";

// import { findBillerInput, findBillerOutPut } from "./validators";

export const findBiller = authProcedure
  .input(BillerWhereInputObjectSchema)
  // .output(findBillerOutPut)
  .query(async ({ input, ctx: { prisma } }) => {
    const biller = await prisma.biller.findFirst({
      where: { name: input.name },
    });
    if (!biller) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No Info Data found corresponding to the biller name.",
      });
    }
    return biller;
  });
