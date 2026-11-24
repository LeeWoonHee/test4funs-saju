import { todayInKorea, type Birth } from "@/lib/contracts";
import { DAEUN_PERIOD_MONTHS, type FortuneRequest, type FortuneResponse } from "@/lib/fortune-contracts";
import { calculateChart, DAY, resolveBirthTime, shiftPillar, TERM_MARGIN, termInstant } from "./calendar";
import { relationOf, relationThemes } from "./fortune-elements";

type CycleRequest = Extract<FortuneRequest, { kind: "cycles" }>;
type CycleReading = Extract<FortuneResponse, { kind: "cycles" }>;
type NineReading = Extract<FortuneResponse, { kind: "nine" }>;
const YANG_STEMS = "갑병무경임";

function termAtOffset(year: number, month: number, offset: number) {
  const date = new Date(Date.UTC(year, month - 1 + offset, 1));
  return termInstant(date.getUTCFullYear(), date.getUTCMonth() + 1);
}

function ageInMonths(birth: { year: number; month: number; day: number }, now: number) {
  const [year, month, day] = todayInKorea(now).split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const anniversary = Math.min(birth.day, lastDay);
  return Math.max(0, (year - birth.year) * 12 + month - birth.month - Number(day < anniversary));
}

export function readCycles(birth: Birth, directionBasis: CycleRequest["directionBasis"], now = Date.now()): CycleReading {
  const timing = resolveBirthTime(birth);
  const chart = calculateChart(birth, timing);
  const { year, month, day } = chart.pillars;

  if (!year || !month) {
    return {
      kind: "cycles",
      direction: null,
      startAge: null,
      periods: [],
      notes: ["옛 달력에서 해나 달이 바뀌는 시점에 가까워 대운의 기준 글자를 확정하기 어려워요. 출생 시각을 아는 경우 입력해 다시 확인해 보세요."],
    };
  }

  const forward = YANG_STEMS.includes(year.korean[0]) === (directionBasis === "male");
  const term = termInstant(timing.year, timing.month);
  const currentMonthOffset = timing.instant < term ? -1 : 0;
  const boundary = termAtOffset(timing.year, timing.month, currentMonthOffset + Number(forward));
  const near = forward ? boundary - timing.latest : timing.earliest - boundary;
  const far = forward ? boundary - timing.earliest : timing.latest - boundary;
  // Traditional interval conversion: three days to one year, rounded here to months.
  const toMonths = (interval: number) => Math.max(0, Math.round(interval / (DAY / 4)));
  const startAge = { minMonths: toMonths(near - TERM_MARGIN), maxMonths: toMonths(far + TERM_MARGIN) };
  const currentAge = ageInMonths(timing, now);
  const periods: CycleReading["periods"] = Array.from({ length: 10 }, (_, index) => {
    const pillar = shiftPillar(month.korean, (index + 1) * (forward ? 1 : -1));
    const from = {
      minMonths: startAge.minMonths + index * DAEUN_PERIOD_MONTHS,
      maxMonths: startAge.maxMonths + index * DAEUN_PERIOD_MONTHS,
    };
    const theme = relationThemes[relationOf(day.stemElement, pillar.stemElement)];
    const certain = currentAge >= from.maxMonths && currentAge < from.minMonths + DAEUN_PERIOD_MONTHS;
    const possible = currentAge >= from.minMonths && currentAge < from.maxMonths + DAEUN_PERIOD_MONTHS;
    return {
      pillar: pillar.korean,
      startAge: from,
      theme: theme.label,
      body: theme.body,
      current: certain ? "yes" : possible ? "possible" : "no",
    };
  });

  const notes = [
    "태어난 때부터 앞이나 뒤의 절기 시작까지의 간격을 3일당 1년으로 바꿔 시작 나이를 구하고, 10년씩 이어서 계산해요.",
    "절기 시작 시각은 근사 계산을 사용해요. 표의 시기와 주제는 전통 풀이의 참고값이에요.",
  ];
  if (birth.unknownTime) notes.unshift("태어난 시각을 몰라 하루 전체를 기준으로 시작 나이의 범위를 계산했어요.");
  if (currentAge < startAge.minMonths) notes.push("현재 나이는 표의 첫 대운 시작 전이에요.");

  return { kind: "cycles", direction: forward ? "forward" : "backward", startAge, periods, notes };
}

export function readNine(birth: Birth, ageStandard: NineReading["ageStandard"], now = Date.now()): NineReading {
  const timing = resolveBirthTime(birth);
  const [year, month, day] = todayInKorea(now).split("-").map(Number);
  const beforeBirthday = month < timing.month || (month === timing.month && day < timing.day);
  const age = year - timing.year + (ageStandard === "counting" ? 1 : -Number(beforeBirthday));
  const distance = (19 - age % 10) % 10;
  const nextAge = age + (distance || 10);
  const nextYear = timing.year + nextAge - Number(ageStandard === "counting");
  return { kind: "nine", ageStandard, age, isNine: distance === 0, nextAge, nextYear };
}
