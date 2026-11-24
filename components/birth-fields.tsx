"use client";

import { useId, useState } from "react";
import { ChevronDown, Clock3 } from "lucide-react";
import type { Birth } from "@/lib/contracts";

const fieldClass =
  "h-12 w-full min-w-0 rounded-lg border border-slate/45 bg-soft-vellum px-2.5 text-[15px] font-normal text-ink-black transition-colors hover:border-ink-black/60 focus:border-midnight-navy focus:bg-paper-white disabled:opacity-50 sm:px-3.5";
const labelClass = "text-sm font-medium text-ink-black";

function DateSelect({ label, name, options, suffix }: { label: string; name: string; options: number[]; suffix: string }) {
  return (
    <label className={`relative flex min-w-0 flex-col ${name === "year" ? "flex-[1.35] sm:flex-1" : "flex-1"}`}>
      <span className="sr-only">{label}</span>
      <select name={name} required defaultValue="" className={`${fieldClass} cursor-pointer appearance-none pr-6 invalid:text-smoke sm:pr-9`}>
        <option value="" disabled>{label}</option>
        {options.map((value) => <option key={value} value={value}>{value}{suffix}</option>)}
      </select>
      <ChevronDown aria-hidden size={15} className="pointer-events-none absolute top-4 right-2 text-smoke sm:right-3" />
    </label>
  );
}

export function readBirthFields(form: HTMLFormElement): Birth {
  const data = new FormData(form);
  const calendar = data.get("calendar") === "lunar" ? "lunar" : "solar";
  const unknownTime = data.get("unknownTime") === "on" || !data.has("time");
  return {
    year: Number(data.get("year")), month: Number(data.get("month")), day: Number(data.get("day")),
    calendar, leapMonth: calendar === "lunar" && data.get("leapMonth") === "on",
    unknownTime, time: unknownTime ? null : String(data.get("time") ?? ""),
  };
}

export function BirthFields({ firstYear, lastYear, includeTime = true }: { firstYear: number; lastYear: number; includeTime?: boolean }) {
  const [calendar, setCalendar] = useState<Birth["calendar"]>("solar");
  const [unknownTime, setUnknownTime] = useState(false);
  const [time, setTime] = useState("");
  const timeId = useId();
  const hintId = useId();
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => lastYear - index);
  return (
    <>
      <fieldset>
        <legend className={labelClass}>달력 기준</legend>
        <div className="mt-2 flex gap-2">
          {([["solar", "양력"], ["lunar", "음력"]] as const).map(([value, text]) => (
            <label key={value} className="relative flex min-w-0 flex-1 cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name="calendar"
                value={value}
                checked={calendar === value}
                onChange={() => setCalendar(value)}
              />
              <span className="flex min-h-11 w-full items-center justify-center rounded-lg border border-slate/40 bg-soft-vellum px-3 text-sm font-medium text-graphite transition-colors peer-checked:border-saju-accent peer-checked:bg-saju-accent-light peer-checked:text-saju-accent-hover peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-midnight-navy">
                {text}
              </span>
            </label>
          ))}
        </div>
        {calendar === "lunar" && (
          <label className="mt-1 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-graphite">
            <input name="leapMonth" type="checkbox" className="size-4 accent-midnight-navy" />
            윤달인 경우 선택해 주세요
          </label>
        )}
      </fieldset>

      <fieldset>
        <legend className={labelClass}>생년월일</legend>
        <div className="mt-2 flex gap-1.5 sm:gap-2.5">
          <DateSelect name="year" label="연도" options={years} suffix="년" />
          <DateSelect name="month" label="월" options={Array.from({ length: 12 }, (_, i) => i + 1)} suffix="월" />
          <DateSelect name="day" label="일" options={Array.from({ length: 31 }, (_, i) => i + 1)} suffix="일" />
        </div>
      </fieldset>

      {includeTime && (
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-2">
            {unknownTime ? (
              <span className={labelClass}>태어난 시각</span>
            ) : (
              <label htmlFor={timeId} className={labelClass}>태어난 시각</label>
            )}
            <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm text-graphite">
              <input
                name="unknownTime"
                type="checkbox"
                checked={unknownTime}
                onChange={(event) => setUnknownTime(event.target.checked)}
                className="size-4 accent-midnight-navy"
              />
              시각 모름
            </label>
          </div>
          {unknownTime ? (
            <p className="flex min-h-12 items-center rounded-lg border border-dashed border-slate/50 bg-soft-vellum px-3.5 text-sm text-smoke">
              태어난 시각 없이도 확인할 수 있는 부분을 풀이해 드려요.
            </p>
          ) : (
            <div className="relative">
              <input
                id={timeId}
                name="time"
                type="time"
                value={time}
                required
                aria-describedby={hintId}
                onChange={(event) => setTime(event.target.value)}
                className={`${fieldClass} block`}
              />
            </div>
          )}
          <p id={hintId} className="mt-2 flex items-center gap-1.5 text-xs text-smoke">
            <Clock3 size={14} aria-hidden className="shrink-0 text-slate" /> 한국 표준시 기준
          </p>
        </div>
      )}
    </>
  );
}
