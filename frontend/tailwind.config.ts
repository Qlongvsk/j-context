import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // --- THÊM PHẦN NÀY ---
      colors: {
        'j-cream': '#F6F0D7',  // Màu nền chủ đạo
        'j-green-light': '#C5D89D', // Màu highlight/card
        'j-green-med': '#9CAB84',   // Màu icon/hover
        'j-green-dark': '#89986D',  // Màu chữ chính/button
        'j-text-dark': '#4A5D44',   // Màu chữ đậm hơn cho dễ đọc (tự thêm cho chuẩn contrast)
      }
      // ---------------------
    },
  },
  plugins: [],
};
export default config;