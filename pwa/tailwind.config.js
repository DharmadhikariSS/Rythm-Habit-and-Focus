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
        zen: {
          bg: 'var(--zen-bg)',
          surface: 'var(--zen-surface)',
          card: 'var(--zen-card)',
          border: 'var(--zen-border)',
          forest: 'var(--zen-forest)',
          accent: 'var(--zen-accent)',
          text: 'var(--zen-text)',
          muted: 'var(--zen-muted)',
          subtle: 'var(--zen-subtle)',
          highlight: 'var(--zen-highlight)',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'zen': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'zen-dark': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
}
