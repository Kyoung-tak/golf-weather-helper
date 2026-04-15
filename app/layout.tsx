import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "골프 날씨 도우미",
  description: "서울과 경기 근교 골프장의 날씨와 대기질을 간단히 확인하는 앱"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
