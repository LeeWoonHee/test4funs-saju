import { ELEMENT_DETAILS, type Chart } from "@/lib/contracts";
import type { FortuneText } from "@/lib/fortune-contracts";
import { relationOf } from "./fortune-elements";

const DAY_BRANCH_PAIRS = ["자축", "인해", "묘술", "진유", "사신", "오미"];
const OPPOSITE_BRANCH_PAIRS = ["자오", "축미", "인신", "묘유", "진술", "사해"];

export function readCompatibility(first: Chart, second: Chart): FortuneText {
  const mine = first.pillars.day;
  const theirs = second.pillars.day;
  const relation = relationOf(mine.stemElement, theirs.stemElement);
  const reverse = relationOf(theirs.stemElement, mine.stemElement);
  const name = ELEMENT_DETAILS[mine.stemElement].name;
  const other = ELEMENT_DETAILS[theirs.stemElement].name;
  const pair = mine.korean[1] + theirs.korean[1];
  const flipped = theirs.korean[1] + mine.korean[1];

  const exchange = relation === "peer"
    ? {
      summary: "의견을 정리하는 방식에서 서로 비슷함을 느낄 수 있는 조합으로 풀이해요.",
      example: "여행지를 고를 때 두 사람 모두 같은 곳을 좋아해도 이유는 다를 수 있어요. ‘나는 이동이 편해서 좋아. 너는 어떤 점이 좋아?’라고 물어보세요.",
    }
    : relation === "expression" || reverse === "expression"
      ? {
        summary: "한 사람이 먼저 제안하면 다른 사람이 아이디어를 더하는 조합으로 풀이해요.",
        example: "한 사람이 ‘이번 주에 만나자’고 하면 다른 사람이 장소를 제안하는 식이에요. 늘 같은 사람이 먼저 말을 꺼낸다면 다음 약속은 역할을 바꿔 보세요.",
      }
      : {
        summary: "같은 결정을 앞두고도 서로 다른 조건을 먼저 볼 수 있는 조합으로 풀이해요.",
        example: "여행지를 고를 때 한 사람은 비용을, 다른 사람은 이동 시간을 먼저 볼 수 있어요. 장소를 정하기 전에 각자 중요한 조건을 하나씩 말해 보세요.",
      };

  const routine = DAY_BRANCH_PAIRS.some((match) => match === pair || match === flipped)
    ? "함께 정해 두면 편할 작은 약속을 하나 골라 보세요. 약속이 바뀌면 언제까지 알려 주면 좋을지부터 이야기할 수 있어요."
    : OPPOSITE_BRANCH_PAIRS.some((match) => match === pair || match === flipped)
      ? "생활 속도가 다르게 느껴질 때는 한 가지씩 맞춰 보세요. 답장을 바로 받고 싶은지, 바쁜 날은 저녁에 한 번 연락해도 괜찮은지 물어보세요."
      : pair === flipped
        ? "비슷한 속도로 지낸다고 느껴도 쉬는 방법은 다를 수 있어요. 주말에 같이 보내고 싶은 시간과 혼자 쉬고 싶은 시간을 각각 말해 보세요."
        : "함께 보내는 시간과 각자 쓰는 시간에 대해 말해 보세요. 주말 하루를 함께 지내면 나머지 하루를 어떻게 보내고 싶은지부터 물어보세요.";

  return {
    summary: exchange.summary,
    sections: [
      { title: "대화할 때 이런 모습이에요", body: exchange.example },
      { title: "함께 지낼 때 맞춰 볼 점", body: routine },
      { title: "이렇게 읽은 이유", body: `태어난 날의 첫 글자 ‘${mine.korean[0]}’, ‘${theirs.korean[0]}’의 오행인 ${name}, ${other}로 대화 방식을 읽었어요. 둘째 글자 ‘${mine.korean[1]}’, ‘${theirs.korean[1]}’로 생활에서 맞춰 볼 점을 골랐어요.` },
    ],
    notes: ["두 사람의 태어난 날에 해당하는 두 글자만 비교하는 간단한 전통 궁합 풀이예요."],
  };
}
