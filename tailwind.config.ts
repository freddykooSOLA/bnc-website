import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#082a2c',
          50: '#f0f4f4',
          100: '#d9e4e4',
          700: '#061e20',
          800: '#041618',
        },
        orange: {
          DEFAULT: '#f7931e',
          50: '#fff8f0',
          100: '#feecd6',
          600: '#e07d0a',
          700: '#b86308',
        },
        sand: {
          DEFAULT: '#e8a87c',
          100: '#fdf0e8',
        },
        'light-bg': '#f0f4f4',
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'sans-serif'],
        heading: ['var(--font-montserrat)', 'var(--font-inter)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
