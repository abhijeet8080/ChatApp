/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {  // Add 'colors' here
        primary: "#00acb4",  // Custom primary color
        secondary:"#058187"
      },
    },
  },
  plugins: [],
}
