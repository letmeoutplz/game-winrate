import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "내기 확인",
  description: "내기 승률 대시보드",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
