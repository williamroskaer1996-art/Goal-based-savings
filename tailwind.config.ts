import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Triodos Grounded scale
        'grounded-green': '#004B32',
        'grounded-lupine': '#8074FF',
        'energised-green': '#DFFF57',
        'energised-lupine': '#C2CBFA',
        'principled-green': '#98D38A',
        charcoal: '#222222',
        'birch-skin': '#F3EDE4',
        'sienna-spark': '#FF6400',
      },
      fontFamily: {
        display: ['"RB Freigeist Neue"', 'Syne', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0, 75, 50, 0.04), 0 4px 12px rgba(0, 75, 50, 0.04)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.85)', opacity: '0.6' },
          '70%': { transform: 'scale(1.4)', opacity: '0' },
          '100%': { transform: 'scale(1.4)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        fadeIn: 'fadeIn 0.4s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
