/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d5e0ff',
          300: '#adc1ff',
          400: '#809eff',
          500: '#4d6eff',
          600: '#3b5bdb',
          700: '#2b4beb',
          800: '#1a35c4',
          900: '#0f208a',
        },
        darkBg: '#0f172a',
        darkCard: '#1e293b',
        darkBorder: '#334155'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
