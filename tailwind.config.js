/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 暖棕色调 - 与 global.css 同步
        warm: {
          bg: '#1a1612',
          bgSecondary: '#252220',
          bgTertiary: '#3a3530',
          text: '#e8e0d5',
          textSecondary: '#a99d92',
          border: '#4a4238',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false, // 禁用Tailwind重置，避免与Ant Design冲突
  }
}
