import { ELEMENTS } from "@/lib/contracts";

export type Element = typeof ELEMENTS[number];
export const RELATIONS = ["peer", "expression", "resources", "responsibility", "learning"] as const;
export type Relation = typeof RELATIONS[number];

// The elements are ordered in the traditional generating cycle. Two steps is the controlling cycle.
export function relationOf(origin: Element, other: Element): Relation {
  return RELATIONS[(ELEMENTS.indexOf(other) - ELEMENTS.indexOf(origin) + ELEMENTS.length) % ELEMENTS.length];
}

export function elementFor(origin: Element, relation: Relation): Element {
  return ELEMENTS[(ELEMENTS.indexOf(origin) + RELATIONS.indexOf(relation)) % ELEMENTS.length];
}

export const relationThemes: Record<Relation, { label: string; body: string }> = {
  peer: { label: "혼자 할 일과 함께할 일", body: "다른 사람과 일을 맡을 때 역할을 나눠 보는 주제예요. 예를 들어 모임을 준비한다면 장소를 예약할 사람과 인원을 확인할 사람을 먼저 정해 보세요." },
  expression: { label: "생각을 말이나 글로 꺼내기", body: "생각해 둔 것을 작게라도 보여주는 주제예요. 아이디어가 있다면 메모 세 줄을 써서 한 사람에게만 보여주고, 무엇이 잘 전달됐는지 물어보세요." },
  resources: { label: "시간과 돈을 어디에 쓰는지 확인하기", body: "내가 원하는 일에 실제로 시간과 돈을 쓰는지 돌아보는 주제예요. 지난주 일정과 지출에서 다음 주에도 유지하고 싶은 것 하나를 골라 보세요." },
  responsibility: { label: "내가 맡은 일의 범위 정하기", body: "어디까지 내가 맡고 언제 끝내야 하는지 정하는 주제예요. 새 역할을 맡을 때 내 몫과 함께 결정할 일, 마감일을 먼저 확인해 보세요." },
  learning: { label: "배운 것을 직접 써 보기", body: "필요한 것을 배우고 써 보는 주제예요. 막힌 일이 있다면 경험 있는 사람에게 질문 하나를 하고, 들은 답을 바로 적용할 수 있는 일부터 골라 보세요." },
};
