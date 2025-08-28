import { z } from "zod";

import { freeProcedure } from "#server/trpc";

import { vFaq } from "./validators";

export const getAllFaqs = freeProcedure
  .output(z.array(vFaq))
  .query(async ({ ctx: { prisma } }) => {
    return prisma.faq.findMany();
  });

export const getFaqById = freeProcedure
  .input(z.string().cuid({ message: "Invalid ID." }))
  .output(z.nullable(vFaq))
  .query(async ({ input, ctx: { prisma } }) => {
    return prisma.faq.findUnique({ where: { id: input } });
  });

export const getFaqByTags = freeProcedure
  .input(z.array(z.string()).min(1))
  .output(z.array(vFaq))
  .query(async ({ input, ctx: { prisma } }) => {
    return prisma.faq.findMany({ where: { tags: { hasSome: input } } });
  });
