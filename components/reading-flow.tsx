"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { BirthFields, readBirthFields } from "@/components/birth-fields";
import { FortuneExplorer } from "@/components/fortune-explorer";
import { ReadingChart } from "@/components/reading-chart";
import { Button } from "@/components/ui/button";
import { countElements, ELEMENT_DETAILS, type Birth, type Reading } from "@/lib/contracts";
import { messageFor, requestJson } from "@/lib/http";

function Result({ reading, resultRef }: { reading: Reading; resultRef: React.RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const { chart, interpretation } = reading;
  const { day } = chart.pillars;
  const dayElement = ELEMENT_DETAILS[day.stemElement];
  const confirmed = Object.values(countElements(chart)).reduce((total, count) => total + count, 0);

  return (
    <motion.section
      ref={resultRef}
      tabIndex={-1}
      id="result"
      aria-labelledby="result-title"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="scroll-mt-24 rounded-3xl border border-saju-line bg-paper-white p-5 outline-none sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="result-title" className="text-[1.65rem] font-bold tracking-[-0.045em] text-ink-black">
          내 사주 풀이
        </h2>
        <Button asChild variant="outline" className="border-saju-line text-[13px] text-saju-accent">
          <a href="#fortunes">
            주제별 운세 보기 <ArrowRight size={14} aria-hidden />
          </a>
        </Button>
      </div>

      <div className="mt-4 border-b border-saju-line pb-5">
        <p className="text-lg leading-[1.65] font-medium text-ink-black">
          {interpretation.summary}
        </p>
        <dl className="mt-3 flex flex-col gap-2 rounded-2xl bg-saju-canvas px-3.5 py-3 text-sm leading-6 text-smoke">
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <dt className="shrink-0 font-semibold text-saju-accent-hover sm:w-16">풀이 기준</dt>
            <dd>태어난 날의 첫 글자인 <strong className="font-semibold text-ink-black">{day.korean[0]}({day.hanja[0]}) · {dayElement.name}</strong>에서 위 성향을 읽었어요.</dd>
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-2">
            <dt className="shrink-0 font-semibold text-saju-accent-hover sm:w-16">오행 개수</dt>
            <dd>확인된 {confirmed}글자에서 글자마다 오행을 하나씩 셌어요. 가장 많은 오행은 풀이 기준 글자의 오행과 다를 수 있어요.</dd>
          </div>
        </dl>
      </div>

      <div className="mt-5 flex flex-col divide-y divide-frost">
        {interpretation.sections.map((section) => (
          <article key={section.title} className="py-5 first:pt-0 last:pb-0">
            <h3 className="text-[17px] font-semibold text-ink-black">{section.title}</h3>
            <p className="mt-2.5 text-[15px] leading-[1.75] text-graphite">{section.body}</p>
          </article>
        ))}
      </div>

      <ul className="mt-5 list-disc space-y-1 pl-4 text-xs leading-6 text-smoke sm:text-sm">
        {interpretation.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
      </ul>

      <ReadingChart chart={chart} />
    </motion.section>
  );
}

export function ReadingFlow({ firstYear, lastYear, aside }: { firstYear: number; lastYear: number; aside: ReactNode }) {
  const [result, setResult] = useState<{ reading: Reading; birth: Birth; revision: number } | null>(null);
  const reading = result?.reading;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const pending = useRef<AbortController>(null);

  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => {
    if (!reading || !resultRef.current) return;
    resultRef.current.focus({ preventScroll: true });
    resultRef.current.scrollIntoView({ block: "start" });
  }, [reading]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const birth = readBirthFields(event.currentTarget);
    const controller = new AbortController();
    pending.current = controller;
    setError("");
    setBusy(true);
    try {
      const reading = await requestJson<Reading>("/reading", "POST", birth, controller.signal);
      if (!controller.signal.aborted) {
        setResult((previous) => ({ reading, birth, revision: (previous?.revision ?? 0) + 1 }));
      }
    } catch (failure) {
      if (!controller.signal.aborted) setError(messageFor(failure));
    } finally {
      if (!controller.signal.aborted) {
        pending.current = null;
        setBusy(false);
      }
    }
  }

  return (
    <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <section
          id="saju"
          className="min-w-0 scroll-mt-23 rounded-3xl border border-saju-line bg-paper-white p-4 sm:p-6"
          aria-labelledby="form-title"
        >
          <h2 id="form-title" className="text-xl font-bold tracking-[-0.035em] text-ink-black">
            출생 정보 입력
          </h2>
          <p className="mt-1 text-xs leading-5 text-smoke sm:text-[13px]">
            국내 출생 · {firstYear}년부터 오늘까지 (양력 환산 기준)
          </p>

          <form className="mt-4 space-y-3.5 sm:mt-5 sm:space-y-4" onSubmit={submit}>
            <BirthFields firstYear={firstYear} lastYear={lastYear} />

            {error && (
              <p role="alert" className="rounded-[10px] border border-[#e3b8b8] bg-[#fdf2f2] px-4 py-3 text-sm font-medium text-[#8c1f1f]">
                {error}
              </p>
            )}

            <div className="pt-1">
              <Button type="submit" size="lg" disabled={busy} className="group w-full" aria-busy={busy}>
                {busy ? "사주를 계산하고 있어요..." : "무료 풀이 보기"}
                {busy ? (
                  <LoaderCircle aria-hidden className="motion-safe:animate-spin" />
                ) : (
                  <ArrowRight aria-hidden className="motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5" />
                )}
              </Button>
            </div>
          </form>
        </section>

        {result && (
          <div className="min-w-0 w-full">
            {(busy || error) && (
              <p role="status" className="mb-2 rounded-xl bg-saju-accent-light px-4 py-2 text-sm leading-6 text-saju-accent-hover">
                {busy ? "다시 계산하는 동안 이전 풀이를 보여드려요." : "새 풀이를 불러오지 못해 이전 풀이를 보여드려요."}
              </p>
            )}
            <Result reading={result.reading} resultRef={resultRef} />
            <FortuneExplorer key={result.revision} birth={result.birth} firstYear={firstYear} lastYear={lastYear} />
          </div>
        )}
      </div>

      <div className="min-w-0 lg:w-[33%] lg:shrink-0">
        {aside}
      </div>
    </div>
  );
}
