// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Knock Knock",
  description: "집들이 모임 커뮤니티 플랫폼",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {/* 공통 헤더가 모든 페이지 상단에 자동으로 뜹니다 */}
        <Header />
        {children}
      </body>
    </html>
  );
}