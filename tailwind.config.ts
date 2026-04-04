import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // <-- ISSO AQUI É O MAIS IMPORTANTE
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default config;