/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f5f7',
          100: '#e9ebf0',
          200: '#c7ccd6',
          300: '#a5adbd',
          400: '#616f8a',
          500: '#1d3157', // Slate dark blue
          600: '#1a2c4e',
          700: '#162541',
          800: '#111d34',
          900: '#0e182b',
          950: '#090f1b',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b', // Gold / Amber
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
