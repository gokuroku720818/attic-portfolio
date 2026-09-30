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
        attic: {
          dark: '#0f172a',
          card: '#1e293b',
          amber: '#f59e0b',
          wood: '#451a03',
          warm: '#fef3c7',
        }
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-short': 'bounce 1s ease-in-out 3',
      }
    },
  },
  plugins: [],
}
