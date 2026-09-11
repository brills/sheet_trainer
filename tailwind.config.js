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
        brand: {
          50: '#fdfbf7',
          100: '#f5ede1',
          200: '#ecd9c5',
          300: '#d4bda8',
          500: '#b46d29',
          600: '#8c531b',
          700: '#734212',
          800: '#5a330e',
        },
        linen: {
          50: '#faf8f5',
          100: '#f7f4ee',
          200: '#eee9df',
          300: '#e4ddcf',
          400: '#ddd6c8',
          500: '#c8bfaa',
          600: '#948b7e',
          700: '#6b6358',
          800: '#38332d',
          900: '#25211d',
        }
      },
      fontFamily: {
        serif: ['Cinzel', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
