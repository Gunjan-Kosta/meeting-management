/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gov: {
          blue: '#1e3a8a',
          accent: '#2563eb',
          light: '#f1f5f9',
          dark: '#0f172a',
          card: '#ffffff',
          border: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
};
