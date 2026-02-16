/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E4FA1',
          dark: '#163A7A',
          light: '#4DA3FF',
        },
        accent: '#4DA3FF',
        background: {
          dark: '#0A0F1C',
          DEFAULT: '#F8FAFC',
        },
        text: {
          light: '#EAEFF7',
          dark: '#1A202C',
        },
        severity: {
          critical: '#DC2626',
          high: '#F59E0B',
          medium: '#10B981',
          low: '#3B82F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['Cairo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
