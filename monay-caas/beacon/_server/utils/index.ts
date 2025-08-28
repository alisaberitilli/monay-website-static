import type { IncomingHttpHeaders } from "node:http";

import * as clock from "./clock";
import * as crypto from "./crypto";

export const collapseHeader = (header?: string | string[]) => {
  if (header) {
    if (Array.isArray(header)) {
      return header.join(";");
    }
    return header;
  }
  return "";
};

export const collapseHeaders = <T extends string>(
  headerKeys: T[],
  headers: IncomingHttpHeaders
) => headerKeys.map((key) => collapseHeader(headers[key]));

export const env = (ENV_VAR: string) => {
  if (!process.env[ENV_VAR]) {
    throw new Error(`env var ${ENV_VAR} is missing from .env`);
  }

  return process.env[ENV_VAR] ?? "";
};

export default {
  ...crypto,
  ...clock,
};
