import KoreanLunarCalendar from "korean-lunar-calendar";
import { FIRST_YEAR, todayInKorea, type Birth, type Chart } from "@/lib/contracts";

const STEMS = ["갑", "을", "병", "정", "무", "기", "경", "신", "임", "계"];
const BRANCHES = ["자", "축", "인", "묘", "진", "사", "오", "미", "신", "유", "술", "해"];
const STEM_CHARS = "甲乙丙丁戊己庚辛壬癸";
const BRANCH_CHARS = "子丑寅卯辰巳午未申酉戌亥";
const STEM_ELEMENTS = ["목", "목", "화", "화", "토", "토", "금", "금", "수", "수"] as const;
const BRANCH_ELEMENTS = ["수", "토", "목", "목", "토", "화", "화", "토", "금", "금", "토", "수"] as const;
const MINUTE = 60_000;
export const DAY = 1_440 * MINUTE;
const KST_OFFSET = 540 * MINUTE;
export const TERM_MARGIN = 10 * MINUTE;
const DAY_EPOCH = Date.UTC(2020, 4, 23); // KASI 2020 역서의 병인일
const mod = (n: number, divisor: number) => ((n % divisor) + divisor) % divisor;
const sin = (degrees: number) => Math.sin(degrees * Math.PI / 180);

export class InputError extends Error {}

function pillar(stem: number, branch: number) {
  return {
    korean: STEMS[stem] + BRANCHES[branch],
    hanja: STEM_CHARS[stem] + BRANCH_CHARS[branch],
    stemElement: STEM_ELEMENTS[stem],
    branchElement: BRANCH_ELEMENTS[branch],
  };
}

function solarDate(birth: Birth) {
  const { year, month, day } = birth;
  if (birth.calendar === "solar") {
    const candidate = new Date(Date.UTC(year, month - 1, day));
    if (candidate.getUTCMonth() !== month - 1) throw new InputError("존재하는 생년월일을 입력해 주세요.");
    return { year, month, day };
  }
  const calendar = new KoreanLunarCalendar();
  if (!calendar.setLunarDate(year, month, day, birth.leapMonth) ||
      calendar.getLunarCalendar().intercalation !== birth.leapMonth) {
    throw new InputError(birth.leapMonth ? "선택한 날짜는 음력 윤달에 존재하지 않아요." : "존재하는 음력 생년월일을 입력해 주세요.");
  }
  return calendar.getSolarCalendar();
}

// Apparent solar longitude using low-order Meeus solar coordinates.
function solarLongitude(instant: number) {
  const centuries = (instant / DAY + 2440587.5 - 2451545) / 36525;
  const meanLongitude = 280.46646 + centuries * (36000.76983 + 0.0003032 * centuries);
  const anomaly = 357.52911 + centuries * (35999.05029 - 0.0001537 * centuries);
  const center = (1.914602 - centuries * (0.004817 + 0.000014 * centuries)) * sin(anomaly)
    + (0.019993 - 0.000101 * centuries) * sin(2 * anomaly) + 0.000289 * sin(3 * anomaly);
  return meanLongitude + center - 0.00569 - 0.00478 * sin(125.04 - 1934.136 * centuries);
}

export function termInstant(year: number, month: number) {
  const longitude = mod(255 + 30 * month, 360);
  let lower = Date.UTC(year, month - 1, 1);
  let upper = lower + 12 * DAY;
  while (upper - lower > 1000) {
    const middle = (lower + upper) / 2;
    if (mod(solarLongitude(middle) - longitude + 180, 360) < 180) lower = middle;
    else upper = middle;
  }
  return upper;
}

export function resolveBirthTime(birth: Birth) {
  const { year, month, day } = solarDate(birth);
  const date = Date.UTC(year, month - 1, day);
  const dateString = new Date(date).toISOString().slice(0, 10);
  if (year < FIRST_YEAR || dateString > todayInKorea()) {
    throw new InputError(`${FIRST_YEAR}년 1월 1일부터 오늘까지의 생년월일을 입력해 주세요.`);
  }
  const [hours, minutes] = birth.time?.split(":").map(Number) ?? [0, 0];
  const start = date - KST_OFFSET;
  const instant = start + (hours * 60 + minutes) * MINUTE;
  return {
    year, month, day, date, hours, instant,
    earliest: birth.unknownTime ? start : instant,
    latest: birth.unknownTime ? start + DAY - 1 : instant,
  };
}

export function shiftPillar(korean: string, distance: number) {
  return pillar(mod(STEMS.indexOf(korean[0]) + distance, 10), mod(BRANCHES.indexOf(korean[1]) + distance, 12));
}

export function calculateChart(birth: Birth, timing = resolveBirthTime(birth)): Chart {
  const { year, month, date, hours, instant, earliest, latest } = timing;
  const term = termInstant(year, month);
  const spring = month === 2 ? term : termInstant(year, 2);
  const boundaryUncertain = (boundary: number) =>
    earliest <= boundary + TERM_MARGIN && latest >= boundary - TERM_MARGIN;
  const yearUncertain = boundaryUncertain(spring);
  const monthUncertain = boundaryUncertain(term);
  const cycleYear = instant < spring ? year - 1 : year;
  const yearStem = mod(cycleYear - 4, 10);
  const solarMonth = mod(month - 2 - Number(instant < term), 12);
  const dayIndex = mod(Math.round((date - DAY_EPOCH) / DAY) + 2, 60);
  const hourBranch = Math.floor((hours + 1) / 2) % 12;
  const uncertainFields: Chart["uncertainFields"] = [];
  if (yearUncertain) uncertainFields.push("year");
  if (monthUncertain) uncertainFields.push("month");
  if (birth.unknownTime) uncertainFields.push("hour");

  return {
    calculationVersion: "kst-midnight-v1",
    pillars: {
      year: yearUncertain ? null : pillar(yearStem, mod(cycleYear - 4, 12)),
      month: monthUncertain ? null : pillar(mod(yearStem * 2 + 2 + solarMonth, 10), (2 + solarMonth) % 12),
      day: pillar(dayIndex % 10, dayIndex % 12),
      hour: birth.unknownTime ? null : pillar((dayIndex % 10 * 2 + hourBranch) % 10, hourBranch),
    },
    unknownTime: birth.unknownTime,
    uncertainFields,
  };
}
