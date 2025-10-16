import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        purple: {
          950: '#1a0b2e',
          900: '#2d1b4e',
          800: '#3d2660',
          700: '#4d3070',
          600: '#6d3f9e',
        },
      },
    },
  },
  plugins: [],
};
export default config;
