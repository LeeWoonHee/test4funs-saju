import type { Metadata } from "next";
import "@fontsource-variable/noto-sans-kr";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "사주결 · 나를 읽는 사주", template: "%s | 사주결" },
  description: "태어난 날의 사주와 오행을 읽고, 일상과 관계를 돌아보는 사주 풀이.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-dvh">
        <a className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-card focus:p-4" href="#main">
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
