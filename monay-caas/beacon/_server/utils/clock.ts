import log from "#server/log";

export const sleep = (ms: number): Promise<void> =>
  new Promise((res) => {
    setTimeout(res, ms);
  });

class Timer {
  startTime: bigint;

  constructor(msg?: string) {
    this.startTime = process.hrtime.bigint();
    if (msg) {
      log.info(msg);
    }
  }

  time = (msg?: string) => {
    const endTime = process.hrtime.bigint();
    const timeSpanned = endTime - this.startTime;
    log.info(`${msg} ${msg ? "t" : "T"}ook: ${timeSpanned}ns`);
  };
}
export function clock(message?: string) {
  return new Timer(message);
}
