import { nextui } from "@nextui-org/react";


export const tag_colors = [
  "red-800",
  "pink-800",
  "purple-800",
  "indigo-800",
  "blue-800",
  "cyan-800",
  "teal-700",
  "green-800",
  "lime-700",
  "yellow-600",
  "amber-700",
  "orange-800",
]

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
    ...tag_colors.map((color) => `bg-${color}`), ...tag_colors.map((color) => `text-${color}-contrast`)
  ],
}

