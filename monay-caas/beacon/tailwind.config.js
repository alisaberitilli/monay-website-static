/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./_client/renderer/src/**/*.{ts,tsx,css}",
    "./_client/renderer/index.html",
  ],
  // eslint-disable-next-line quotes
  darkMode: ["class", '[data-mode="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        header: "var(--font-header)",
        sans: "var(--font-body)",
        body: "var(--font-body)",
        mono: "var(--font-mono)",
      },
      colors: {
        "purple-one": "#7B61FF",
        "purple-two": "#564DCD",
        gray: "#8B9EB0",
        base: "rgb(var(--color-base) / <alpha-value>)",
        darkbg: "rgb(var(--color-bg-dark) / <alpha-value>)",
        lightbg: "rgb(var(--color-bg-light) / <alpha-value>)",
        dark: "#CDD7DD",
        light: "#113A62",
        list: "rgb(var(--color-list) / <alpha-value>)",
        faded: "rgb(var(--color-faded) / <alpha-value>)",
        fadedBg: "rgb(var(--color-faded-bg) / <alpha-value>)",
      },
      keyframes: {
        shimmer: {
          "100%": {
            transform: "translateX(100%)",
          },
        },
      },
    },
    screens: {
      sm: "600px",
      md: "768px",
      lg: "1024px",
      xl: "1200px",
    },
  },
  plugins: [
    require("@tailwindcss/container-queries"),
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/forms"),
    require("tailwind-scrollbar"),
    require("tailwind-children"),
  ],
};
