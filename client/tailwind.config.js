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
          50: '#f3f0ff',
          100: '#e6dcff',
          200: '#cdb7ff',
          300: '#ac8bff',
          400: '#8f63ff',
          500: '#7c4dff',
          600: '#6638e6',
          700: '#5029b8',
          800: '#3a1f8a',
          900: '#1f1347',
        },
        teal: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#14b8a6',
          600: '#0f766e',
          700: '#115e59',
          800: '#134e4a',
          900: '#042f2e',
        },
        charcoal: {
          DEFAULT: '#07050f',
          light: '#140b24',
          dark: '#030208',
        },
        parchment: {
          DEFAULT: '#f7f4ff',
          light: '#fbf8ff',
          dark: '#e8deff',
        },
        cloud: {
          DEFAULT: '#f4f7ff',
          light: '#f8fbff',
          dark: '#dce6ff',
        },
        slate: {
          50: '#f5f7ff',
          100: '#eceffd',
          200: '#d9def0',
          300: '#b9c1dd',
          400: '#8d95b3',
          500: '#66708d',
          600: '#4c556e',
          700: '#343c53',
          800: '#1f2436',
          900: '#07050f',
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
