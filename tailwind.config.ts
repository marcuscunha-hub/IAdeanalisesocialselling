import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: "#061f00",
        moss:   "#003a0b",
        lime:   "#a5e119",
        grass:  "#09cf58",
        olive:  "#61881e",
        coral:  "#ed502f",
        lake:   "#7aada6",
        beige: {
          DEFAULT: "#fbfbf6",
          25:      "#f9f9ef",
          50:      "#edede1",
          100:     "#b8b89e",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Georgia", "serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
