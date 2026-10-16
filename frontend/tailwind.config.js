/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'cop-bg': '#0a0e1a',
        'cop-surface': '#0f1629',
        'cop-card': '#141c2e',
        'cop-border': '#1e2d4a',
        'cop-accent': '#1a3a6e',
        'cop-blue': '#2563eb',
        'cop-gold': '#f59e0b',
        'cop-green': '#10b981',
        'cop-red': '#ef4444',
        'cop-orange': '#f97316',
        'cop-violet': '#8b5cf6',
        'cop-pink': '#ec4899',
        'cop-cyan': '#06b6d4',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flash': 'flash 0.5s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          'from': { boxShadow: '0 0 5px rgba(245, 158, 11, 0.3)' },
          'to': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.8), 0 0 40px rgba(245, 158, 11, 0.4)' },
        },
        flash: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
    },
  },
  plugins: [],
};
