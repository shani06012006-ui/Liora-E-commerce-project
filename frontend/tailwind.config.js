/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2D2D2D',
        secondary: '#5C5C5C',
        accent: '#B4A5A5',
        background: '#FAF8F5',
        bg: '#FAF8F5',
        surface: '#FFFFFF',
        muted: '#EAE7E2',
        highlight: '#C4B7A6',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'serif': ['Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}