/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0A0A0F',
          900: '#111118',
          800: '#1A1A24',
          700: '#252535',
          600: '#32324A',
        },
        volt: {
          400: '#C8FF00',
          500: '#AADD00',
          600: '#88BB00',
        },
        slate: {
          400: '#94A3B8',
          500: '#64748B',
        }
      }
    }
  },
  plugins: []
}
