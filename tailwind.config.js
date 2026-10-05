/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        emerald: { DEFAULT: '#12382E', 700: '#1a4a3d', 900: '#0c2720' },
        cream: { DEFAULT: '#F6F1E6', 200: '#ece5d4' },
        brass: { DEFAULT: '#C7A24A', 600: '#8a6d22' },
        charcoal: '#202421',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
      },
      maxWidth: { content: '1200px' },
      borderRadius: { card: '18px', btn: '12px' },
    },
  },
  plugins: [],
}
