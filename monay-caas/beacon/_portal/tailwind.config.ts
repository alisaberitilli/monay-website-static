import { type Config } from "tailwindcss";

import config from "../tailwind.config";

export default {
  ...config,
  content: ["./src/**/*.tsx"],
} satisfies Config;
