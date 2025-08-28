import * as Sentry from "@sentry/node";

import config from "#server/config";

export const apmHandler = Sentry.Handlers.requestHandler;
export const traceHandler = Sentry.Handlers.tracingHandler;

if (!config.expressOnly) {
  Sentry.init({
    dsn: config.sentryDsn,
    integrations: [
      new Sentry.Integrations.LocalVariables({ captureAllExceptions: true }),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.RequestData({
        include: {
          ip: true,
        },
      }),
      // new Sentry.Integrations.Prisma({ client: limitedPrisma }),
    ],
    tracesSampleRate: config.env === "development" ? 1.0 : 0.2,
    environment: config.env,
    beforeSend: (event, hint) => {
      return event;
    },
  });
}
