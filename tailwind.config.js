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
        postech: {
          DEFAULT: '#ff3370',
          hover: '#ff4d82',
          light: '#ff6699',
          dark: '#e6004c',
          bg: '#2a1620'
        },
        dark: {
          bg: '#18181b',       // zinc-900
          card: '#222226',     // 조금 더 밝은 카드 배경
          subcard: '#2b2b30',  // 항목/모달 서브 카드 배경
          border: '#383842',   // 경계선
          hover: '#33333b'
        }
      },
      fontFamily: {
        pretendard: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif']
      }
    },
  },
  plugins: [],
}

