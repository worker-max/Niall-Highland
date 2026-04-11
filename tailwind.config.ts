import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: "#fefaf0",
          100: "#fdf3dc",
          200: "#fae7b9",
        },
        teal: {
          50: "#effcf9",
          100: "#c6f7ec",
          200: "#8eeddb",
          300: "#5ddfc7",
          400: "#2bc9aa",
          500: "#15b095",
          600: "#0d8c78",
          700: "#0e6e60",
          800: "#0f574e",
          900: "#10433d",
          950: "#052626",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae3",
          300: "#b0b9c9",
          400: "#8592a9",
          500: "#667690",
          600: "#515e77",
          700: "#414c61",
          800: "#384052",
          900: "#323946",
          950: "#1a1d26",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16, 67, 61, 0.04), 0 4px 16px rgba(16, 67, 61, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
