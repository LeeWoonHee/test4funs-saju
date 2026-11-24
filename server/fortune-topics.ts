import { countElements, ELEMENT_DETAILS, type Chart } from "@/lib/contracts";
import type { FortuneText, PersonalTopic } from "@/lib/fortune-contracts";
import { elementFor, type Element } from "./fortune-elements";

type TopicExample = { summary: string; example: string };

const moneyStyles: Record<Element, TopicExample> = {
  목: {
    summary: "새로 배우거나 시작하는 데 쓰는 돈을 먼저 살펴보는 풀이예요.",
    example: "강의나 취미 용품을 사고 싶다면 바로 결제하기 전에 이번 달 실제로 해 볼 시간과 예상 비용을 함께 적어 보세요.",
  },
  화: {
    summary: "모임이나 즐거운 경험에 쓰는 돈을 먼저 살펴보는 풀이예요.",
    example: "주말 약속이 여러 개라면 식사비와 교통비까지 더해 보세요. 그 금액을 보고 이번 주에 꼭 가고 싶은 약속을 고르는 식이에요.",
  },
  토: {
    summary: "고정비와 앞으로 필요할 돈부터 챙기는 방식에 초점을 둔 풀이예요.",
    example: "다음 달 큰 지출이 있다면 결제일과 금액을 달력에 먼저 적어 보세요. 그 뒤 이번 주에 쓸 돈을 정하면 계획을 잡기 쉬워요.",
  },
  금: {
    summary: "가격에 더해 실제로 쓸 기능을 기준으로 고르는 방식에 초점을 둔 풀이예요.",
    example: "휴대전화 요금제를 고를 때 지난달 데이터 사용량을 먼저 확인해 보세요. 그 범위를 충족하는 요금제끼리 가격을 비교하는 식이에요.",
  },
  수: {
    summary: "돈을 쓰기 전에 비교할 항목과 결정할 날짜를 정해 보세요.",
    example: "구독을 바꾸려면 갱신 전날까지 가격과 해지 조건 두 가지만 비교해 보세요. 기한을 정해 두면 살펴보다 갱신일을 넘기는 일을 줄일 수 있어요.",
  },
};

const workStyles: Record<Element, TopicExample> = {
  목: {
    summary: "새 과제의 첫 방향을 잡거나 진행 방법을 제안할 수 있는 환경을 눈여겨보세요.",
    example: "새 프로젝트에서 첫 주에 할 일을 정하거나, 새로운 방법을 작은 규모로 시험해 볼 수 있는 역할을 떠올려 보세요.",
  },
  화: {
    summary: "의견을 말하고 상대의 반응을 바로 확인할 수 있는 환경을 눈여겨보세요.",
    example: "회의에서 초안을 공유하고 그 자리에서 피드백을 받아 고치는 일이 편한지, 먼저 문서로만 주고받을 때와 비교해 보세요.",
  },
  토: {
    summary: "맡은 일이 분명하고, 결과가 차곡차곡 쌓이는 환경을 눈여겨보세요.",
    example: "예를 들어 매주 같은 지표를 확인하는 운영 업무에서는 지난주와 비교해 무엇이 나아졌는지 기록할 수 있어요.",
  },
  금: {
    summary: "역할과 마감 기준이 분명하고 결과를 직접 점검할 수 있는 환경을 눈여겨보세요.",
    example: "새 일을 받았을 때 ‘누가 최종 확인하고, 어디까지 끝나면 제출하나요?’가 분명한 팀에서 일하기 편했는지 떠올려 보세요.",
  },
  수: {
    summary: "자료를 충분히 읽고 서로 다른 의견을 정리할 시간이 있는 환경을 눈여겨보세요.",
    example: "바로 답을 내야 하는 회의와, 미리 받은 자료를 읽고 대안을 정리할 수 있는 회의 중 어느 쪽에서 의견을 내기 쉬웠는지 떠올려 보세요.",
  },
};

const romanceStyles: Record<Element, TopicExample> = {
  목: {
    summary: "좋아하는 마음을 같이 해 볼 일을 제안하는 모습으로 풀이해요.",
    example: "‘다음에 보자’에서 한 걸음 더 나아가 ‘이번 주에 같이 시장 구경 갈래?’처럼 하고 싶은 일을 구체적으로 꺼내는 모습이에요.",
  },
  화: {
    summary: "좋아하는 마음을 말로 바로 전하는 모습으로 풀이해요.",
    example: "즐거운 만남이었다면 헤어질 때 ‘오늘 같이 걸으면서 얘기해서 좋았어’라고 어떤 순간이 좋았는지 말해 보세요.",
  },
  토: {
    summary: "작은 약속을 지키거나 안부를 꾸준히 묻는 모습으로 풀이해요.",
    example: "상대가 중요한 일을 앞뒀다고 하면 그날 저녁 ‘오늘은 어땠어?’라고 기억해 묻는 것도 마음을 전하는 방식이에요.",
  },
  금: {
    summary: "편한 연락 방식이나 약속을 솔직하게 말하며 가까워지는 모습으로 풀이해요.",
    example: "답장이 늦어서 걱정될 때 ‘바쁜 날은 저녁에 한 번만 알려 주면 마음이 편해’처럼 바라는 행동을 말해 보세요.",
  },
  수: {
    summary: "상대가 충분히 말할 수 있도록 시간을 내 주는 모습으로 풀이해요.",
    example: "상대가 힘든 일을 말하면 ‘지금은 같이 해결책을 찾을까, 이야기를 들어줄까?’라고 물어보는 식이에요.",
  },
};

const romanceNeeds: Record<Element, string> = {
  목: "새로운 데이트를 제안할 때 ‘이번엔 내가 골랐으니 다음엔 네가 고를래?’처럼 두 사람 모두 선택할 기회를 가져 보세요.",
  화: "상대에게 마음이 잘 전해졌는지 궁금하면 ‘내가 어떤 말을 해 줄 때 가장 고마웠어?’라고 직접 물어보세요.",
  토: "연락이 들쑥날쑥할 때 불편하다면 ‘서로 바쁜 주에는 언제 안부를 나누면 좋을까?’라고 정해 보세요.",
  금: "약속 시간이나 연락 횟수에 기대가 다르면, 각자 꼭 필요한 기준 하나씩을 말해 보세요.",
  수: "생각할 시간이 필요할 때는 ‘지금은 정리가 안 돼. 저녁에 다시 이야기하자’처럼 언제 대화할지도 알려 주세요.",
};

const marriageStyles: Record<Element, TopicExample> = {
  목: {
    summary: "오래 지낼 관계라면 두 사람이 함께 해 보고 싶은 일이 무엇인지 이야기해 보세요.",
    example: "각자 올해 해 보고 싶은 일 하나를 적고, 그중 함께하고 싶은 일과 혼자 하고 싶은 일을 나눠 보세요.",
  },
  화: {
    summary: "오래 지낼 관계라면 고마움이나 불편함을 언제 말할지 맞춰 보세요.",
    example: "불편한 일이 생겼을 때 바로 말하는 게 편한지, 조금 진정한 뒤 이야기하는 게 편한지 서로 물어보세요.",
  },
  토: {
    summary: "오래 지낼 관계라면 집안일과 생활비처럼 반복되는 일을 어떻게 나눌지 이야기해 보세요.",
    example: "같이 지낸다면 장보기와 설거지처럼 자주 하는 일 하나를 골라, 누가 언제 맡고 바쁜 날엔 어떻게 바꿀지 정해 보세요.",
  },
  금: {
    summary: "오래 지낼 관계라면 꼭 지키고 싶은 약속을 서로 한 가지씩 말해 보세요.",
    example: "예를 들어 약속이 바뀌었을 때 얼마나 일찍 연락하면 서로 편한지, 평일과 주말에는 차이가 있는지 물어보세요.",
  },
  수: {
    summary: "오래 지낼 관계라면 함께 보내는 시간과 혼자 쉬는 시간을 어떻게 나눌지 이야기해 보세요.",
    example: "주말에 하루를 같이 보낸다면 나머지 하루는 각자 쓰고 싶은지, 오전이나 오후만 따로 보내도 충분한지 말해 보세요.",
  },
};

const studyStyles: Record<Element, TopicExample> = {
  목: {
    summary: "배운 개념에 내 예시를 하나 붙여서 이해하는 방법을 시도해 보세요.",
    example: "비율을 공부했다면 교재를 덮고 장보기나 요리에 비율이 쓰이는 예를 하나 적어 보세요.",
  },
  화: {
    summary: "배운 내용을 내 말로 설명해 보며 이해한 부분을 확인하는 풀이예요.",
    example: "한 단원을 읽고 책을 덮은 뒤, 친구에게 설명하듯 핵심을 1분 동안 말해 보세요. 말이 막힌 부분부터 다시 읽어 보세요.",
  },
  토: {
    summary: "짧게 공부한 뒤 다음 날 다시 떠올려 보는 방법을 시도해 보세요.",
    example: "오늘 단어를 열 개 봤다면 내일 새 단어를 보기 전에 어제 외운 뜻을 먼저 적어 보세요. 기억이 안 난 것만 표시해 두세요.",
  },
  금: {
    summary: "헷갈리는 개념이나 문제를 나란히 놓고 차이를 적어 보는 방법을 시도해 보세요.",
    example: "비슷한 문제 두 개를 골라 각 문제에 어떤 풀이를 쓰는지 한 줄씩 써 보세요. 풀이가 달라지는 조건에 밑줄을 그어 보세요.",
  },
  수: {
    summary: "자료를 읽고 나서 책을 덮은 채 요점을 써 보는 방법을 시도해 보세요.",
    example: "한 쪽을 읽고 핵심을 세 줄로 적어 보세요. 다시 책을 열어 빠진 내용 한 가지만 보충하면 어디까지 이해했는지 확인하기 쉬워요.",
  },
};

const careStyles: Record<Element, TopicExample> = {
  목: {
    summary: "아이에게 선택지를 주고 직접 골라 볼 기회를 만드는 쪽으로 풀이해요.",
    example: "새로 할 놀이를 고를 때 ‘그리기랑 만들기 중 뭐부터 해 볼래?’라고 두 가지를 제시해 보세요.",
  },
  화: {
    summary: "아이가 자기 기분을 말로 꺼낼 수 있도록 도와주는 쪽으로 풀이해요.",
    example: "‘오늘 어땠어?’라고 물어 답이 짧았다면 ‘오늘 뭐 할 때 제일 웃겼어?’처럼 한 가지 상황을 묻는 질문으로 바꿔 보세요.",
  },
  토: {
    summary: "매일 반복되는 일에서 아이와 작은 약속을 함께 정하는 쪽으로 풀이해요.",
    example: "잠들기 전에 할 일을 모두 정하기보다 ‘책 한 권 읽고 불 끄기’처럼 함께 지킬 수 있는 한 가지부터 정해 보세요.",
  },
  금: {
    summary: "아이가 혼자 정해도 되는 일과 함께 정해야 할 일을 구분해 말하는 쪽으로 풀이해요.",
    example: "‘오늘 입을 옷은 네가 고르고, 밖에서 돌아올 시간은 같이 정하자’처럼 두 경우를 구체적으로 말해 보세요.",
  },
  수: {
    summary: "아이가 답을 생각할 시간을 주고, 준비되면 다시 말을 거는 쪽으로 풀이해요.",
    example: "아이가 바로 대답하기 어려워하면 ‘지금 말하기 어렵다면 저녁 먹고 다시 얘기하자’고 시간을 정해 보세요.",
  },
};

const restStyles: Record<Element, TopicExample> = {
  목: {
    summary: "새 일정을 잡을 때 쉴 시간도 함께 확보하는 데 초점을 둔 풀이예요.",
    example: "토요일에 약속을 하나 더 넣기 전에 이동 시간까지 달력에 적어 보세요. 남는 시간 중 비워 두고 싶은 시간도 정해 보세요.",
  },
  화: {
    summary: "사람을 많이 만난 날에는 하루를 차분하게 마무리하는 시간을 살펴보세요.",
    example: "모임에서 돌아온 날, 바로 다른 일을 시작했을 때와 잠깐 조용히 쉬었을 때 중 어느 쪽이 편했는지 떠올려 보세요.",
  },
  토: {
    summary: "바쁜 날에 식사나 잠드는 시간이 얼마나 달라지는지 살펴보세요.",
    example: "바쁜 날과 여유 있는 날의 첫 식사 시간을 하루씩 적어 보세요. 차이가 크다면 다음 바쁜 날에는 식사 시간을 미리 표시해 보세요.",
  },
  금: {
    summary: "하루 일을 어디까지 마치고 쉴지 미리 정하는 데 초점을 둔 풀이예요.",
    example: "할 일이 계속 남는 날에는 오늘 꼭 끝낼 한 가지와 내일로 넘길 일을 적고, 일을 마칠 시각을 정해 보세요.",
  },
  수: {
    summary: "쉴 때도 생각이 계속 이어진다면, 남은 일을 적어서 묶어 두는 방법을 살펴보세요.",
    example: "누워서 내일 할 일이 떠오르면 종이에 한 줄로 적어 두고, 아침에 다시 볼 시간을 정해 보세요.",
  },
};

function character(korean: string, element: Element) {
  return `‘${korean}(${ELEMENT_DETAILS[element].name})’`;
}

function evidence(element: Element, count: number, confirmed: number, reason: string) {
  const { name, hanja } = ELEMENT_DETAILS[element];
  const total = `사주 8글자 중 확인된 ${confirmed}글자에서 ‘${name}(${hanja})’에 해당하는 글자가 ${count}개예요.`;
  const scope = confirmed < 8 ? " 미확정 글자에 따라 전체 개수는 달라질 수 있어요." : "";
  const zero = count === 0 ? " 위 예시와 비슷한 일이 있었는지 떠올려 보세요." : "";
  return `${reason} ${total}${scope}${zero}`;
}

export function readTopic(chart: Chart, topic: PersonalTopic): FortuneText {
  const counts = countElements(chart);
  const confirmed = Object.values(counts).reduce((total, count) => total + count, 0);
  const { day, month, hour } = chart.pillars;
  const own = day.stemElement;
  const first = character(day.korean[0], own);
  const second = character(day.korean[1], day.branchElement);
  const wealth = elementFor(own, "resources");
  const career = elementFor(own, "responsibility");
  const study = elementFor(own, "learning");
  const work = workStyles[month?.branchElement ?? own];
  const romance = romanceStyles[own];
  const marriage = marriageStyles[day.branchElement];
  const rest = restStyles[own];
  const care = hour ? careStyles[hour.branchElement] : {
    summary: "출생 시각을 모를 때는 아이에게 어떤 도움이 필요한지 직접 묻는 예시를 함께 읽어 보세요.",
    example: "아이가 숙제에서 막혔다고 하면 ‘어디부터 어려웠어? 같이 읽어 볼까?’처럼 상황과 원하는 도움을 하나씩 물어보세요.",
  };
  const workSource = month
    ? `일할 환경은 태어난 달의 두 번째 글자 ${character(month.korean[1], month.branchElement)}에서 읽었어요.`
    : `태어난 달의 글자가 미확정이라 일할 환경은 태어난 날의 첫 글자 ${first}에서 읽었어요.`;

  const topics: Record<PersonalTopic, Omit<FortuneText, "notes">> = {
    wealth: {
      summary: moneyStyles[wealth].summary,
      sections: [
        { title: "돈을 쓸 때 이런 경우예요", body: moneyStyles[wealth].example },
        { title: "이렇게 읽은 이유", body: evidence(wealth, counts[wealth], confirmed, `태어난 날의 첫 글자 ${first}에서 출발해, 이 사주에서는 ${ELEMENT_DETAILS[wealth].name}에 해당하는 글자를 돈을 쓰고 관리하는 단서로 봤어요.`) },
      ],
    },
    career: {
      summary: work.summary,
      sections: [
        { title: "일할 때 이런 경우예요", body: work.example },
        { title: "이렇게 읽은 이유", body: evidence(career, counts[career], confirmed, `${workSource} 역할과 책임을 살필 때는 태어난 날의 첫 글자 ${first}를 기준으로 ${ELEMENT_DETAILS[career].name}에 해당하는 글자를 봤어요.`) },
      ],
    },
    romance: {
      summary: romance.summary,
      sections: [
        { title: "마음을 전할 때 이런 모습이에요", body: romance.example },
        { title: "상대에게 이렇게 말해 보세요", body: romanceNeeds[day.branchElement] },
        { title: "이렇게 읽은 이유", body: `태어난 날의 첫 글자 ${first}는 마음을 전하는 방식에, 두 번째 글자 ${second}는 관계에서 편한 방식을 돌아보는 데 썼어요.` },
      ],
    },
    marriage: {
      summary: marriage.summary,
      sections: [
        { title: "함께 정해 볼 생활 기준", body: marriage.example },
        { title: "이렇게 읽은 이유", body: `태어난 날의 두 번째 글자 ${second}를 함께 지낼 때 살펴볼 생활 방식에 연결했어요.` },
      ],
    },
    health: {
      summary: rest.summary,
      sections: [
        { title: "하루를 이렇게 살펴보세요", body: rest.example },
        { title: "이렇게 읽은 이유", body: `태어난 날의 첫 글자 ${first}를 바탕으로 휴식 습관을 돌아볼 예시를 골랐어요.` },
      ],
    },
    study: {
      summary: studyStyles[study].summary,
      sections: [
        { title: "공부할 때 이렇게 해 보세요", body: studyStyles[study].example },
        { title: "이렇게 읽은 이유", body: evidence(study, counts[study], confirmed, `태어난 날의 첫 글자 ${first}를 기준으로 ${ELEMENT_DETAILS[study].name}에 해당하는 글자를 배움의 단서로 봤어요.`) },
      ],
    },
    children: {
      summary: care.summary,
      sections: [
        { title: "아이에게 이렇게 말해 보세요", body: care.example },
        { title: "이렇게 읽은 이유", body: hour ? `태어난 시각에 해당하는 두 번째 글자 ${character(hour.korean[1], hour.branchElement)}를 아이와 대화하는 방식에 연결했어요.` : "출생 시각을 몰라 시각의 글자를 정하기 어려워요. 이 경우 누구나 써 볼 수 있는 대화 예시를 보여줘요." },
      ],
    },
  };

  const notes = ["전통 사주의 상징을 일상에서 어떻게 이해할지 보여주는 참고용 풀이예요."];
  if (chart.unknownTime) notes.push("출생 시각을 몰라 확인할 수 있는 글자로 풀이했어요.");
  if (chart.uncertainFields.some((key) => key !== "hour")) notes.push("사주에서 해나 달이 바뀌는 절기 무렵이라 확인할 수 있었던 글자만 풀이에 썼어요.");
  return { ...topics[topic], notes };
}
