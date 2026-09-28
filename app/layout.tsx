import "./globals.css";
import AppShell from "@/app/components/common/AppShell";

export const metadata = {
  title: "KK",
  description: "가장 편안한 공간으로의 다정한 초대",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router 루트 레이아웃의 <link>는 모든 페이지에 적용되므로 오탐 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Gowun+Batang:wght@400;700&family=Gowun+Dodum&family=Nanum+Myeongjo:wght@400;700;800&display=swap"
        />
      </head>
      <body className="font-['Pretendard',sans-serif] antialiased text-neutral-900 bg-[#E8E6DF] m-0 p-0 overflow-hidden">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}