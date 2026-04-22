/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf2f7',
          100: '#fbe6f1',
          200: '#f7cde3',
          300: '#f1a5cc',
          400: '#e872ad',
          500: '#d74488',
          600: '#c0276a',
          700: '#a51648', // Brand burgundy
          800: '#8b163e',
          900: '#751737',
          950: '#2d0a14', // Deeper for premium contrast
        },
        accent: {
          DEFAULT: '#C9A961', // Antique gold — softer, luxury retail
          light: '#E8DCC4',
          dark: '#8B7355',
          bright: '#E5D4A1',
        },
        premium: {
          ivory: '#F7F5F0',
          pearl: '#EFEBE4',
          champagne: '#E8DFD0',
          wine: '#6B1028',
          goldline: '#D4BC7E',
        },
        neutral: {
          cream: '#FAF9F6',
          beige: '#F5F0E8',
          white: '#FFFFFF',
          softGray: '#F3F4F6',
          darkGray: '#4B5563',
          black: '#141212', // Softer than pure black for body text
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(20, 18, 18, 0.06)',
        premium: '0 12px 48px -12px rgba(107, 16, 40, 0.12), 0 4px 16px -4px rgba(0, 0, 0, 0.04)',
        lift: '0 20px 50px -20px rgba(45, 10, 20, 0.15)',
        innerWarm: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.6)',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        luxury: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        400: '400ms',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'float-y': 'floatY 2.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        floatY: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(8px)' },
        },
      }
    },
  },
  plugins: [],
}
