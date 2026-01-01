import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,tsx,jsx,mdx}",
    "./components/**/*.{js,ts,tsx,jsx,mdx}",
    "./lib/**/*.{js,ts,tsx,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        awake: {
          bone: "#F9F8F4",      // Background canvas
          moss: "#4A5D44",      // Primary Text / Nature
          lavender: "#9D92A3",  // Smoked Lavender / Accents
          cream: "#FDFCF8",     // Surface cards
          sage: "#8FA87A",      // Harmony / Flow (Green)
          gold: "#D9C589",      // Attention (Amber)
          terracotta: "#C48F8F" // Imbalance (Red)
        }
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "serif"],
        sans: ["var(--font-outfit)", "sans-serif"],
      },
      borderRadius: {
        "3xl": "2rem",
        "4xl": "3rem",
      },
      boxShadow: {
        'awake-soft': '0 10px 50px -12px rgba(74, 93, 68, 0.08)',
        'awake-floating': '0 20px 70px -15px rgba(74, 93, 68, 0.12)',
      },
    },
  },
  plugins: [],
};
export default config;
