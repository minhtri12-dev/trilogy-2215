/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        investigation: {
          dark: "#0a0a0c",       // Màu nền đen than chì cho bàn làm việc
          card: "#121216",       // Màu nền cho các thẻ hồ sơ
          border: "#27272a",     // Màu viền thẻ tài liệu
          cyan: "#38bdf8",       // Màu xanh công nghệ điểm nhấn
          amber: "#f59e0b",      // Màu vàng cam cảnh báo hồ sơ mật
        },
      },
    },
  },
  plugins: [],
};