/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#FFEDD5',
          DEFAULT: '#C2410C',
          hover: '#9A3412',
        },
        'neutral-bg': '#F8FAFC',
        'neutral-surface': '#FFFFFF',
        'neutral-border': '#E2E8F0',
        'neutral-textPrimary': '#0F172A',
        'neutral-textSecondary': '#64748B',
        'neutral-textDisabled': '#CBD5E1',
        semantic: {
          success: '#16A34A',
          warning: '#EAB308',
          danger: '#DC2626',
          info: '#2563EB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
