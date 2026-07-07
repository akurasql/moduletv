import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#0A84FF", // Apple's system blue
        },
        apple: {
          black: "#000000",
          nearBlack: "#0B0B0D",
          darkGray: "#15151A",
          gray: "#2C2C35",
          lightGray: "#A1A1AA",
          white: "#FFFFFF",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      transitionTimingFunction: {
        "apple-ease": "cubic-bezier(0.32, 0.72, 0, 1)", // Standard spring-ish ease
      },
    },
  },
  plugins: [],
};
export default config;
