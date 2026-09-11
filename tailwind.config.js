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
        theme: {
          canvas: 'var(--bg-canvas, #f7f4ee)',
          card: 'var(--bg-card, #fcfbfa)',
          panel: 'var(--bg-panel, #eee9df)',
          panelElevated: 'var(--bg-panel-elevated, #e4ddcf)',
          border: 'var(--border-subtle, #ddd6c8)',
          borderStrong: 'var(--border-strong, #c8bfaa)',
          primary: 'var(--text-primary, #38332d)',
          muted: 'var(--text-muted, #6b6358)',
          dim: 'var(--text-dim, #8a8275)',
          accent: 'var(--accent, #8c531b)',
          'accent-tint': 'var(--accent-tint, #f5ede1)',
          'accent-border': 'var(--accent-border, #d4bda8)',
          success: 'var(--success, #2d5736)',
          'success-tint': 'var(--success-tint, #eef5ef)',
          'success-border': 'var(--success-border, #bcd4bf)',
          error: 'var(--error, #9c382e)',
          'error-tint': 'var(--error-tint, #fbeeed)',
          'error-border': 'var(--error-border, #e2bdb8)',
          backdrop: 'var(--backdrop, rgba(43, 38, 32, 0.45))',
        },
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
        serif: ['"EB Garamond"', 'Cormorant Garamond', 'serif'],
        cormorant: ['Cormorant Garamond', 'serif'],
        sans: ['Plus Jakarta Sans', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      }
    },
  },
  plugins: [],
}
