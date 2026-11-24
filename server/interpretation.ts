import {
  ELEMENT_DETAILS, PILLAR_KEYS, PILLAR_PERIODS, REPORT_TOPIC, interpretationSchema,
  type Chart, type Interpretation,
} from "@/lib/contracts";
import { buildBasicReading } from "./basic-reading";

const relationshipLanguage = {
  목: {
    summary: "함께 해 볼 일을 먼저 제안하는 모습에서 마음을 읽는 풀이예요.",
    example: "가까운 사람이 새 취미에 관심을 보이면 함께 해 볼 날짜를 먼저 찾아보는 모습이에요.",
    conflict: "상대가 바로 답하지 않을 때는 ‘지금 정할까, 다음에 이야기할까?’라고 물어보고 답할 시간을 주세요.",
    exercise: "주말 계획을 정할 때 ‘같이 하고 싶은 일 하나와 각자 하고 싶은 일 하나를 말해 볼까?’라고 물어보세요.",
  },
  화: {
    summary: "반가움이나 고마움을 말로 바로 전하는 모습에서 마음을 읽는 풀이예요.",
    example: "상대가 내 이야기를 기다려 줬을 때 헤어지기 전에 어떤 점이 고마웠는지 바로 말하는 모습이에요.",
    conflict: "의견이 엇갈려 말이 빨라지면 잠깐 쉬어도 돼요. ‘20분만 쉬고 다시 이야기하자’처럼 돌아올 시간을 함께 정해 보세요.",
    exercise: "‘아까 내가 말이 길어졌는데 끝까지 들어줘서 고마웠어’처럼 행동 하나와 느낀 점을 같이 말해 보세요.",
  },
  토: {
    summary: "지키기로 한 작은 약속을 꾸준히 챙기는 모습에서 마음을 읽는 풀이예요.",
    example: "상대가 중요한 면접을 본다고 하면, 그날을 기억해 저녁에 어땠는지 물어보는 모습이에요.",
    conflict: "혼자 챙기는 일이 쌓이면 필요한 도움을 하나만 골라 말해 보세요. ‘이번 주 장보기는 네가 맡아 줄 수 있어?’처럼요.",
    exercise: "‘수요일 저녁에는 같이 식사할까? 바쁜 주에는 미리 알려 주자’처럼 함께 지킬 수 있는 작은 약속부터 정해 보세요.",
  },
  금: {
    summary: "서로 기대하는 약속이나 기준을 분명히 말하는 모습에서 마음을 읽는 풀이예요.",
    example: "약속 시간이 바뀔 수 있다면 몇 시까지 알려 주면 서로 편한지 미리 이야기하는 모습이에요.",
    conflict: "답답한 일이 있다면 무슨 일이 있었는지와 앞으로 바라는 행동을 나눠 말해 보세요. ‘출발 뒤에 연락을 받았어. 다음엔 나가기 전에 알려 주면 좋겠어’처럼요.",
    exercise: "‘우리가 지금 지키고 있는 약속 중에 편한 것 하나랑 바꾸고 싶은 것 하나는 뭐야?’라고 서로 물어보세요.",
  },
  수: {
    summary: "상대가 자기 얘기를 충분히 할 수 있도록 기다려 주는 모습에서 마음을 읽는 풀이예요.",
    example: "상대가 힘든 일을 꺼냈을 때 그날 무슨 일이 있었는지 먼저 묻고, 말을 마칠 때까지 듣는 모습이에요.",
    conflict: "혼자 생각할 시간이 필요하다면 ‘지금은 머릿속이 복잡해. 저녁 먹고 다시 이야기하자’처럼 언제 돌아올지도 알려 주세요.",
    exercise: "상대의 말을 들은 뒤 ‘시간이 늦어진 것보다 미리 몰랐던 게 힘들었다는 뜻이야?’처럼 내가 이해한 내용을 한 문장으로 확인해 보세요.",
  },
};

function providerInput(chart: Chart, topicId: "basic" | typeof REPORT_TOPIC) {
  return {
    calculationVersion: chart.calculationVersion,
    pillars: Object.fromEntries(PILLAR_KEYS.flatMap((key) =>
      chart.pillars[key] ? [[key, chart.pillars[key].korean]] : [])),
    unknownTime: chart.unknownTime,
    uncertainFields: chart.uncertainFields,
    topicId,
    locale: "ko",
  };
}

function buildRelationshipReading(chart: Chart, input: ReturnType<typeof providerInput>) {
  const { day } = chart.pillars;
  const qualities = relationshipLanguage[day.stemElement];
  const element = ELEMENT_DETAILS[day.stemElement].name;
  const limitations = ["전통 명리의 상징을 일상에 비춰 보는 참고용 풀이예요."];
  if (input.unknownTime) limitations.push("태어난 시각을 몰라 시각에 해당하는 글자는 확인할 수 없어요.");
  const boundaries = input.uncertainFields.filter((key) => key !== "hour");
  if (boundaries.length) limitations.push(`사주에서 해나 달이 바뀌는 절기 무렵이라 ${boundaries.map((key) => `‘${PILLAR_PERIODS[key]}’`).join(", ")}에 해당하는 글자를 정하기 어려웠어요.`);

  return {
    summary: qualities.summary,
    sections: [
      { title: "마음을 표현할 때 이런 모습이에요", body: qualities.example },
      { title: "의견이 엇갈릴 때 이렇게 해 보세요", body: qualities.conflict },
      { title: "실제로 이렇게 말해 보세요", body: qualities.exercise },
      { title: "이렇게 읽은 이유", body: `태어난 날의 첫 글자 ‘${day.korean[0]}’에 해당하는 오행은 ${element}입니다. 이 풀이에서는 그 오행을 마음을 전하는 방식에 연결했어요.` },
    ],
    limitations,
  };
}

export function interpret(chart: Chart, topicId: "basic" | typeof REPORT_TOPIC): Interpretation {
  const input = providerInput(chart, topicId);
  const referencedPillars = PILLAR_KEYS.flatMap((key) =>
    input.pillars[key] ? [{ key, korean: input.pillars[key] }] : []);
  const content = input.topicId === "basic" ? buildBasicReading(chart) : buildRelationshipReading(chart, input);
  const result = interpretationSchema.parse({
    calculationVersion: input.calculationVersion,
    referencedPillars,
    ...content,
  });
  if (result.calculationVersion !== chart.calculationVersion || result.referencedPillars.some(({ key, korean }) =>
    chart.uncertainFields.includes(key) || chart.pillars[key]?.korean !== korean)) {
    throw new Error("Interpretation does not match the chart");
  }
  return result;
}
