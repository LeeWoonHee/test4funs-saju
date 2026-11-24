"use client";

import { useId, useState } from "react";
import { Clock3 } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectItem } from "@/components/ui/select";
import type { Birth } from "@/lib/contracts";

const labelClass = "text-sm font-medium text-ink-black";

function DateSelect({ label, name, options, suffix }: { label: string; name: string; options: number[]; suffix: string }) {
  return (
    <div className={`min-w-0 ${name === "year" ? "flex-[1.5] sm:flex-[1.15]" : "flex-1"}`}>
      <Select name={name} label={label} placeholder={label} required>
        {options.map((value) => <SelectItem key={value} value={String(value)}>{value}{suffix}</SelectItem>)}
      </Select>
    </div>
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
  const reduceMotion = useReducedMotion();
  const selectionOffset = calendar === "lunar" ? "100%" : "0%";
  const calendarId = useId();
  const leapMonthId = useId();
  const unknownTimeId = useId();
  const timeId = useId();
  const hintId = useId();
  const years = Array.from({ length: lastYear - firstYear + 1 }, (_, index) => lastYear - index);
  return (
    <>
      <fieldset>
        <legend id={calendarId} className={labelClass}>달력 기준</legend>
        <RadioGroup
          name="calendar"
          aria-labelledby={calendarId}
          value={calendar}
          onValueChange={(value) => setCalendar(value === "lunar" ? "lunar" : "solar")}
          orientation="horizontal"
          className="mt-2"
        >
          <motion.span
            aria-hidden
            data-slot="calendar-selection"
            initial={false}
            animate={reduceMotion ? undefined : { x: selectionOffset }}
            style={reduceMotion ? { x: selectionOffset } : undefined}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%_-_0.25rem)] rounded-full border border-saju-accent/45 bg-saju-accent-light shadow-sm shadow-saju-accent/10"
          />
          <RadioGroupItem value="solar">양력</RadioGroupItem>
          <RadioGroupItem value="lunar">음력</RadioGroupItem>
        </RadioGroup>
        {calendar === "lunar" && (
          <div className="mt-1 flex w-fit items-center gap-2 rounded-full bg-saju-canvas px-2.5 has-[[data-state=checked]]:bg-saju-accent-light motion-safe:animate-saju-reveal motion-safe:transition-colors">
            <Checkbox id={leapMonthId} name="leapMonth" />
            <label htmlFor={leapMonthId} className="flex min-h-11 cursor-pointer items-center text-sm text-graphite">
              윤달인 경우 선택해 주세요
            </label>
          </div>
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
            <div className="flex items-center gap-2 rounded-full bg-saju-canvas px-2.5 has-[[data-state=checked]]:bg-saju-accent-light motion-safe:transition-colors">
              <Checkbox id={unknownTimeId} name="unknownTime" checked={unknownTime} onCheckedChange={(checked) => setUnknownTime(checked === true)} />
              <label htmlFor={unknownTimeId} className="flex min-h-11 cursor-pointer items-center text-sm text-graphite">
                시각 모름
              </label>
            </div>
          </div>
          <div hidden={unknownTime} className="motion-safe:animate-saju-reveal">
            <Input id={timeId} name="time" type="time" required disabled={unknownTime} aria-describedby={hintId} />
          </div>
          {unknownTime && (
            <p className="flex min-h-12 items-center rounded-2xl border border-saju-line bg-saju-canvas px-3.5 py-2 text-sm text-saju-muted motion-safe:animate-saju-reveal">
              태어난 시각 없이도 확인할 수 있는 부분을 풀이해 드려요.
            </p>
          )}
          <p id={hintId} className="mt-2 flex items-center gap-1.5 text-xs text-smoke">
            <Clock3 size={14} aria-hidden className="shrink-0 text-slate" /> 한국 표준시 기준
          </p>
        </div>
      )}
    </>
  );
}
