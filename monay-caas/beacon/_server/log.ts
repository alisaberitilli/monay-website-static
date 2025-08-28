import { type Response } from "express";
import morgan from "morgan";
import pino from "pino";
import logger from "pino-http";
// @ts-ignore no declaration file
import noir from "pino-noir";

import config from "./config";

export function stdWarn(text: string, n?: boolean) {
  const warning = `   ${text}    `;
  const spaceAmount = warning.length + 1;
  const magentaCode = "\x1b[45m";
  const italicsCode = "\x1b[3m";
  const resetCode = "\x1b[0m";

  const newLine = `  ${magentaCode}${new Array(spaceAmount).join(
    " "
  )}${resetCode}`;
  console.info();
  const warningText = `  ${magentaCode}${italicsCode}${warning}${resetCode}`;
  [0, 0, 0].forEach((_, i) => {
    // eslint-disable-next-line
    console.warn(i === 1 ? warningText : newLine);
  });
  if (n) console.info();
}

const COLORS = {
  yellow: 33,
  green: 32,
  blue: 34,
  red: 31,
  grey: 90,
  magenta: 35,
  clear: 39,
};

export const colorize = (color: keyof typeof COLORS, string?: string) =>
  `\u001b[${COLORS[color]}m${string}\u001b[${COLORS.clear}m`;

// nested keys follow {key}.{nested key} format
const redactedKeys = noir([]);

const log = pino({
  transport: {
    target: config.env === "development" ? "pino-pretty" : "",
    options: {
      colorize: config.env === "development",
    },
  },
  serializers: redactedKeys,
});

export const attachLogger = logger({
  logger: log,
  useLevel: config.env === "development" ? "debug" : "info",
});

morgan.token(
  "message",
  (req, res) => (res as Response).locals.errorMessage ?? ""
);
const getIpFormat = () =>
  config.env === "production" ? ":remote-addr - " : "";
const successRespFmt = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorRespFmt = `${successRespFmt} - message: :message`;

export const successHandler = morgan(successRespFmt, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => log.info(message.trim()) },
});

export const errorHandler = morgan(errorRespFmt, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => log.error(message.trim()) },
});

export default log;
