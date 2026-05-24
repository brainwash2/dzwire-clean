import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      // -----------------------------------------------------------------------
      // Declare scrolling keyframes natively to prevent PurgeCSS stripping
      // -----------------------------------------------------------------------
      animation: {
        "scroll-ticker": "scroll-ticker 35s linear infinite",
      },
      keyframes: {
        "scroll-ticker": {
          "0%": { transform: "translate3d(0, 0, 0)" },
          "100%": { transform: "translate3d(-33.3333%, 0, 0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
