import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#07111f',
        panel: 'rgba(8, 15, 28, 0.74)',
        skyGlow: '#67e8f9',
        limeGlow: '#a3e635',
      },
      boxShadow: {
        halo: '0 24px 80px rgba(15, 23, 42, 0.45)',
      },
      backgroundImage: {
        academyRadial:
          'radial-gradient(circle at top, rgba(72, 219, 251, 0.2), transparent 35%), linear-gradient(160deg, #07111f 0%, #0c1d33 48%, #111827 100%)',
      },
    },
  },
  plugins: [],
};

export default config;