import { ChevronDown } from "lucide-react";
import { countElements, ELEMENTS, ELEMENT_DETAILS, PILLAR_KEYS, PILLAR_PERIODS, type Chart } from "@/lib/contracts";

export function ReadingChart({ chart }: { chart: Chart }) {
  const counts = countElements(chart);
  const confirmed = Object.values(counts).reduce((total, count) => total + count, 0);

  return (
    <details className="group mt-6 rounded-2xl border border-frost bg-soft-vellum px-4 sm:px-5">
      <summary className="flex min-h-13 cursor-pointer list-none items-center justify-between gap-3 py-3.5 text-sm font-semibold text-ink-black hover:text-midnight-navy [&::-webkit-details-marker]:hidden">
        <span className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          사주 글자와 오행 보기
          <span className="text-xs font-medium text-smoke">8글자 중 {confirmed}개 확인</span>
        </span>
        <ChevronDown aria-hidden size={18} className="shrink-0 text-smoke motion-safe:transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-frost pt-4 pb-5">
        <dl aria-label="태어난 해, 달, 날, 시각의 사주 글자" className="flex flex-wrap gap-2.5 sm:gap-3">
          {PILLAR_KEYS.map((key) => {
            const pillar = chart.pillars[key];
            const isConfirmed = pillar && !chart.uncertainFields.includes(key);
            return (
              <div key={key} className="flex min-w-[90px] flex-1 flex-col overflow-hidden rounded-xl border border-frost bg-paper-white text-center">
                <dt className="bg-saju-accent-light px-2 py-1.5 text-xs font-semibold text-saju-accent-hover">
                  {PILLAR_PERIODS[key]}
                </dt>
                {isConfirmed ? (
                  <dd className="flex flex-1 gap-1.5 p-2">
                    {([pillar.stemElement, pillar.branchElement] as const).map((element, index) => (
                      <span key={index} className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-md px-1 py-2 ${ELEMENT_DETAILS[element].color}`}>
                        <span aria-hidden className="font-serif text-xl leading-tight font-semibold">{pillar.hanja[index]}</span>
                        <span className="text-xs font-medium">{pillar.korean[index]}</span>
                        <span className="text-xs">{ELEMENT_DETAILS[element].name}</span>
                      </span>
                    ))}
                  </dd>
                ) : (
                  <dd className="flex flex-1 items-center justify-center px-2 py-4 text-xs leading-5 text-smoke">
                    {key === "hour" ? "출생 시각 모름" : "절기 경계로 미확정"}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>

        <h3 className="mt-5 text-sm font-semibold text-ink-black">확인된 글자의 오행 분포</h3>
        <p className="mt-1 text-sm leading-6 text-smoke">
          확인된 글자마다 대표 오행을 하나씩 세었어요. 전통 명리에서는 계절과 글자 사이의 관계도 살펴요.
          {confirmed < 8 && " 미확정 글자에 따라 전체 분포는 달라질 수 있어요."}
        </p>
        <dl aria-label="오행별 글자 수" className="mt-3 flex gap-1.5 sm:gap-2">
          {ELEMENTS.map((element) => (
            <div key={element} className={`flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-[10px] px-1 py-2.5 ${ELEMENT_DETAILS[element].color}`}>
              <dt className="text-xs font-medium">{ELEMENT_DETAILS[element].name}</dt>
              <dd className="text-base font-semibold">{counts[element]}개</dd>
            </div>
          ))}
        </dl>
      </div>
    </details>
  );
}
