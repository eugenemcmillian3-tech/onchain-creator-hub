import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        base: {
          DEFAULT: '#0052FF',
          dark: '#0040CC',
          light: '#3366FF',
        },
        primary: {
          DEFAULT: '#0052FF',
          dark: '#0040CC',
          light: '#3366FF',
        },
        background: '#0F172A',
        surface: {
          DEFAULT: '#1E293B',
          light: '#334155',
        },
        text: {
          DEFAULT: '#F8FAFC',
          muted: '#94A3B8',
        },
        border: {
          DEFAULT: '#334155',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        full: '9999px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}
export default config
