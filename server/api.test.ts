import assert from "node:assert/strict";
import { test } from "node:test";
import { countElements, type Birth, type Reading } from "@/lib/contracts";
import { PERSONAL_TOPICS, fortuneResponseSchema, type FortuneRequest } from "@/lib/fortune-contracts";
import { api } from "./api";
import { readNine } from "./fortune-calendar";

function request(path: string, { method, body, origin, fetchSite }: {
  method?: string; body?: unknown; origin?: string; fetchSite?: string;
} = {}) {
  const headers = new Headers();
  if (body !== undefined) headers.set("content-type", "application/json");
  if (origin) headers.set("origin", origin);
  if (fetchSite) headers.set("sec-fetch-site", fetchSite);
  return api.fetch(new Request("http://localhost/api" + path, {
    method: method ?? (body === undefined ? "GET" : "POST"), headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  }));
}

const standardBirth: Birth = {
  year: 2020, month: 5, day: 23, calendar: "solar", leapMonth: false, unknownTime: true, time: null,
};

async function read(data: Partial<Birth> = {}) {
  const response = await request("/reading", { body: { ...standardBirth, ...data } });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.equal(response.headers.get("set-cookie"), null);
  return await response.json() as Reading;
}

async function readFortune(body: FortuneRequest) {
  const response = await request("/fortunes", { body });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  return fortuneResponseSchema.parse(await response.json());
}

test("Test4Funs의 프록시 요청을 허용하고 다른 사이트의 POST를 차단한다", async () => {
  const origin = "https://test4funs.com";
  const body = standardBirth;
  assert.equal((await request("/reading", { body, origin, fetchSite: "same-origin" })).status, 200);
  assert.equal((await request("/reading", { body, origin: "https://example.test", fetchSite: "same-origin" })).status, 403);
  assert.equal((await request("/reading", { body, origin, fetchSite: "cross-site" })).status, 403);
});

test("KASI 2020 역서의 양력·음력 윤달·일진 사례를 대조한다", async () => {
  const solar = await read();
  const lunar = await read({ calendar: "lunar", month: 4, day: 1, leapMonth: true });
  assert.deepEqual(lunar.chart, solar.chart);
  assert.equal(solar.chart.pillars.day.korean, "병인");
  assert.equal(solar.chart.pillars.hour, null);
  assert.deepEqual(solar.interpretation.referencedPillars.map(({ key }) => key), ["year", "month", "day"]);
  assert.equal((await request("/reading", { body: { ...standardBirth, month: 2, day: 30 } })).status, 400);
  assert.equal((await request("/reading", {
    body: { ...standardBirth, calendar: "lunar", month: 5, day: 1, leapMonth: true },
  })).status, 400);
  assert.equal((await request("/reading", { body: { ...standardBirth, year: 1988 } })).status, 400);
});

test("입춘의 시각 미상과 절입 근접 사례에서 영향을 받는 주를 제외한다", async () => {
  const date = { month: 2, day: 4 };
  const unknown = await read(date);
  assert.deepEqual(unknown.chart.uncertainFields, ["year", "month", "hour"]);
  assert.deepEqual(unknown.interpretation.referencedPillars.map(({ key }) => key), ["day"]);
  assert.equal(unknown.interpretation.sections.length, 2);
  assert.match(unknown.interpretation.limitations.join(" "), /태어난 시각을 몰라.*태어난 해.*태어난 달/);
  const beforeSpring = await read({ ...date, unknownTime: false, time: "17:00" });
  const nearSpring = await read({ ...date, unknownTime: false, time: "18:03" });
  const afterSpring = await read({ ...date, unknownTime: false, time: "19:00" });
  assert.equal(beforeSpring.chart.pillars.year?.korean, "기해");
  assert.equal(beforeSpring.chart.pillars.month?.korean, "정축");
  assert.deepEqual(nearSpring.chart.uncertainFields, ["year", "month"]);
  assert.equal(afterSpring.chart.pillars.year?.korean, "경자");
  assert.equal(afterSpring.chart.pillars.month?.korean, "무인");
});

test("오행 분포가 같은 날에도 태어난 날의 첫 글자에 따라 무료 풀이가 달라진다", async () => {
  const first = await read();
  const second = await read({ day: 24 });

  assert.equal(first.chart.pillars.day.stemElement, second.chart.pillars.day.stemElement);
  assert.deepEqual(countElements(first.chart), countElements(second.chart));
  assert.notEqual(first.interpretation.summary, second.interpretation.summary);
  assert.notEqual(first.interpretation.sections[0].body, second.interpretation.sections[0].body);
  assert.notEqual(first.interpretation.sections[1].body, second.interpretation.sections[1].body);
  assert.match(first.interpretation.sections[0].body, /처음 간 모임.*다들 어떻게 알고 오셨어요/);
  assert.match(first.interpretation.sections[1].body, /이번 주 달력/);
  assert.match(first.interpretation.sections[2].body, /확인된 6글자에서 불 2개, 쇠 2개/);
  assert.doesNotMatch(JSON.stringify({ ...first.interpretation, referencedPillars: [] }), /일간|일주|천간|지지|절입/);
});

test("같은 날짜라도 태어난 시간에 따라 확인된 오행 설명을 갱신한다", async () => {
  const morning = await read({ unknownTime: false, time: "07:30" });
  const afternoon = await read({ unknownTime: false, time: "13:30" });

  assert.equal(morning.interpretation.summary, afternoon.interpretation.summary);
  assert.notDeepEqual(countElements(morning.chart), countElements(afternoon.chart));
  assert.match(morning.interpretation.sections[2].body, /물 \d+개/);
  assert.match(afternoon.interpretation.sections[2].body, /나무 \d+개/);
});

test("일곱 운세 주제가 서로 다른 풀이를 반환하고 확인된 글자만 사용한다", async () => {
  const summaries = new Set<string>();
  for (const topic of PERSONAL_TOPICS) {
    const result = await readFortune({ kind: "topic", topic, birth: standardBirth });
    assert.equal(result.kind, "topic");
    assert.equal(result.topic, topic);
    assert.ok(result.content.sections.length);
    assert.match(result.content.notes.join(" "), /출생 시각을 몰라/);
    summaries.add(result.content.summary);
  }
  assert.equal(summaries.size, PERSONAL_TOPICS.length);

  const morning = await readFortune({ kind: "topic", topic: "children", birth: { ...standardBirth, unknownTime: false, time: "07:30" } });
  const lateMorning = await readFortune({ kind: "topic", topic: "children", birth: { ...standardBirth, unknownTime: false, time: "09:30" } });
  assert.equal(morning.kind, "topic");
  assert.equal(lateMorning.kind, "topic");
  assert.notEqual(morning.content.summary, lateMorning.content.summary);
  assert.notEqual(morning.content.sections[0].body, lateMorning.content.sections[0].body);
  assert.match(morning.content.sections[1].body, /태어난 시각에 해당하는 두 번째 글자/);
});

test("재물·직업·학업 풀이의 오행 근거에 확인된 글자 수와 미확정 범위를 표시한다", async () => {
  // KASI 2024 일력자료의 2월 4일 입춘은 한국 표준시 17:27이다.
  const spring = { ...standardBirth, year: 2024, month: 2, day: 4 };
  for (const topic of ["wealth", "career", "study"] as const) {
    const boundary = await readFortune({ kind: "topic", topic, birth: spring });
    assert.equal(boundary.kind, "topic");
    assert.match(boundary.content.sections[1].body, /8글자 중 확인된 2글자.*미확정 글자에 따라 전체 개수는 달라질 수 있어요/);
    assert.match(boundary.content.sections[1].body, /태어난 날의 첫 글자 ‘무\(흙\)’/);
    if (topic === "career") assert.match(boundary.content.sections[1].body, /태어난 달의 글자가 미확정이라/);

    const unknown = await readFortune({ kind: "topic", topic, birth: standardBirth });
    assert.equal(unknown.kind, "topic");
    assert.match(unknown.content.sections[1].body, /8글자 중 확인된 6글자.*미확정 글자/);
    assert.notEqual(unknown.content.summary, boundary.content.summary);
  }
  for (const [time, confirmed, water, partial] of [
    [null, 2, 0, true], ["16:30", 8, 1, false], ["17:27", 4, 0, true], ["18:30", 8, 0, false],
  ] as const) {
    const result = await readFortune({ kind: "topic", topic: "wealth", birth: { ...spring, time, unknownTime: time === null } });
    assert.equal(result.kind, "topic");
    const { body } = result.content.sections[1];
    assert.ok(body.includes(`8글자 중 확인된 ${confirmed}글자에서 ‘물(水)’에 해당하는 글자가 ${water}개`));
    assert.equal(body.includes("미확정 글자"), partial);
  }
});

test("궁합은 상대방 사주에 따라 달라지며 양력과 대응하는 음력 입력이 일치한다", async () => {
  const original = await readFortune({ kind: "compatibility", birth: standardBirth, partner: standardBirth });
  const converted = await readFortune({ kind: "compatibility", birth: standardBirth, partner: {
    ...standardBirth, calendar: "lunar", month: 4, day: 1, leapMonth: true,
  } });
  const opposite = await readFortune({ kind: "compatibility", birth: standardBirth, partner: { ...standardBirth, day: 29 } });
  assert.deepEqual(original, converted);
  assert.equal(original.kind, "compatibility");
  assert.equal(opposite.kind, "compatibility");
  assert.match(original.content.sections[0].body, /여행지를 고를 때/);
  assert.match(original.content.sections[1].body, /비슷한 속도/);
  assert.match(opposite.content.sections[1].body, /속도가 다르게/);
  assert.match(opposite.content.sections[2].body, /둘째 글자 ‘인’, ‘신’/);
  assert.equal((await request("/fortunes", { body: {
    kind: "compatibility", birth: standardBirth, partner: { ...standardBirth, month: 2, day: 31 },
  } })).status, 400);
});

test("대운은 2020년 역서의 입하·망종으로 산출한 시작 나이와 순서에 맞는다", async () => {
  const birth = { ...standardBirth, unknownTime: false, time: "12:00" };
  const forward = await readFortune({ kind: "cycles", birth, directionBasis: "male" });
  const backward = await readFortune({ kind: "cycles", birth, directionBasis: "female" });
  assert.equal(forward.kind, "cycles");
  assert.equal(backward.kind, "cycles");
  assert.equal(forward.direction, "forward");
  assert.equal(backward.direction, "backward");
  // KASI 2020: 6/5 13:58 (52 months forward), 5/5 09:51 (72 months backward).
  assert.deepEqual(forward.startAge, { minMonths: 52, maxMonths: 52 });
  assert.deepEqual(backward.startAge, { minMonths: 72, maxMonths: 72 });
  assert.deepEqual(forward.periods.slice(0, 2).map(({ pillar }) => pillar), ["임오", "계미"]);
  assert.deepEqual(backward.periods.slice(0, 2).map(({ pillar }) => pillar), ["경진", "기묘"]);
  assert.equal(forward.periods[1].startAge.minMonths - forward.periods[0].startAge.minMonths, 120);

  const unknown = await readFortune({ kind: "cycles", birth: standardBirth, directionBasis: "male" });
  const boundary = await readFortune({ kind: "cycles", birth: { ...standardBirth, month: 2, day: 4 }, directionBasis: "male" });
  assert.equal(unknown.kind, "cycles");
  assert.deepEqual(unknown.startAge, { minMonths: 50, maxMonths: 54 });
  assert.equal(boundary.kind, "cycles");
  assert.equal(boundary.startAge, null);
  assert.deepEqual(boundary.periods, []);
});

test("아홉수는 한국 날짜의 생일 경계와 선택한 나이 기준을 적용한다", async () => {
  const birth = { ...standardBirth, year: 1997 };
  const birthday = Date.UTC(2026, 4, 22, 15);
  const before = readNine(birth, "international", birthday - 1);
  const after = readNine(birth, "international", birthday);
  const counting = readNine(birth, "counting", birthday);
  assert.deepEqual([before.age, before.isNine, before.nextAge, before.nextYear], [28, false, 29, 2026]);
  assert.deepEqual([after.age, after.isNine, after.nextAge, after.nextYear], [29, true, 39, 2036]);
  assert.deepEqual([counting.age, counting.isNine, counting.nextAge, counting.nextYear], [30, false, 39, 2035]);
  const result = await readFortune({ kind: "nine", birth, ageStandard: "counting" });
  assert.equal(result.kind, "nine");
  assert.equal(result.ageStandard, "counting");
});

test("무료 풀이는 주문 토큰을 반환하지 않고 리포트 API는 종료된다", async () => {
  const reading = await read();
  assert.deepEqual(Object.keys(reading).sort(), ["chart", "interpretation"]);

  const retiredRoutes = [
    ["/orders", "POST"],
    ["/orders/restore", "POST"],
    ["/orders/current", "GET"],
    ["/orders/current/process", "POST"],
    ["/orders/current/refund", "POST"],
    ["/orders/current", "DELETE"],
  ] as const;
  for (const [path, method] of retiredRoutes) {
    const response = await request(path, { method });
    assert.equal(response.status, 404, `${method} ${path}`);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});
