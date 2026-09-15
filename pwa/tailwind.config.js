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
          'surface-subtle': 'var(--zen-surface-subtle)',
          border: 'var(--zen-border)',
          'border-selected': 'var(--zen-border-selected)',
          'text-primary': 'var(--zen-text-primary)',
          'text-secondary': 'var(--zen-text-secondary)',
          'text-tertiary': 'var(--zen-text-tertiary)',
        },
        // 8 Soothing Category Accent Colors from Android Color.kt
        accent: {
          emerald: '#437A55',
          ocean: '#386B80',
          terracotta: '#B55D46',
          lavender: '#6B5F8C',
          ochre: '#A67B34',
          rose: '#9E4E68',
          sky: '#3A7D99',
          sage: '#5D8464',
        },
        // Daily Heatmap Activity Intensity Levels from Android Color.kt
        heatmap: {
          0: 'var(--zen-heatmap-0)',
          1: '#C3DBC5',
          2: '#8FB791',
          3: '#57915B',
          4: '#2E6B34',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
        '4xl': '1.5rem',
      },
      boxShadow: {
        'zen': '0 2px 12px -1px rgba(0, 0, 0, 0.04)',
        'zen-dark': '0 2px 12px -1px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}
