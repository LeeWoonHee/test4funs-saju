import Link from "next/link";
import { BookOpen, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

function Brand() {
  return (
    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
      <a href="https://test4funs.com/" aria-label="Test4Funs 홈" className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-md text-xs font-extrabold tracking-tight text-saju-ink hover:text-saju-accent sm:text-sm">
        <Target aria-hidden size={17} className="text-saju-accent" />
        <span>TEST 4 FUNS</span>
      </a>
      <span aria-hidden className="h-4 w-px shrink-0 bg-saju-line" />
      <Link href="/" className="inline-flex min-h-11 shrink-0 items-center rounded-md text-sm font-semibold text-saju-ink hover:text-saju-accent">
        사주결
      </Link>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-saju-line bg-saju-surface/95 backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Brand />
        <nav aria-label="주 메뉴" className="hidden items-center gap-7 text-sm font-medium text-saju-muted sm:flex">
          <Link href="/#saju" className="inline-flex min-h-11 items-center rounded-md transition-colors hover:text-saju-accent">
            사주 풀이
          </Link>
          <Link href="/#guide" className="inline-flex min-h-11 items-center rounded-md transition-colors hover:text-saju-accent">
            이용 안내
          </Link>
          <Link href="/#privacy" className="inline-flex min-h-11 items-center rounded-md transition-colors hover:text-saju-accent">
            개인정보
          </Link>
        </nav>

        <div className="flex items-center justify-end">
          <Button asChild variant="outline" className="min-h-11 shrink-0 rounded-lg border-saju-line bg-saju-surface px-2.5 text-xs font-medium whitespace-nowrap text-saju-ink hover:bg-saju-canvas active:bg-saju-accent-light sm:px-3.5 sm:text-[13px]">
            <Link href="/reports">
              <BookOpen aria-hidden size={15} /> 내 리포트
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-saju-line bg-saju-surface">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 sm:px-6 lg:px-8">
        <Brand />
        <nav aria-label="하단 메뉴" className="flex flex-wrap gap-x-5 text-sm font-medium text-saju-muted">
          <Link href="/#saju" className="inline-flex min-h-11 items-center rounded-md hover:text-saju-ink">사주 풀이</Link>
          <Link href="/#guide" className="inline-flex min-h-11 items-center rounded-md hover:text-saju-ink">이용 안내</Link>
          <Link href="/#privacy" className="inline-flex min-h-11 items-center rounded-md hover:text-saju-ink">개인정보 안내</Link>
          <Link href="/reports" className="inline-flex min-h-11 items-center rounded-md hover:text-saju-ink">내 리포트</Link>
        </nav>
      </div>
    </footer>
  );
}
