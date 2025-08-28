/// <reference types="../env.d.ts" />

declare global {
  namespace NodeJS {
    // eslint-disable-next-line
    interface ProcessEnv extends ServerEnv {};
  }
}

export {};
