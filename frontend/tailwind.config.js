/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {  // Add 'colors' here
        primary: "#7800bc",  // Custom primary color
        secondary:"#703990"
      },
    },
  },
  plugins: [],
}
