import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx,jsx,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "synthwave",
      "dracula",
      "coffee",
      "winter",
      "night",
    ],
  },
} satisfies Config;
