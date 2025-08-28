import react from "@vitejs/plugin-react";
import {
  bytecodePlugin,
  defineConfig,
  defineViteConfig,
  externalizeDepsPlugin,
} from "electron-vite";
import { resolve } from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  main: {
    build: {
      lib: {
        entry: "_client/main/index.ts",
      },
    },
    plugins: [externalizeDepsPlugin(), bytecodePlugin()],
  },
  preload: {
    build: {
      lib: {
        entry: "_client/preload/index.ts",
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: defineViteConfig({
    root: "_client/renderer",
    build: {
      lib: {
        entry: "_client/renderer/index.html",
      },
      rollupOptions: {
        input: "_client/renderer/index.html",
      },
    },
    resolve: {
      alias: {
        "#client": resolve("_client/renderer/src"),
        "#constants": resolve("constants.ts"),
        "#helpers": resolve("helpers.ts"),
      },
    },
    plugins: [
      svgr({
        svgrOptions: {
          plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
          svgoConfig: {
            plugins: [
              "preset-default",
              "removeTitle",
              "removeDesc",
              "removeDoctype",
              "cleanupIds",
              "removeUselessDefs",
            ],
          },
        },
      }),
      react(),
    ],
    envPrefix: "VITE_",
    define: {
      // THIS USES A REALLY LAME AND BASIC GLOB MATCHING PATTERN TO REPLACE THINGS THROUGHOUT THE ENTIRE FRONTEND, DO NOT USE THIS
    },
  }),
});
