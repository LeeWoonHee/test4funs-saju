"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowRight, BookHeart, Info, KeyRound, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/dialog";
import { REPORT_PRICE_LABEL, REPORT_TITLE, type Order } from "@/lib/contracts";
import { messageFor, requestJson, RequestError } from "@/lib/http";

const labels: Record<Order["status"], string> = {
  queued: "생성 대기 중",
  generating: "리포트 생성 중",
  failed: "리포트 생성 지연",
  ready: "리포트 준비 완료",
  refund_pending: "모의 환불 처리 중",
  refunded: "모의 환불 완료",
  deleted: "리포트 삭제 완료",
};

const statusBadgeStyles: Record<Order["status"], string> = {
  queued: "bg-midnight-navy text-paper-white",
  generating: "bg-midnight-navy text-paper-white",
  failed: "bg-charcoal text-sunlit-yellow",
  ready: "bg-sunlit-yellow text-ink-black",
  refund_pending: "bg-linen-cream text-graphite",
  refunded: "bg-linen-cream text-smoke",
  deleted: "bg-linen-cream text-smoke",
};

export function Reports() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [action, setAction] = useState("");
  const [confirm, setConfirm] = useState<"refund" | "delete" | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    requestJson<Order>("/orders/current", "GET", undefined, controller.signal)
      .then(setOrder).catch((failure) => {
        if (!controller.signal.aborted && !(failure instanceof RequestError && failure.status === 404)) setError(messageFor(failure));
      }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!order || action || error || ["ready", "refunded", "deleted"].includes(order.status) ||
      (order.status === "failed" && !order.canRetry)) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      requestJson<Order>("/orders/current/process", "POST", { retry: order.status === "failed" }, controller.signal)
        .then((next) => { if (!controller.signal.aborted) setOrder(next); })
        .catch((failure) => { if (!controller.signal.aborted) setError(messageFor(failure)); });
    }, order.status === "failed" ? 2800 : 1250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [order, action, error]);

  async function run(name: string, work: () => Promise<void>) {
    setAction(name);
    setError("");
    setNotice("");
    try { await work(); }
    catch (failure) { setError(messageFor(failure)); }
    finally { setAction(""); }
  }

  function restore(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void run("restore", async () => {
      setOrder(await requestJson<Order>("/orders/restore", "POST", { code: code.trim() }));
      setCode("");
      setNotice("리포트를 복구했어요. 이전 기기의 조회 권한은 만료됐어요.");
    });
  }

  function confirmAction() {
    if (!confirm) return;
    void run(confirm, async () => {
      if (confirm === "refund") {
        setOrder(await requestJson<Order>("/orders/current/refund", "POST"));
      } else {
        await requestJson("/orders/current", "DELETE");
        setOrder(null);
        setNotice("리포트와 복구 코드를 삭제했어요. 모의 주문 기록은 만료일까지 남아요.");
      }
      setConfirm(null);
    });
  }

  function refresh(retry: boolean) {
    void run("refresh", async () => {
      setOrder(await requestJson<Order>("/orders/current/process", "POST", { retry }));
    });
  }

  const canRefund = order && !["refund_pending", "refunded", "deleted"].includes(order.status);

  return (
    <div className="space-y-6">
      {notice && (
        <p role="status" className="rounded-[10px] border-l-4 border-midnight-navy bg-paper-white px-5 py-4 text-sm font-medium leading-6 text-ink-black shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          {notice}
        </p>
      )}
      {error && !confirm && (
        <p role="alert" className="rounded-[10px] border border-[#e3b8b8] bg-[#fdf2f2] px-5 py-4 text-sm font-medium text-[#8c1f1f]">
          {error}
        </p>
      )}

      <section
        aria-labelledby="current-title"
        className="rounded-[10px] bg-paper-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] sm:p-8"
      >
        <div className="flex items-center gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[10px] bg-linen-cream text-midnight-navy">
            <BookHeart aria-hidden size={20} strokeWidth={1.8} />
          </span>
          <h2 id="current-title" className="text-2xl font-semibold tracking-[-0.02em] text-ink-black">
            {order ? REPORT_TITLE : "최근 리포트"}
          </h2>
        </div>

        {loading ? (
          <p role="status" className="mt-5 text-sm text-smoke">리포트를 불러오고 있어요...</p>
        ) : order ? (
          <>
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-smoke">
              <span role="status" className={`rounded-[10px] px-3 py-1 text-xs font-semibold tracking-[0.036em] ${statusBadgeStyles[order.status]}`}>
                {labels[order.status]}
              </span>
              <span>모의 결제 · 기준 가격 {REPORT_PRICE_LABEL}</span>
            </div>

            {order.report ? (
              <div className="mt-6 border-y border-frost py-6">
                <p className="rounded-[10px] border-l-4 border-midnight-navy bg-soft-vellum px-5 py-4 text-base leading-[1.7] font-medium text-ink-black">
                  {order.report.summary}
                </p>
                <div className="mt-6 flex flex-col divide-y divide-frost">
                  {order.report.sections.map((section, index) => (
                    <article key={section.title} className="py-5 first:pt-0 last:pb-0">
                      <div className="flex items-center gap-2.5">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-[10px] bg-midnight-navy text-xs font-semibold text-paper-white">
                          {index + 1}
                        </span>
                        <h3 className="text-[17px] font-semibold text-ink-black">{section.title}</h3>
                      </div>
                      <p className="mt-2.5 text-[15px] leading-[1.75] text-graphite">{section.body}</p>
                    </article>
                  ))}
                </div>
                <div className="mt-5 flex items-start gap-2.5 rounded-[10px] border border-frost bg-soft-vellum px-4 py-3 text-xs leading-6 text-smoke sm:text-sm">
                  <Info size={15} aria-hidden className="mt-1 shrink-0 text-slate" />
                  <ul className="list-disc space-y-1 pl-4">
                    {order.report.limitations.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="mt-5 rounded-[10px] bg-soft-vellum px-4 py-3.5 text-sm leading-7 text-graphite">
                {order.status === "failed"
                  ? (order.canRetry ? "추가 결제 없이 다시 생성할 수 있어요." : "다시 생성할 수 없어요. 모의 환불을 신청해 주세요.")
                  : order.status === "refund_pending"
                    ? "리포트 접근이 중단됐어요. 이 화면에서 모의 환불 결과를 확인할 수 있어요."
                    : order.status === "refunded"
                      ? "모의 환불이 완료됐어요."
                      : "페이지를 새로고침해도 모의 구매 상태는 유지돼요."}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-2.5">
              {order.canRetry && (
                <Button variant="outline" disabled={!!action} onClick={() => refresh(true)}>
                  <RefreshCw aria-hidden /> 다시 생성
                </Button>
              )}
              {error && !order.canRetry && (
                <Button variant="outline" disabled={!!action} onClick={() => refresh(false)}>
                  <RefreshCw aria-hidden /> 상태 확인
                </Button>
              )}
              {canRefund && (
                <Button variant="outline" disabled={!!action} onClick={() => { setError(""); setConfirm("refund"); }}>
                  모의 환불 신청
                </Button>
              )}
              <Button variant="ghost" disabled={!!action} onClick={() => { setError(""); setConfirm("delete"); }}>
                <Trash2 aria-hidden /> 리포트 삭제
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-5 rounded-[10px] border border-dashed border-frost bg-soft-vellum p-6 text-center">
            <p className="text-sm leading-6 text-graphite">이 기기에서 조회할 리포트가 없어요.</p>
            <Button asChild variant="primary" className="mt-4">
              <Link href="/#saju">
                무료 풀이 시작 <ArrowRight size={15} aria-hidden />
              </Link>
            </Button>
          </div>
        )}
      </section>

      <section
        aria-labelledby="restore-title"
        className="rounded-[10px] bg-paper-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-linen-cream text-midnight-navy">
            <KeyRound size={19} aria-hidden />
          </span>
          <h2 id="restore-title" className="text-xl font-semibold tracking-[-0.02em] text-ink-black">
            복구 코드로 조회
          </h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-smoke">
          모의 구매 때 발급된 코드를 입력하세요. 복구하면 이전 기기의 접근 권한이 만료돼요.
        </p>
        <form className="mt-5 flex flex-col gap-2.5 sm:flex-row" onSubmit={restore}>
          <label className="flex min-w-0 flex-1">
            <span className="sr-only">복구 코드</span>
            <input
              name="recovery"
              className="h-12 w-full rounded-[4px] border border-slate/45 bg-soft-vellum px-4 font-mono text-sm text-ink-black placeholder:font-sans placeholder:text-smoke hover:border-ink-black/60 focus:border-midnight-navy focus:bg-paper-white focus:outline-none"
              placeholder="24자리 복구 코드 입력"
              required
              minLength={24}
              maxLength={24}
              autoComplete="off"
              spellCheck={false}
              value={code}
              onChange={(event) => setCode(event.target.value)}
            />
          </label>
          <Button type="submit" variant="secondary" disabled={loading || !!action} className="shrink-0">
            {action === "restore" ? "복구 중..." : "리포트 복구"}
          </Button>
        </form>
      </section>

      <Modal
        open={!!confirm}
        onOpenChange={(open) => { if (!open && !action) setConfirm(null); }}
        title={confirm === "refund" ? "모의 환불을 신청할까요?" : "리포트를 삭제할까요?"}
        description={confirm === "refund"
          ? "모의 전액 환불을 신청하면 즉시 리포트 접근이 중단돼요."
          : "리포트와 복구 코드를 폐기해요. 상품과 금액 등 모의 주문 기록은 만료일까지 남아요."}
      >
        {error && <p role="alert" className="mb-3 text-sm font-medium text-[#8c1f1f]">{error}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={!!action} onClick={() => setConfirm(null)}>취소</Button>
          <Button variant="danger" disabled={!!action} onClick={confirmAction}>
            {action ? "처리 중..." : confirm === "refund" ? "모의 환불 신청" : "리포트 삭제"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
