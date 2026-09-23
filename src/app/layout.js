import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TRILOGY-2215 | Hồ Sơ Án Mạng Zodiac",
  description: "Hóa thân thành Đặc vụ FBI, bẻ gãy bẫy logic ngoại phạm và giải mã thông điệp đẫm máu từ thiên tài tội phạm Zodiac. Bạn có đủ trí tuệ để sống sót?",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
