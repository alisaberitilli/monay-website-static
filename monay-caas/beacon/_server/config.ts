import { stdWarn } from "#server/log";

const isDevEnv = (
  env: NodeEnv | undefined
): env is "development" | "staging" | undefined =>
  env === "development" || env === "staging" || env === undefined;
const isProdEnv = (env: NodeEnv): env is "production" => env === "production";
const isTestEnv = (env: NodeEnv): env is "test" | "e2e" | "storybook" =>
  env === "test" || env === "e2e" || env === "storybook";

interface ConfigEnvVars {
  dev: boolean;
  prod: boolean;
  test: boolean;
}

const buildConfig = <
  T extends Record<string, EnvValue | Record<NodeEnv, EnvValue>>
>(
  configObject: T,
  optionalKeys: (keyof T)[] = []
) => {
  const env = process.env.NODE_ENV;
  const newConfig: T & ConfigEnvVars = {
    dev: isDevEnv(env),
    prod: isProdEnv(env),
    test: isTestEnv(env),
    ...configObject,
  };

  const configEntries = Object.entries(newConfig);
  const missingEntries = configEntries.filter(
    ([key, configValue]) =>
      (configValue === "" ||
        configValue === null ||
        configValue === undefined) &&
      !optionalKeys.includes(key)
  );

  if (missingEntries.length) {
    const error = `Missing the following .env variables: ${missingEntries.map(
      ([k]) => ` ${k}`
    )}`;
    if (env === "development") {
      stdWarn(error);
    } else if (env === "production") {
      throw new Error(error);
    }
  }

  return newConfig;
};

const config = buildConfig({
  iv:
    process.env.IV ??
    process.env.SERVER_ID ??
    "monay-wallet-iv-x12sh389-sh89ef",
  env: process.env.NODE_ENV ?? "development",
  override: process.env.OVERRIDE ?? false,
  port: process.env.API_PORT ?? 3000,
  baseUrl: process.env.BASE_URL ?? "http://localhost",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost",
  clientPort: process.env.CLIENT_PORT ?? 3000,
  expressOnly: process.env.EXPRESS ?? false,
  apiKeyPath: process.env.VITE_API_KEY_PATH ?? "/NO_API_KEY_PATH",
  apiKey: process.env.API_KEY ?? "NO_API_KEY",
  sentryDsn: process.env.SENTRY_DSN ?? "NO_SENTRY_DSN",
  supabaseUrl: process.env.VITE_SUPABASE_URL ?? "NO_SUPABASE_URL",
  supabaseKey: process.env.SUPABASE_KEY ?? "NO_SUPABASE_KEY",
  jwtSecret: process.env.JWT_SIGN ?? "NO_JWT_SECRET",
  xdexApiPath: process.env.XDEX_API_PATH ?? "NO_XDEX_PATH",
  xdexPayPath: process.env.XDEX_PAY_PATH ?? "https://test.monay.com/fetch",
  gmapsKey: process.env.VITE_GMAP_KEY ?? "NO_GMAPS_KEY",
  gpsSecret: process.env.GPS_SECRET ?? "NO_GPS_SECRET",
  gpsApiPath: process.env.GPS_API_PATH ?? "NO_GPS_API_PATH",
});

if (process.env.EXPRESS) {
  stdWarn("RUNNING IN EXPRESS ONLY MODE", true);
}

export default config;
