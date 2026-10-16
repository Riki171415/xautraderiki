/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep obsidian & slate surfaces
        'cop-bg': '#0a0e14',
        'cop-surface': '#10161f',
        'cop-card': '#151d28',
        'cop-card-hover': '#1b2735',
        'cop-border': '#2a3543',
        'cop-border-subtle': '#141e33',
        'cop-accent': '#1e335a',
        
        // Brand & Trading Accents
        'cop-gold': '#cba86c',
        'cop-gold-light': '#e6cd9c',
        'cop-gold-dark': '#b45309',
        
        // Bullish (Naik / Buy)
        'cop-green': '#10b981',
        'cop-emerald': '#10b981',
        
        // Bearish (Turun / Sell)
        'cop-red': '#f43f5e',
        'cop-rose': '#f43f5e',
        
        // Utility & Structural Accents
        'cop-blue': '#3b82f6',
        'cop-cyan': '#06b6d4',
        'cop-violet': '#8b5cf6',
        'cop-orange': '#f97316',
        'cop-pink': '#ec4899',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 20px -3px rgba(245, 158, 11, 0.35)',
        'glow-gold-sm': '0 0 10px -2px rgba(245, 158, 11, 0.25)',
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
        'glow-green-sm': '0 0 10px -2px rgba(16, 185, 129, 0.25)',
        'glow-red': '0 0 20px -3px rgba(244, 63, 94, 0.35)',
        'glow-red-sm': '0 0 10px -2px rgba(244, 63, 94, 0.25)',
        'glow-blue': '0 0 20px -3px rgba(59, 130, 246, 0.35)',
        'card-elevated': '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-subtle': 'glowSubtle 3s ease-in-out infinite alternate',
        'tick-flash': 'tickFlash 0.6s ease-out',
      },
      keyframes: {
        glowSubtle: {
          '0%': { boxShadow: '0 0 8px rgba(245, 158, 11, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(245, 158, 11, 0.45)' },
        },
        tickFlash: {
          '0%': { opacity: '0.4', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
