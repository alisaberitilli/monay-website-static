import { Faq } from "@prisma/client";
import { z } from "zod";

export const vFaq = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  url: z.nullable(z.string()),
  tags: z.array(z.string()),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.nullable(z.date()),
}) satisfies z.ZodType<Omit<Faq, "jsonData">>;
