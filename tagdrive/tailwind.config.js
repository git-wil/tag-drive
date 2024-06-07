import { nextui } from "@nextui-org/react";
import { TAG_COLORS } from "./src/assets/constants"

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  darkMode: "class",
  plugins: [nextui({ defaultTheme: "dark" })],
  safelist: [
    "ps-5", "ps-10", "ps-15", "ps-20", "ps-25", "ps-30", "ps-35", "ps-40", "ps-45", "ps-50",
    ...TAG_COLORS.map((color) => `bg-${color}`)
  ],
}

