import Link from "next/link";
import { Target } from "lucide-react";

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
      <a href="https://test4funs.com/" aria-label="Test4Funs 홈" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md text-xs font-extrabold tracking-tight text-saju-ink hover:text-saju-accent sm:text-sm">
        <Target aria-hidden size={17} className="text-saju-accent" />
        <span>TEST 4 FUNS</span>
      </a>
      <span aria-hidden className="h-4 w-px shrink-0 bg-saju-line" />
      <Link href="/" className="inline-flex min-h-11 shrink-0 items-center rounded-md text-sm font-bold text-saju-accent hover:text-saju-accent-hover">
        사주결
      </Link>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-saju-line bg-saju-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-14 max-w-5xl items-center justify-between gap-2 px-4 sm:min-h-16 sm:gap-4 sm:px-6 lg:px-8">
        <Brand />
        <nav aria-label="주 메뉴" className="flex items-center text-sm font-medium text-saju-muted">
          <Link href="/#guide" className="inline-flex min-h-11 items-center rounded-md transition-colors hover:text-saju-accent">
            이용 안내
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-saju-line bg-saju-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6 lg:px-8">
        <Brand />
        <nav aria-label="하단 메뉴" className="flex flex-wrap gap-x-5 text-sm font-medium text-saju-muted">
          <Link href="/#guide" className="inline-flex min-h-11 items-center rounded-md hover:text-saju-ink">이용 안내</Link>
        </nav>
      </div>
    </footer>
  );
}
