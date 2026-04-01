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
          surface: '#FFFFFF',
          'surface-low': '#F4F7FA',
          'surface-mid': '#E8EEF5',
          'surface-high': '#D9E3EE',
          'surface-highest': '#BDD0E4',
          white: '#FFFFFF',
          primary: '#0066CC',
          'primary-dark': '#0052A3',
          'primary-light': '#E9F4FF',
          teal: '#14869C',
          'teal-light': '#E3F6FA',
          green: '#1F9D55',
          'green-light': '#DCFCE7',
          cyan: '#BDEBFF',
          warning: '#B7791F',
          'warning-light': '#FFF7E0',
          error: '#D64545',
          'error-light': '#FDECEC',
          ink: '#1A2B4A',
          'ink-secondary': '#4A5568',
          outline: '#D9E3EE',
          tint: '#0066CC',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Manrope', 'sans-serif'],
      },
      boxShadow: {
        cs: '0 12px 32px -20px rgba(26, 43, 74, 0.24)',
        'cs-lg': '0 20px 40px -24px rgba(26, 43, 74, 0.28)',
        'cs-hover': '0 24px 48px -24px rgba(0, 102, 204, 0.28)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
    },
  },
  plugins: [],
};
