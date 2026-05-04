import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-space-grotesk), var(--font-poppins), var(--font-inter)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      colors: {
        // Academia.io Logo Palette - Extracted from brand logo
        primary: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c1d3ff',
          300: '#a2bdff',
          400: '#6b93ff',
          500: '#0052CC', // Primary Blue - strong brand color
          600: '#0047b8',
          700: '#003da4',
          800: '#003290',
          900: '#00287c',
        },
        accent: {
          blue: '#0066FF',      // Secondary Blue (m from logo)
          pink: '#FF4D94',      // Pink/Magenta (c from logo)
          green: '#4CAF50',     // Green (a from logo)
          orange: '#FFA500',    // Orange/Gold (d from logo)
          red: '#FF6B6B',       // Red/Coral (e from logo)
          purple: '#7C3AED',    // Purple (i from logo)
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        edu: '0 8px 16px -2px rgba(107, 79, 248, 0.1)',
      },
      borderRadius: {
        lg: '12px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};

export default config;