/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulse: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.7)' },
          '50%': { boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)' },
        },
      },
      animation: {
        shine: 'shine 0.6s ease-in-out',
        pulse: 'pulse 2s infinite',
      },
    },
  },
  plugins: [],
};
