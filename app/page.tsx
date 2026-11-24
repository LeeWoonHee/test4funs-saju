import { ChevronDown, ShieldCheck } from "lucide-react";
import { ReadingFlow } from "@/components/reading-flow";
import { ELEMENTS, ELEMENT_DETAILS, FIRST_YEAR, REPORT_PRICE_LABEL, REPORT_TITLE, todayInKorea } from "@/lib/contracts";

export const revalidate = 86400;

const questions = [
  { question: "태어난 시간을 몰라도 풀이를 볼 수 있나요?", answer: "네. ‘시각 모름’을 선택하면 태어난 해, 달, 날 중 확인할 수 있는 내용을 풀이해요. 사주에서 해나 달이 바뀌는 절기에는 출생 시각에 따라 해당 글자가 달라질 수 있어요." },
  { question: "재물운이나 궁합도 볼 수 있나요?", answer: "무료 풀이 결과에서 ‘주제별 운세 보기’를 선택하면 재물운, 직업운, 연애운, 결혼운, 건강운, 학업운, 자녀운, 궁합, 대운, 아홉수를 볼 수 있어요. 궁합은 상대방의 출생 정보가 필요해요." },
  { question: "풀이에 어떤 계산 기준을 쓰나요?", answer: `${FIRST_YEAR}년부터 오늘까지의 국내 출생을 지원해요. 지역별 시각 보정 없이 한국 표준시를 쓰고, 날짜는 자정에 바뀌어요. 사주에서 해는 입춘에, 달은 각 달의 절기가 시작될 때 바뀌어요. 근사 계산한 절기 시작 시각의 앞뒤 10분에는 영향을 받는 글자를 ‘절기 경계로 미확정’이라고 표시해요.` },
  { question: "관계 리포트는 어떻게 다시 보나요?", answer: `${REPORT_TITLE}의 기준 가격은 ${REPORT_PRICE_LABEL}이에요. 현재 미리보기의 모의 결제에서 복구 코드를 발급해요. 같은 기기의 내 리포트에서 다시 보거나, 새 기기에서 30일 안에 복구 코드를 입력할 수 있어요.` },
  { question: "환불하거나 삭제할 수 있나요?", answer: "내 리포트에서 모의 환불을 신청하거나 리포트를 삭제할 수 있어요. 환불 신청 즉시 리포트 접근이 중단되고, 모의 정산 후 완료 상태를 보여줘요. 삭제하면 리포트와 복구 코드가 폐기돼요." },
];

function HomeIntro() {
  return (
    <div className="mb-5 max-w-2xl sm:mb-8">
      <h1 id="hero-title" className="text-[2rem] leading-tight font-extrabold tracking-[-0.055em] text-saju-ink sm:text-[2.75rem]">
        무료 사주 풀이
      </h1>
      <p className="mt-2 text-sm leading-6 text-saju-muted sm:mt-3 sm:text-base">
        생년월일로 사주와 오행을 확인하고, 재물·직업·연애 풀이를 읽어보세요.
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <main id="main" className="saju-home scroll-mt-24 bg-saju-canvas">
      <div className="mx-auto max-w-6xl px-4 pt-7 pb-10 sm:px-6 sm:pt-12 sm:pb-15 lg:px-8">
        <HomeIntro />
        <ReadingFlow
          firstYear={FIRST_YEAR}
          lastYear={Number(todayInKorea().slice(0, 4))}
          aside={<ElementsGuide />}
        />
      </div>

      <section id="guide" aria-labelledby="guide-title" className="scroll-mt-24 border-y border-saju-line bg-saju-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-9 sm:px-6 sm:py-12 lg:flex-row lg:items-start lg:gap-12 lg:px-8">
          <h2 id="guide-title" className="shrink-0 text-2xl font-bold tracking-[-0.045em] text-saju-ink lg:w-[30%]">
            자주 묻는 질문
          </h2>
          <div className="min-w-0 flex-1 divide-y divide-saju-line border-y border-saju-line">
            {questions.map(({ question, answer }) => (
              <details key={question} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-md py-3.5 text-[15px] font-medium text-saju-ink hover:text-saju-accent [&::-webkit-details-marker]:hidden">
                  <span>{question}</span>
                  <ChevronDown aria-hidden size={18} className="shrink-0 text-saju-muted motion-safe:transition-transform group-open:rotate-180" />
                </summary>
                <p className="pb-4 pr-5 text-sm leading-7 text-saju-muted">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section id="privacy" aria-labelledby="privacy-title" className="mx-auto flex max-w-6xl scroll-mt-24 items-start gap-3.5 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <ShieldCheck size={20} aria-hidden className="mt-0.5 shrink-0 text-saju-muted" />
        <div>
          <h2 id="privacy-title" className="text-sm font-semibold text-saju-ink">개인정보 안내</h2>
          <p className="mt-1 max-w-3xl text-sm leading-7 text-saju-muted">
            입력한 생년월일과 시각은 계산 요청에만 사용해요. 모의 구매 시 리포트와 접근 정보는 최대 30일 동안 조회할 수 있어요. 내 리포트에서 삭제하면 리포트·복구 코드·접근 권한이 폐기되고, 상품과 금액 등 모의 주문 기록만 만료일까지 남아요.
          </p>
        </div>
      </section>
    </main>
  );
}

function ElementsGuide() {
  return (
    <aside aria-labelledby="elements-title" className="min-w-0 border-b border-saju-line pb-5">
      <h2 id="elements-title" className="text-lg font-bold tracking-[-0.025em] text-saju-ink">사주에서 보는 오행</h2>
      <p className="mt-1.5 text-sm leading-6 text-saju-muted">확인된 사주 글자를 다섯 가지 오행으로 나눠 살펴봐요.</p>
      <ul className="mt-4 flex divide-x divide-saju-line overflow-hidden rounded-lg border border-saju-line bg-saju-surface">
        {ELEMENTS.map((element) => {
          const detail = ELEMENT_DETAILS[element];
          return (
            <li key={element} className="flex min-w-0 flex-1 flex-col items-center gap-1.5 px-1 py-3 text-center text-saju-ink">
              <span aria-hidden className={`flex size-8 items-center justify-center rounded-md text-base font-semibold ${detail.color}`}>{detail.hanja}</span>
              <span className="text-xs font-medium">{detail.name}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
