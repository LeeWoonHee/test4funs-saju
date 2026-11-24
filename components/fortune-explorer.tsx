"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { BirthFields, readBirthFields } from "@/components/birth-fields";
import { Button } from "@/components/ui/button";
import { Select, SelectItem } from "@/components/ui/select";
import type { Birth } from "@/lib/contracts";
import { DAEUN_PERIOD_MONTHS, FORTUNE_LABELS, PERSONAL_TOPICS, type FortuneRequest, type FortuneResponse, type FortuneText, type PersonalTopic } from "@/lib/fortune-contracts";
import { messageFor, requestJson } from "@/lib/http";

type Option = keyof typeof FORTUNE_LABELS;
type Cycles = Extract<FortuneResponse, { kind: "cycles" }>;

function isPersonalTopic(option: Option): option is PersonalTopic {
  return PERSONAL_TOPICS.some((topic) => topic === option);
}

function Notes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <ul className="mt-5 list-disc space-y-1 pl-4 text-xs leading-6 text-smoke sm:text-sm">
      {notes.map((note) => <li key={note}>{note}</li>)}
    </ul>
  );
}

function TopicContent({ content }: { content: FortuneText }) {
  return (
    <>
      <p className="mt-3 text-base leading-[1.7] font-medium text-ink-black">
        {content.summary}
      </p>
      <div className="mt-5 flex flex-col divide-y divide-frost">
        {content.sections.map(({ title, body }) => (
          <div key={title} className="py-4 first:pt-0 last:pb-0">
            <h4 className="text-base font-semibold text-ink-black">{title}</h4>
            <p className="mt-1.5 text-[15px] leading-[1.75] text-graphite">{body}</p>
          </div>
        ))}
      </div>
      <Notes notes={content.notes} />
    </>
  );
}

function ageText(months: number) {
  if (!months) return "출생 직후";
  const years = Math.floor(months / 12);
  const remaining = months % 12;
  return [years ? `만 ${years}세` : "", remaining ? `${remaining}개월` : ""].filter(Boolean).join(" ");
}

function rangeText({ minMonths, maxMonths }: NonNullable<Cycles["startAge"]>) {
  return minMonths === maxMonths ? ageText(minMonths) : `${ageText(minMonths)} ~ ${ageText(maxMonths)}`;
}

function Periods({ result }: { result: Cycles }) {
  const { startAge: firstStart } = result;
  const possibleDelayMonths = firstStart ? firstStart.maxMonths - firstStart.minMonths : 0;

  return (
    <>
      {firstStart && (
        <>
          <p className="mt-3 text-base leading-[1.7] text-ink-black">
            첫 대운은 <strong className="font-semibold text-midnight-navy">{rangeText(firstStart)}</strong> 무렵에 시작해요.
          </p>
          {possibleDelayMonths > 0 && (
            <p className="mt-2.5 text-sm leading-6 text-smoke">
              아래는 가장 이른 시작 나이를 기준으로 표시했어요. 각 구간의 시작과 끝은 최대 {possibleDelayMonths}개월 뒤일 수 있어요.
            </p>
          )}
          <ol className="mt-5 flex flex-col gap-2.5">
            {result.periods.map(({ pillar, startAge: { minMonths }, theme, body, current }) => (
              <li key={pillar}>
                <details
                  open={current === "yes"}
                  className={`group rounded-[10px] border px-4 py-1 transition-colors ${
                    current === "no"
                      ? "border-frost bg-paper-white hover:border-slate/50"
                      : "border-midnight-navy bg-paper-white shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
                  }`}
                >
                  <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center gap-x-2.5 gap-y-1 py-2 text-sm [&::-webkit-details-marker]:hidden">
                    <span className="font-semibold text-ink-black">
                      {ageText(minMonths)} ~ {ageText(minMonths + DAEUN_PERIOD_MONTHS - 1)}
                    </span>
                    <span className="text-graphite">{theme}</span>
                    {current !== "no" && (
                      <span className="rounded-[10px] bg-sunlit-yellow px-2.5 py-0.5 text-[11px] font-semibold tracking-[0.036em] text-ink-black">
                        {current === "yes" ? "현재 구간" : "현재일 수 있음"}
                      </span>
                    )}
                    <ChevronDown
                      aria-hidden
                      size={16}
                      className="ml-auto shrink-0 text-smoke transition-transform duration-200 group-open:rotate-180 group-open:text-midnight-navy"
                    />
                  </summary>
                  <p className="border-t border-frost pt-2.5 pb-3 text-sm leading-[1.7] text-graphite">
                    {body} 이 구간의 사주 글자는 <strong className="font-semibold text-ink-black">‘{pillar}’</strong>예요.
                  </p>
                </details>
              </li>
            ))}
          </ol>
        </>
      )}
      <Notes notes={result.notes} />
    </>
  );
}

function ResultContent({ result }: { result: FortuneResponse }) {
  switch (result.kind) {
    case "topic":
    case "compatibility":
      return <TopicContent content={result.content} />;
    case "cycles":
      return <Periods result={result} />;
    case "nine": {
      const ageLabel = result.ageStandard === "international" ? "만 나이" : "세는나이";
      return (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-3 rounded-[10px] border border-frost bg-paper-white px-4 py-4">
            <span
              className={`rounded-[10px] px-3 py-1 text-xs font-semibold tracking-[0.036em] ${
                result.isNine
                  ? "bg-sunlit-yellow text-ink-black"
                  : "bg-linen-cream text-graphite"
              }`}
            >
              {result.isNine ? "아홉수 해당" : "아홉수 아님"}
            </span>
            <p className="text-base leading-7 text-ink-black">
              {ageLabel} 기준 <strong className="font-semibold text-midnight-navy">{result.age}세</strong>로, 현재{" "}
              {result.isNine ? "아홉수예요." : "아홉수에 해당하지 않아요."}
            </p>
          </div>
          <p className="text-[15px] leading-7 text-graphite">
            다음 아홉수는 <strong className="font-semibold text-ink-black">{result.nextYear}년</strong>에{" "}
            <strong className="font-semibold text-ink-black">{result.nextAge}세</strong>가 될 때예요.
          </p>
          <p className="text-xs leading-6 text-smoke">아홉수는 나이의 끝자리가 9인 때를 부르는 민간 관습이에요.</p>
        </div>
      );
    }
  }
}

function FortuneSelect({ label, name, defaultValue, placeholder, options }: {
  label: string; name: string; defaultValue?: string; placeholder?: string; options: [string, string][];
}) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink-black">{label}</label>
      <Select id={id} name={name} defaultValue={defaultValue} placeholder={placeholder} required>
        {options.map(([value, text]) => <SelectItem key={value} value={value}>{text}</SelectItem>)}
      </Select>
    </div>
  );
}

export function FortuneExplorer({ birth, firstYear, lastYear }: { birth: Birth; firstYear: number; lastYear: number }) {
  const [selected, setSelected] = useState<Option | null>(null);
  const [response, setResponse] = useState<FortuneResponse | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef<AbortController>(null);
  const resultHeading = useRef<HTMLHeadingElement>(null);
  const resultOption = response?.kind === "topic" ? response.topic : response?.kind;

  useEffect(() => () => pending.current?.abort(), []);
  useEffect(() => {
    if (!response || !resultHeading.current) return;
    resultHeading.current.focus({ preventScroll: true });
    resultHeading.current.scrollIntoView({ block: "start" });
  }, [response]);

  async function load(request: FortuneRequest) {
    pending.current?.abort();
    const controller = new AbortController();
    pending.current = controller;
    setError("");
    setBusy(true);
    try {
      const result = await requestJson<FortuneResponse>("/fortunes", "POST", request, controller.signal);
      if (!controller.signal.aborted) setResponse(result);
    } catch (failure) {
      if (!controller.signal.aborted) setError(messageFor(failure));
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  function choose(option: Option) {
    setSelected(option);
    if (isPersonalTopic(option)) {
      void load({ kind: "topic", topic: option, birth });
      return;
    }
    pending.current?.abort();
    setError("");
    setBusy(false);
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (selected === "compatibility") {
      void load({ kind: "compatibility", birth, partner: readBirthFields(event.currentTarget) });
      return;
    }

    const fields = new FormData(event.currentTarget);
    if (selected === "cycles") {
      const basis = fields.get("directionBasis");
      if (basis === "male" || basis === "female") void load({ kind: "cycles", birth, directionBasis: basis });
    } else if (selected === "nine") {
      const standard = fields.get("ageStandard") === "counting" ? "counting" : "international";
      void load({ kind: "nine", birth, ageStandard: standard });
    }
  }

  return (
    <section
      id="fortunes"
      tabIndex={-1}
      aria-labelledby="fortunes-title"
      className="mt-5 scroll-mt-24 rounded-3xl border border-saju-line bg-paper-white p-5 sm:p-7"
    >
      <h2 id="fortunes-title" className="text-[1.65rem] font-bold tracking-[-0.045em] text-ink-black">
        주제별 운세
      </h2>
      <p className="mt-1 text-sm leading-6 text-smoke">궁금한 주제를 선택하면 내 사주로 풀이해 드려요.</p>

      <div role="group" aria-label="운세 주제" className="-mx-1 mt-3 flex gap-2 overflow-x-auto overscroll-x-contain p-1 sm:mx-0 sm:mt-4 sm:flex-wrap sm:overflow-visible sm:p-0">
        {(Object.keys(FORTUNE_LABELS) as Option[]).map((option) => (
          <Button
            key={option}
            aria-pressed={selected === option}
            variant="outline"
            onClick={() => choose(option)}
            className="px-3.5 font-medium aria-pressed:border-saju-accent aria-pressed:bg-saju-accent-light aria-pressed:text-saju-accent-hover"
          >
            {FORTUNE_LABELS[option]}
          </Button>
        ))}
      </div>

      {selected && !isPersonalTopic(selected) && (
        <form
          key={selected}
          onSubmit={submit}
          className="mt-5 space-y-5 rounded-2xl bg-soft-vellum p-4 sm:p-5"
        >
          {selected === "compatibility" ? (
            <>
              <div>
                <h3 className="text-base font-semibold text-ink-black">상대방의 생년월일</h3>
                <p className="mt-1 text-sm leading-6 text-smoke">
                  두 사람의 태어난 날을 비교해요. 상대방은 생일만 입력하면 돼요.
                </p>
              </div>
              <BirthFields firstYear={firstYear} lastYear={lastYear} includeTime={false} />
            </>
          ) : selected === "cycles" ? (
            <>
              <FortuneSelect
                label="대운 계산 기준"
                name="directionBasis"
                placeholder="기준 선택"
                options={[["male", "남성 기준"], ["female", "여성 기준"]]}
              />
              <p className="text-sm leading-6 text-smoke">
                전통 명리에서 대운을 어느 방향으로 계산할지 정할 때만 써요.
              </p>
            </>
          ) : (
            <FortuneSelect
              label="나이 기준"
              name="ageStandard"
              defaultValue="international"
              options={[["international", "만 나이 (생일 기준)"], ["counting", "세는나이 (출생 연도 기준)"]]}
            />
          )}
          <Button type="submit" variant="secondary" disabled={busy} className="w-full sm:w-auto">
            {FORTUNE_LABELS[selected]} 보기
          </Button>
        </form>
      )}

      {busy && (
        <p role="status" className="mt-5 rounded-[10px] bg-soft-vellum px-4 py-3 text-sm text-smoke">
          {response ? "새 풀이를 계산하고 있어요. 아래에 이전 풀이를 보여드려요." : "풀이를 계산하고 있어요..."}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-5 rounded-[10px] border border-[#e3b8b8] bg-[#fdf2f2] px-4 py-3 text-sm font-medium text-[#8c1f1f]">
          {error}
        </p>
      )}

      {response && resultOption && (
        <div className="mt-5 border-t border-saju-line pt-5">
          {!busy && (error || resultOption !== selected) && (
            <p className="mb-2 text-sm text-smoke">아래는 이전에 확인한 풀이예요.</p>
          )}
          <h3
            ref={resultHeading}
            tabIndex={-1}
            className="scroll-mt-24 text-xl font-semibold tracking-[-0.025em] text-ink-black outline-none"
          >
            {FORTUNE_LABELS[resultOption]} 결과
          </h3>
          <ResultContent result={response} />
        </div>
      )}
    </section>
  );
}
