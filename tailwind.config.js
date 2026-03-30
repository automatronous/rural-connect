/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        cs: {
          surface: '#f7f9fb',
          'surface-low': '#f2f4f6',
          'surface-mid': '#eef0f4',
          'surface-high': '#e8eaee',
          'surface-highest': '#e2e4e8',
          white: '#ffffff',
          primary: '#003178',
          'primary-dark': '#0d47a1',
          'primary-light': '#dce4f5',
          green: '#1b6d24',
          'green-light': '#d4f5d0',
          cyan: '#9eefff',
          error: '#ba1a1a',
          'error-light': '#ffdad6',
          ink: '#191c1e',
          'ink-secondary': '#434652',
          outline: '#c3c6d4',
          tint: '#2b5bb5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'cs': '0 20px 40px rgba(25, 28, 30, 0.06)',
        'cs-lg': '0 20px 40px rgba(25, 28, 30, 0.12)',
        'cs-hover': '0 8px 24px rgba(0, 49, 120, 0.18)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
