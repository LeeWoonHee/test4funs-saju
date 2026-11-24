import type { Metadata } from "next";
import "@fontsource-variable/noto-sans-kr";
import { SiteFooter, SiteHeader } from "@/components/site-frame";
import { SAJU_SITE_ORIGIN } from "@/lib/paths";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SAJU_SITE_ORIGIN),
  title: { default: "사주결", template: "%s | 사주결" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="flex min-h-dvh flex-col">
        <a className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-card focus:p-4" href="#main">
          본문으로 건너뛰기
        </a>
        <SiteHeader />
        <div className="flex-1 bg-saju-canvas">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
