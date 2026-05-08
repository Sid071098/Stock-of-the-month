import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#05070d",
        panel: "#0b1020",
        line: "#1c2741",
        muted: "#94a3b8",
        bull: "#22c55e",
        danger: "#ef4444"
      },
      boxShadow: {
        glow: "0 0 48px rgba(34, 197, 94, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
