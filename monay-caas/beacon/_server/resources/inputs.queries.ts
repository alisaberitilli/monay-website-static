import {
  BusinessType,
  DbaContactType,
  FulfillmentType,
  TaxIdType,
} from "@prisma/client";
import { z } from "zod";

import config from "#server/config";
import { freeProcedure } from "#server/trpc";
import { router } from "#server/trpc";

const getFulfillmentTypes = freeProcedure.query(() =>
  Object.values(FulfillmentType)
);

const getBusinessTypes = freeProcedure.query(() => Object.values(BusinessType));

const getTaxIdTypes = freeProcedure.query(() => Object.values(TaxIdType));

const getDbaContactTypes = freeProcedure.query(() =>
  Object.values(DbaContactType)
);

const getLocales = freeProcedure.query(({ ctx: { prisma } }) => {
  return prisma.locale.findMany({
    select: {
      code: true,
      countries: {
        select: {
          name: true,
          callingCode: true,
          code: true,
          flag: true,
        },
      },
      debugDescription: config.dev,
      name: true,
    },
    where: {
      countries: {
        some: {
          status: "ACTIVE",
        },
      },
    },
  });
});

const getCountries = freeProcedure.query(({ ctx: { prisma } }) => {
  return prisma.country.findMany({
    select: {
      name: true,
      callingCode: true,
      code: true,
      flag: true,
      defaultLocale: {
        select: {
          code: true,
          debugDescription: config.dev,
          name: true,
        },
      },
    },
    where: {
      status: "ACTIVE",
    },
  });
});

const getInputs = freeProcedure
  .input(z.string().min(5))
  .query(({ input, ctx: { prisma } }) =>
    prisma.applicationInput.findMany({
      where: { localeCode: input },
      select: { type: true, inputData: true },
    })
  );

const appInputsRouter = router({
  getFulfillmentTypes,
  getBusinessTypes,
  getTaxIdTypes,
  getDbaContactTypes,
  getLocales,
  getCountries,
  getInputs,
});

export default appInputsRouter;
