"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { BirthFields, readBirthFields } from "@/components/birth-fields";
import { FortuneExplorer } from "@/components/fortune-explorer";
import { ReadingChart } from "@/components/reading-chart";
import { Button } from "@/components/ui/button";
import { ELEMENT_DETAILS, type Birth, type Reading } from "@/lib/contracts";
import { messageFor, requestJson } from "@/lib/http";

function Result({ reading, resultRef }: { reading: Reading; resultRef: React.RefObject<HTMLElement | null> }) {
  const reduce = useReducedMotion();
  const { chart, interpretation } = reading;
  const { day } = chart.pillars;
  const dayElement = ELEMENT_DETAILS[day.stemElement];

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
        <p className="mt-2 text-sm leading-6 text-smoke">
          태어난 날의 첫 글자 <strong className="font-semibold text-midnight-navy">{day.korean[0]}({day.hanja[0]})</strong>에서
          출발한 풀이예요. 이 글자는 오행에서 {dayElement.name}({dayElement.hanja})에 해당해요.
        </p>
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
  const [result, setResult] = useState<{ reading: Reading; birth: Birth } | null>(null);
  const reading = result?.reading;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const resultRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!reading || !resultRef.current) return;
    resultRef.current.focus({ preventScroll: true });
    resultRef.current.scrollIntoView({ block: "start" });
  }, [reading]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const birth = readBirthFields(event.currentTarget);
    setError("");
    setBusy(true);
    setResult(null);
    try {
      const reading = await requestJson<Reading>("/reading", "POST", birth);
      setResult({ reading, birth });
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
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
          <div className="w-full">
            <Result reading={result.reading} resultRef={resultRef} />
            <FortuneExplorer birth={result.birth} firstYear={firstYear} lastYear={lastYear} />
          </div>
        )}
      </div>

      <div className="min-w-0 lg:w-[33%] lg:shrink-0">
        {aside}
      </div>
    </div>
  );
}
