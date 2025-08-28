import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const parseColumnValue = (val: string) => {
  if (!isNaN(parseFloat(val))) return parseFloat(val);
  if (!isNaN(new Date(val).valueOf())) return new Date(val);
  return val;
};

(async () => {
  const basePath = resolve("..");
  const files = [
    "MOCK_B2B_INVOICES.csv",
    "MOCK_BILLER.csv",
    "MOCK_INVOICES.csv",
    "MOCK_PARTNER.csv",
  ];
  const savePath = resolve("prisma", "seed");

  await Promise.all(
    files.map(async (fileName) => {
      const file = readFileSync(resolve(basePath, fileName), {
        encoding: "utf-8",
      });
      const rows = file.split("\r\n");
      const table = rows.map((row) => row.split(","));
      const header = table[0].map((headerCol) => headerCol.replace(/\s/gi, ""));
      const data = table.slice(1);
      const jsonData: object[] = [];
      data.forEach((datum) => {
        const json = {};
        datum.forEach((col, i) => {
          if (header[i]) {
            json[header[i]] = parseColumnValue(col.replace(/\s/gi, ""));
          }
        });
        if (Object.keys(json).length) {
          jsonData.push(json);
        }
      });
      console.log(fileName, jsonData);
    })
  );
})();
qceir
