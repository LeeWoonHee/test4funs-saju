import { countElements, ELEMENTS, ELEMENT_DETAILS, PILLAR_PERIODS, type Chart, type Interpretation } from "@/lib/contracts";

type Profile = { summary: string; example: string; action: string };

const profiles: Partial<Record<string, Profile>> = {
  갑: {
    summary: "할 일이 막막할 때, 먼저 목표를 정하고 시작하는 쪽으로 풀이해요.",
    example: "팀에서 새 일을 맡았는데 아무도 어디부터 손댈지 모를 때, ‘오늘은 목차부터 정하자’고 제안할 수 있어요.",
    action: "하고 싶은 일이 너무 크게 느껴지면 이번 주 안에 끝낼 일을 하나만 적어 보세요. 운동을 다시 시작하고 싶다면 첫날 걸을 시간과 장소부터 정해 보세요.",
  },
  을: {
    summary: "계획이 틀어지면 상황에 맞춰 다른 방법을 찾는 쪽으로 풀이해요.",
    example: "모임 날 비가 오면 남은 시간과 사람들의 이동 거리를 보고, 가까운 실내 장소로 바꾸자고 할 수 있어요.",
    action: "약속을 조율할 때는 다른 사람의 시간을 듣기 전에 ‘나는 토요일 오후가 편해’처럼 내 조건도 하나 말해 보세요.",
  },
  병: {
    summary: "관심이 생기면 먼저 말을 걸거나 함께하자고 제안하는 쪽으로 풀이해요.",
    example: "처음 간 모임이 조용할 때 ‘다들 어떻게 알고 오셨어요?’라고 물어 대화를 시작하는 모습이에요.",
    action: "재미있는 제안이 한꺼번에 오면 답하기 전에 이번 주 달력을 먼저 열어 보세요. 빈 시간이 있는 약속 하나부터 잡아도 충분해요.",
  },
  정: {
    summary: "관심 있는 일에 오래 집중하고, 가까운 사람의 작은 변화도 눈여겨보는 쪽으로 풀이해요.",
    example: "평소 대화가 많은 친구가 유난히 조용한 날, 친구가 먼저 말을 꺼낼 수 있도록 ‘오늘 무슨 일 있었어?’라고 물어보는 모습이에요.",
    action: "혼자 생각하느라 답이 늦어질 때는 ‘아직 생각 중이야. 오늘 저녁에 이야기할게’처럼 지금 상태와 답할 시간을 알려 보세요.",
  },
  무: {
    summary: "결과가 바로 보이지 않아도, 한번 맡은 일을 일정한 속도로 이어가는 쪽으로 풀이해요.",
    example: "여러 사람이 맡은 일이 흩어져 있을 때 매주 같은 요일에 진행 상황을 확인해 마감이 밀리는 일을 줄이는 모습이에요.",
    action: "익숙한 방식이 잘 안 풀리면 전부 바꾸기 전에 한 부분만 새로 해 보세요. 회의가 길어진다면 다음 회의에서 안건 하나에만 시간 제한을 둬 보세요.",
  },
  기: {
    summary: "다른 사람이 지나치기 쉬운 준비물이나 일정을 미리 챙기는 쪽으로 풀이해요.",
    example: "모임 장소가 정해지면 예약 인원이나 주차 가능 여부처럼 당일에 확인하기 어려운 부분을 먼저 묻는 모습이에요.",
    action: "작은 일이 쌓이면 하나를 골라 다른 사람에게 맡겨 보세요. ‘준비 좀 도와줘’보다 ‘오늘까지 참석 인원만 확인해 줄래?’처럼 부탁하면 맡을 일이 분명해져요.",
  },
  경: {
    summary: "선택지가 많을 때, 가장 중요한 조건을 정해 결정을 내리는 쪽으로 풀이해요.",
    example: "여행 숙소를 고를 때 모든 조건을 두고 고민하기보다, 먼저 이동 시간을 30분 이내로 정하고 그 안에서 후보를 비교하는 모습이에요.",
    action: "결정을 말할 때 이유도 한 문장 덧붙여 보세요. ‘여기로 하자. 아침에 이동할 시간이 제일 짧아’처럼요.",
  },
  신: {
    summary: "작은 차이를 눈여겨보고, 마무리 전에 한 번 더 확인하는 쪽으로 풀이해요.",
    example: "문서를 보내기 전 날짜와 금액이 본문과 첨부 파일에 똑같이 적혀 있는지 살피는 모습이에요.",
    action: "고치는 시간이 길어질 때는 ‘10분 동안 날짜와 금액만 확인하고 보낸다’처럼 마칠 시간과 확인할 항목을 먼저 정해 보세요.",
  },
  임: {
    summary: "한 가지 방법이 막히면 다른 사람의 아이디어나 예전 경험을 가져와 길을 찾는 쪽으로 풀이해요.",
    example: "팀 회의에서 말이 잘 나오지 않을 때, 다른 모임에서 해 본 것처럼 의견을 미리 적어 와서 읽어 보자고 제안하는 모습이에요.",
    action: "방법이 여러 개 떠오르면 이번 주에 시험해 볼 수 있는 것 하나만 골라 보세요. 해 본 결과를 보고 다음 방법을 정해도 돼요.",
  },
  계: {
    summary: "작은 변화들을 살펴 원인을 파악한 뒤 움직이는 쪽으로 풀이해요.",
    example: "반복해서 일정이 늦어진다면 어느 단계에서 시간이 걸렸는지 지난 몇 번의 기록을 비교하는 모습이에요.",
    action: "정보를 더 찾느라 결정이 미뤄지면 ‘오늘 저녁까지 두 가지만 확인한다’처럼 마감과 조사할 범위를 함께 정해 보세요.",
  },
};

export function buildBasicReading(chart: Chart): Pick<Interpretation, "summary" | "sections" | "limitations"> {
  const profile = profiles[chart.pillars.day.korean[0]];
  if (!profile) throw new Error("Unsupported day stem");

  const sections = [
    { title: "일상에서는 이런 모습이에요", body: profile.example },
    { title: "이렇게 해 보세요", body: profile.action },
  ];
  const counts = countElements(chart);
  const values = Object.values(counts);
  const confirmed = values.reduce((total, count) => total + count, 0);
  if (confirmed > 2) {
    const highest = Math.max(...values);
    const leading = ELEMENTS.filter((element) => counts[element] === highest);
    const labels = leading.map((element) => `${ELEMENT_DETAILS[element].name} ${highest}개`).join(", ");
    sections.push({
      title: "가장 자주 나온 오행",
      body: `확인된 ${confirmed}글자에서 ${labels}가 가장 많이 나왔어요.`,
    });
  }

  const limitations = [];
  if (chart.unknownTime) limitations.push("태어난 시각을 몰라 시간에 따라 달라지는 내용은 뺐어요.");
  const boundaries = chart.uncertainFields.filter((key) => key !== "hour");
  if (boundaries.length) {
    const periods = boundaries.map((key) => `‘${PILLAR_PERIODS[key]}’`).join(", ");
    limitations.push(`사주에서 해나 달이 바뀌는 절기 무렵이라 ${periods}에 해당하는 글자를 정하기 어려웠어요. 확인된 글자만 풀이에 썼어요.`);
  }
  limitations.push("전통 사주에서 읽은 성향이에요. 내 경험과 맞는 부분을 돌아보는 데 참고해 보세요.");

  return { summary: profile.summary, sections, limitations };
}
