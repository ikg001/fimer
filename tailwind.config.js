/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'firat-blue': '#005CB9',
        'firat-secondary': '#D4AF37',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
      }
    },
  },
  plugins: [],
} 