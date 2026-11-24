"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, BookHeart, CalendarDays, Check, Copy, Info, LockKeyhole } from "lucide-react";
import { BirthFields, readBirthFields } from "@/components/birth-fields";
import { FortuneExplorer } from "@/components/fortune-explorer";
import { ReadingChart } from "@/components/reading-chart";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import {
  ELEMENT_DETAILS, REPORT_PRICE_LABEL, REPORT_TITLE,
  type Birth, type Reading,
} from "@/lib/contracts";
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
      className="scroll-mt-24 rounded-2xl border border-saju-line bg-paper-white p-5 outline-none sm:p-7"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="result-title" className="text-[1.65rem] font-bold tracking-[-0.045em] text-ink-black">
            내 사주 풀이
          </h2>
        </div>
        <Button asChild variant="outline" className="min-h-10 px-4 text-[13px]">
          <a href="#fortunes">
            주제별 운세 보기 <ArrowRight size={14} aria-hidden />
          </a>
        </Button>
      </div>

      <div className="mt-6 rounded-[10px] border-l-4 border-midnight-navy bg-soft-vellum px-5 py-4 sm:px-6">
        <p className="text-[11px] font-semibold tracking-[0.045em] text-midnight-navy">핵심 요약</p>
        <p className="mt-1.5 text-base leading-[1.7] font-medium text-ink-black">
          {interpretation.summary}
        </p>
        <p className="mt-2 text-sm leading-6 text-smoke">
          태어난 날의 첫 글자 <strong className="font-semibold text-midnight-navy">{day.korean[0]}({day.hanja[0]})</strong>에서
          출발한 풀이예요. 이 글자는 오행에서 {dayElement.name}({dayElement.hanja})에 해당해요.
        </p>
      </div>

      <div className="mt-7 flex flex-col divide-y divide-frost">
        {interpretation.sections.map((section) => (
          <article key={section.title} className="py-5 first:pt-0 last:pb-0">
            <h3 className="text-[17px] font-semibold text-ink-black">{section.title}</h3>
            <p className="mt-2.5 text-[15px] leading-[1.75] text-graphite">{section.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-2.5 rounded-[10px] border border-frost bg-soft-vellum px-4 py-3.5 text-xs leading-6 text-smoke sm:text-sm">
        <Info size={16} aria-hidden className="mt-1 shrink-0 text-slate" />
        <ul className="list-disc space-y-1 pl-4">
          {interpretation.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
        </ul>
      </div>

      <ReadingChart chart={chart} />
    </motion.section>
  );
}

export function ReadingFlow({ firstYear, lastYear, aside }: { firstYear: number; lastYear: number; aside: ReactNode }) {
  const [result, setResult] = useState<{ reading: Reading; birth: Birth } | null>(null);
  const reading = result?.reading;
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    setRecoveryCode("");
    setPurchaseError("");
    setCopied(false);
    try {
      const reading = await requestJson<Reading>("/reading", "POST", birth);
      setResult({ reading, birth });
    } catch (failure) {
      setError(messageFor(failure));
    } finally {
      setBusy(false);
    }
  }

  async function purchase() {
    if (!reading || purchasing) return;
    setPurchasing(true);
    setPurchaseError("");
    try {
      const result = await requestJson<{ recoveryCode: string }>("/orders", "POST", { checkoutToken: reading.checkoutToken });
      setRecoveryCode(result.recoveryCode);
    } catch (failure) {
      setPurchaseError(messageFor(failure));
    } finally {
      setPurchasing(false);
    }
  }

  function offer() {
    if (reading) {
      setCheckout(true);
      return;
    }
    formRef.current?.querySelector("select")?.focus();
  }

  return (
    <div className="flex flex-col items-stretch gap-7 lg:flex-row lg:items-start lg:gap-10">
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <section
          id="saju"
          className="min-w-0 scroll-mt-23 rounded-2xl border border-saju-line bg-paper-white p-4 sm:p-6"
          aria-labelledby="form-title"
        >
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-saju-accent-light text-saju-accent">
              <CalendarDays size={20} aria-hidden strokeWidth={1.8} />
            </span>
            <div>
              <h2 id="form-title" className="text-xl font-bold tracking-[-0.035em] text-ink-black">
                출생 정보 입력
              </h2>
              <p className="mt-0.5 text-[13px] leading-5 text-smoke">
                국내 출생 · {firstYear}년부터 오늘까지 (양력 환산 기준)
              </p>
            </div>
          </div>

          <form ref={formRef} className="mt-4 space-y-3.5 border-t border-saju-line pt-4 sm:space-y-4" onSubmit={submit}>
            <BirthFields firstYear={firstYear} lastYear={lastYear} />

            {error && (
              <p role="alert" className="rounded-[10px] border border-[#e3b8b8] bg-[#fdf2f2] px-4 py-3 text-sm font-medium text-[#8c1f1f]">
                {error}
              </p>
            )}

            <div className="pt-1">
              <Button type="submit" variant="secondary" disabled={busy} className="min-h-12 w-full rounded-lg bg-saju-accent text-[15px] text-saju-surface hover:bg-saju-accent-hover active:bg-saju-accent-hover">
                {busy ? "사주를 계산하고 있어요..." : "무료 풀이 보기"}
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-smoke">
                <LockKeyhole size={13} aria-hidden className="shrink-0 text-slate" />
                출생 정보는 계산에만 사용되며 저장되지 않아요.
              </p>
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

      <div className="flex min-w-0 flex-col gap-5 lg:w-[34%] lg:shrink-0 lg:border-l lg:border-saju-line lg:pl-7">
        {aside}

        <aside
          aria-labelledby="report-offer-title"
          className="min-w-0"
        >
          <div className="flex items-center justify-between gap-4">
            <h2 id="report-offer-title" className="flex items-center gap-2 text-lg font-bold tracking-[-0.025em] text-saju-ink">
              <BookHeart size={17} aria-hidden className="shrink-0 text-saju-accent" />
              {REPORT_TITLE}
            </h2>
            <span className="shrink-0 text-xs font-medium text-saju-muted">
              {REPORT_PRICE_LABEL} · 1회
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-saju-muted">
            가까운 사람과 마음을 나누는 방식, 갈등에서 살펴볼 점과 실천해 볼 대화를 담았어요.
          </p>
          <Button
            variant="outline"
            onClick={offer}
            className="mt-3 w-fit rounded-lg border-saju-line bg-saju-surface px-3.5 text-saju-ink hover:bg-saju-accent-light active:bg-saju-accent-light"
          >
            {reading ? "관계 리포트 열기" : "출생 정보 입력으로 이동"}
            <ArrowRight size={15} aria-hidden />
          </Button>
        </aside>
      </div>

      <Modal
        open={checkout}
        onOpenChange={(open) => { if (!purchasing) setCheckout(open); }}
        title={recoveryCode ? "복구 코드가 발급됐어요" : REPORT_TITLE}
        description={recoveryCode
          ? "새 기기에서도 다시 볼 수 있도록 코드를 안전한 곳에 보관해 주세요. 발급일로부터 30일간 사용할 수 있어요."
          : "마음을 표현하는 방식, 갈등에서 살펴볼 점, 실천해 볼 대화를 담은 개인 리포트예요."}
      >
        {recoveryCode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 rounded-[10px] border border-frost bg-soft-vellum px-4 py-3">
              <code className="min-w-0 break-all font-mono text-sm font-semibold text-ink-black">{recoveryCode}</code>
              <Button
                variant="outline"
                className="min-h-9 shrink-0 px-3 py-1.5 text-xs"
                onClick={async () => {
                  try { await navigator.clipboard.writeText(recoveryCode); setCopied(true); }
                  catch { setPurchaseError("복구 코드를 선택해 직접 복사해 주세요."); }
                }}
              >
                {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
                {copied ? "복사됨" : "복사"}
              </Button>
            </div>
            {purchaseError && <p role="alert" className="text-sm font-medium text-[#8c1f1f]">{purchaseError}</p>}
            <Button asChild variant="primary" className="w-full"><Link href="/reports">내 리포트 보기</Link></Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-[10px] border border-frost bg-soft-vellum p-4 text-sm">
              <span className="font-medium text-graphite">일회성 구매</span>
              <strong className="text-xl font-semibold text-ink-black">{REPORT_PRICE_LABEL}</strong>
            </div>
            <p className="text-sm leading-6 text-smoke">
              현재는 모의 결제로 실제 청구액은 0원이에요. 내 리포트에서 30일간 재조회하고, 모의 전액 환불 또는 삭제할 수 있어요.
            </p>
            {purchaseError && <p role="alert" className="text-sm font-medium text-[#8c1f1f]">{purchaseError}</p>}
            <Button variant="primary" className="w-full" disabled={purchasing} onClick={purchase}>
              {purchasing ? "모의 주문 처리 중..." : "모의 결제하기"}
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
