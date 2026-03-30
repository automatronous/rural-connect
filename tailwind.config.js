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
          surface: '#F8FAFC',       // Extremely soft blue-gray / slate-50
          'surface-low': '#F1F5F9', // slate-100
          'surface-mid': '#E2E8F0', // slate-200
          'surface-high': '#CBD5E1',// slate-300
          'surface-highest': '#94A3B8', // slate-400
          white: '#FFFFFF',
          primary: '#003B95',       // Extracted solid deep blue
          'primary-dark': '#06265B',
          'primary-light': '#E0E7FF',
          green: '#15803D',
          'green-light': '#DCFCE7',
          cyan: '#A5F3FC',
          error: '#D32F2F',         // Flat danger red
          'error-light': '#FEE2E2',
          ink: '#0F172A',           // Dark slate for text
          'ink-secondary': '#64748B', // Slate grey for secondary text
          outline: '#E2E8F0',
          tint: '#003B95',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        'cs': '0 4px 24px -2px rgba(0, 0, 0, 0.04)',
        'cs-lg': '0 10px 32px -4px rgba(0, 0, 0, 0.08)',
        'cs-hover': '0 16px 48px -8px rgba(0, 59, 149, 0.12)',
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
