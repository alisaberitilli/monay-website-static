import * as path from "node:path";
import { getSchema } from "@mrleebo/prisma-ast";
import { readFileSync } from "node:fs";

const prismaSchema = readFileSync(path.resolve("prisma", "schema.prisma"), {
  encoding: "utf-8",
});
const schemaAst = getSchema(prismaSchema);

export const schema = schemaAst;
