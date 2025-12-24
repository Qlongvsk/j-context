import type { Metadata } from "next";
// 1. Import font Inter (cho tiếng Anh/Việt) và Noto Sans JP (cho tiếng Nhật)
import { Inter, Noto_Sans_JP } from "next/font/google"; 
import "./globals.css";

// 2. Cấu hình font
const inter = Inter({ subsets: ["latin"] });
const notoSansJP = Noto_Sans_JP({ 
  subsets: ["latin"], 
  weight: ["400", "500", "700"],
  variable: "--font-noto-jp" // Đặt tên biến để dùng sau này nếu cần
});

export const metadata: Metadata = {
  title: "J-Context Platform",
  description: "Học từ vựng tiếng Nhật theo ngữ cảnh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Áp dụng font vào body. Thêm class antialiased để chữ mượt hơn */}
      <body className={`${inter.className} ${notoSansJP.className} antialiased bg-gray-50 text-slate-900`}>
        {/* Navbar cũ của bạn giữ nguyên ở đây */}
        {children}
      </body>
    </html>
  );
}