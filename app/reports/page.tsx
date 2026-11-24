import type { Metadata } from "next";
import { BookOpen } from "lucide-react";
import { Reports } from "@/components/reports";

export const metadata: Metadata = { title: "내 리포트" };

export default function ReportsPage() {
  return (
    <main id="main" className="min-h-[70vh]">
      <section className="bg-gradient-to-b from-midnight-navy to-[#132949] text-paper-white">
        <div className="mx-auto max-w-[840px] px-5 py-12 sm:px-8 sm:py-14">
          <p className="inline-flex items-center gap-1.5 rounded-[10px] bg-paper-white/10 px-3 py-1 text-xs font-medium tracking-[0.04em] text-sunlit-yellow">
            <BookOpen aria-hidden size={14} /> 사주결 보관함
          </p>
          <h1 className="mt-3.5 text-3xl font-semibold tracking-[-0.03em] text-paper-white sm:text-4xl">내 리포트</h1>
          <p className="mt-2.5 text-base leading-[1.6] text-frost">
            발급받은 관계 리포트를 다시 보거나, 다른 기기에서 발급한 복구 코드를 입력해 불러올 수 있어요.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[840px] px-5 py-10 sm:px-8 sm:py-12">
        <Reports />
      </div>
    </main>
  );
}
