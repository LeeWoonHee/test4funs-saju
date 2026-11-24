import { z } from "zod";

export const FIRST_YEAR = 1989;
export const PILLAR_KEYS = ["year", "month", "day", "hour"] as const;
export const PILLAR_PERIODS = { year: "태어난 해", month: "태어난 달", day: "태어난 날", hour: "태어난 시각" };
export const ELEMENTS = ["목", "화", "토", "금", "수"] as const;
export const ELEMENT_DETAILS = {
  목: { name: "나무", hanja: "木", trait: "새로운 시도", color: "bg-[#eaf3ec] text-[#1f4d2e] ring-1 ring-inset ring-[#c8dfc9]" },
  화: { name: "불", hanja: "火", trait: "감정 표현", color: "bg-[#faecea] text-[#7c2920] ring-1 ring-inset ring-[#ecc8c3]" },
  토: { name: "흙", hanja: "土", trait: "꾸준함", color: "bg-[#f8f1df] text-[#614712] ring-1 ring-inset ring-[#e5d5ad]" },
  금: { name: "쇠", hanja: "金", trait: "기준 세우기", color: "bg-[#f0f0f2] text-[#2f313a] ring-1 ring-inset ring-[#d7d8de]" },
  수: { name: "물", hanja: "水", trait: "깊이 생각하기", color: "bg-[#e9f0f7] text-[#1a365d] ring-1 ring-inset ring-[#c6d7ea]" },
};

export function countElements({ pillars, uncertainFields }: Chart) {
  const counts = { 목: 0, 화: 0, 토: 0, 금: 0, 수: 0 };
  for (const key of PILLAR_KEYS) {
    const pillar = pillars[key];
    if (!pillar || uncertainFields.includes(key)) continue;
    counts[pillar.stemElement]++;
    counts[pillar.branchElement]++;
  }
  return counts;
}

export function todayInKorea(now = Date.now()) {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

export const birthSchema = z.object({
  year: z.number().int().min(FIRST_YEAR).max(2050),
  month: z.number().int().min(1).max(12),
  day: z.number().int().min(1).max(31),
  calendar: z.enum(["solar", "lunar"]),
  leapMonth: z.boolean(),
  unknownTime: z.boolean(),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).nullable(),
}).strict().refine(({ unknownTime, time }) => unknownTime === (time === null), {
  message: "출생 시각 또는 시각 모름을 선택해 주세요.",
}).refine(({ calendar, leapMonth }) => calendar === "lunar" || !leapMonth, {
  message: "윤달은 음력에서 선택할 수 있어요.",
});

export const pillarSchema = z.object({
  korean: z.string().length(2),
  hanja: z.string().length(2),
  stemElement: z.enum(ELEMENTS),
  branchElement: z.enum(ELEMENTS),
});
export const chartSchema = z.object({
  calculationVersion: z.literal("kst-midnight-v1"),
  pillars: z.object({
    year: pillarSchema.nullable(),
    month: pillarSchema.nullable(),
    day: pillarSchema,
    hour: pillarSchema.nullable(),
  }),
  unknownTime: z.boolean(),
  uncertainFields: z.array(z.enum(PILLAR_KEYS)).max(3),
});

export const limitsSchema = z.array(z.string().min(1).max(240)).min(1).max(4);
export const interpretationSchema = z.object({
  calculationVersion: z.literal("kst-midnight-v1"),
  referencedPillars: z.array(z.object({
    key: z.enum(PILLAR_KEYS),
    korean: z.string().length(2),
  })).min(1).max(4),
  summary: z.string().min(1).max(600),
  sections: z.array(z.object({
    title: z.string().min(1).max(60),
    body: z.string().min(1).max(800),
  })).min(1).max(5),
  limitations: limitsSchema,
}).strict();

export const readingSchema = z.object({
  chart: chartSchema,
  interpretation: interpretationSchema,
});
export const errorSchema = z.object({ error: z.string() });

export type Birth = z.infer<typeof birthSchema>;
export type Chart = z.infer<typeof chartSchema>;
export type Interpretation = z.infer<typeof interpretationSchema>;
export type Reading = z.infer<typeof readingSchema>;
