/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf6f3',
          100: '#f9ebe4',
          200: '#f0d5c8',
          300: '#e4b8a3',
          400: '#d49a7a',
          500: '#c17a5c',
          600: '#a86548',
          700: '#8f5239',
          800: '#76432f',
          900: '#5c3425',
        },
        terracotta: {
          50: '#fdf6f3',
          100: '#f9ebe4',
          200: '#f0d5c8',
          300: '#e4b8a3',
          400: '#d49a7a',
          500: '#c17a5c',
          600: '#a86548',
          700: '#8f5239',
          800: '#76432f',
          900: '#5c3425',
        },
        charcoal: {
          DEFAULT: '#2d2d2d',
          light: '#3d3d3d',
          dark: '#1d1d1d',
        },
        parchment: {
          DEFAULT: '#f5f1e8',
          light: '#faf8f2',
          dark: '#e8e0d0',
        },
        slate: {
          50: '#faf8f2',
          100: '#f5f1e8',
          200: '#e8e0d0',
          300: '#d4c9b5',
          400: '#a89a82',
          500: '#8a7d68',
          600: '#6b5f4e',
          700: '#4d4438',
          800: '#3d352c',
          900: '#2d2d2d',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
