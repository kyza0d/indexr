/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class", // or 'media' or 'class
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            ["*"]: {
              ["margin-top"]: "unset",
              ["margin-bottom"]: "unset",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
