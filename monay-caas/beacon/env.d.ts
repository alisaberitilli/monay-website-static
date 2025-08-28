type EnvValue = string | number | boolean | undefined | null;

interface SharedEnv {
  readonly VITE_API_KEY_PATH: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_AMPLITUDE_KEY: string;
  readonly VITE_GMAP_KEY: string;
}

interface ClientEnv extends SharedEnv {
  readonly VITE_SENTRY_DSN: string;
  readonly VITE_SUPABASE_STORAGE_KEY: string;
  readonly VITE_SUPABASE_KEY: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_KEY_EXP: string;
  readonly VITE_API_PATH: string;
  readonly VITE_REMOTEDEV_PORT: string;
  readonly VITE_ROOT_KEY: string;
}

type NodeEnv =
  | "development"
  | "test"
  | "e2e"
  | "storybook"
  | "staging"
  | "production";

interface ServerEnv extends SharedEnv {
  readonly NODE_ENV: NodeEnv;
  readonly DATABAUSE_URL: string;
  readonly JWT_SIGN: string;
  readonly SENTRY_DSN: string;
  readonly OVERRIDE: boolean;
  readonly SUPABASE_KEY: string;
  readonly SERVER_IV: string;
  readonly COMPANY_API_KEY: string;
  readonly VITE_SUPA_DB_PW: string;
  readonly API_KEY: string;
  readonly API_PORT: number;
  readonly XDEX_API_PATH: string;
  readonly GPS_USER_REGISTRATION_PATH: string;
  readonly GPS_LOGIN_PATH: string;
  readonly GPS_SECRET: string;
  readonly GPS_API_PATH: string;
}
