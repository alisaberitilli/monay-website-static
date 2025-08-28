import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { schema } from "./prisma-scripts";

interface EnumMember {
  type: "enumerator";
  name: string;
  comment?: string;
}

interface EnumAst {
  type: "enum";
  name: string;
  enumerators: EnumMember[];
}

function buildTscEnum(e: EnumAst) {
  const enumName = `${e.name}Enum`;
  return `export enum ${enumName} {\n${e.enumerators
    .map((mem) => `  ${mem.name} = "${mem.name}",`)
    .join("\n")}\n}\nexport type ${e.name} = \`\${${enumName}}\`;`;
}

function buildEnums(e: EnumAst[]) {
  return e.map((en) => `${buildTscEnum(en)}`).join("\n\n");
}

(() => {
  const enums = schema.list.filter((l) => l.type === "enum");
  const now = new Date();
  const date = now.toLocaleDateString("en-US");
  const time = now.toLocaleTimeString("en-US");
  const enumString = buildEnums(enums as EnumAst[]);
  const fileString = `// Last updated: ${date} ${time}\n\n${enumString}\n`;
  writeFileSync(
    resolve(__dirname, "..", "_client", "renderer", "src", "store", "enum.ts"),
    fileString,
    { encoding: "utf-8" }
  );
})();
