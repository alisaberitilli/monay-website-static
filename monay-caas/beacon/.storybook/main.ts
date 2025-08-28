import type { StorybookConfig } from "@storybook/react-vite";
import { mergeConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import svgr from "vite-plugin-svgr";

const config: StorybookConfig = {
  stories: ["../_client/**/*.mdx", "../_client/**/*.stories.@(js|jsx|ts|tsx)", "../_client/stories/**/*.md"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    {
      name: "@storybook/addon-styling",
      options: {
        // Check out https://github.com/storybookjs/addon-styling/blob/main/docs/api.md
        // For more details on this addon's options.
      },
    },
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {
    },
  },
  docs: {
    autodocs: "tag",
  },
  core: {
    
    disableTelemetry: true,
  },
  staticDirs: ["../resources", "../_client/renderer/src/assets"],
  env: (config) => ({
    ...config,
  }),
  viteFinal(config, { configType }) {
    return mergeConfig(config, {
      plugins: [tsconfigPaths(), svgr()],
    });
  },
};
export default config;
