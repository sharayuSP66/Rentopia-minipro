/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F5385D',
        secondary: '#4F46E5', // Indigo-600 for a nice contrast
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}
