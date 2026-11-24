import type { Metadata } from "next";
import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { ReadingFlow } from "@/components/reading-flow";
import {
  ELEMENTS,
  ELEMENT_DETAILS,
  FIRST_YEAR,
  todayInKorea,
} from "@/lib/contracts";
import { SAJU_PUBLIC_URL, SAJU_SITE_ORIGIN } from "@/lib/paths";
import elementFriends from "@/public/element-friends.webp";
import Script from "next/script";

export const revalidate = 86400;

const title = "무료 사주 풀이 · 오행과 궁합 | 사주결";
const description =
  "양력·음력 생년월일로 내 사주와 오행을 무료로 확인하세요. 태어난 시간을 몰라도 성향과 재물운, 직업운, 연애운을 볼 수 있고, 상대방의 생년월일로 궁합을 확인할 수 있어요.";
const shareImage = {
  url: `${SAJU_PUBLIC_URL}/share-card.png`,
  width: 1200,
  height: 630,
  alt: "사주결 무료 사주 풀이와 오행 캐릭터",
};

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: SAJU_PUBLIC_URL },
  robots: { index: true, follow: true, "max-image-preview": "large" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SAJU_PUBLIC_URL,
    siteName: "사주결",
    title,
    description,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

const breadcrumbs = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Test4Funs",
      item: `${SAJU_SITE_ORIGIN}/`,
    },
    { "@type": "ListItem", position: 2, name: "사주결", item: SAJU_PUBLIC_URL },
  ],
};

const questions = [
  {
    question: "태어난 시간을 몰라도 풀이를 볼 수 있나요?",
    answer:
      "네. ‘시각 모름’을 선택하면 태어난 해, 달, 날 중 확인할 수 있는 내용을 풀이해요. 사주에서 해나 달이 바뀌는 절기에는 출생 시각에 따라 해당 글자가 달라질 수 있어요.",
  },
  {
    question: "재물운이나 궁합도 볼 수 있나요?",
    answer:
      "무료 풀이 결과에서 ‘주제별 운세 보기’를 선택하면 재물운, 직업운, 연애운, 결혼운, 건강운, 학업운, 자녀운, 궁합, 대운, 아홉수를 볼 수 있어요. 궁합은 상대방의 출생 정보가 필요해요.",
  },
  {
    question: "풀이에 어떤 계산 기준을 쓰나요?",
    answer: `${FIRST_YEAR}년부터 오늘까지의 국내 출생을 지원해요. 지역별 시각 보정 없이 한국 표준시를 쓰고, 날짜는 자정에 바뀌어요. 사주에서 해는 입춘에, 달은 각 달의 절기가 시작될 때 바뀌어요. 근사 계산한 절기 시작 시각의 앞뒤 10분에는 영향을 받는 글자를 ‘절기 경계로 미확정’이라고 표시해요.`,
  },
];

function HomeIntro() {
  return (
    <section
      aria-labelledby="hero-title"
      className="mb-4 flex flex-col items-start gap-3 rounded-3xl bg-saju-accent-light px-5 pt-4 pb-5 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-8 sm:py-8"
    >
      <Image
        src={elementFriends}
        alt=""
        sizes="(min-width: 1024px) 320px, (min-width: 640px) 220px, 150px"
        loading="eager"
        className="h-auto w-[150px] shrink-0 sm:order-2 sm:w-[220px] lg:w-80"
      />
      <div>
        <h1
          id="hero-title"
          className="text-[1.85rem] leading-tight font-extrabold tracking-[-0.055em] text-saju-ink sm:text-[2.5rem]"
        >
          무료 사주 풀이
        </h1>
        <p className="mt-1.5 max-w-md text-sm leading-6 text-saju-muted sm:mt-2.5 sm:text-[15px]">
          태어난 날에 담긴 오행을 알아보고, 내 성향과 운세를 읽어봐요.
        </p>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main id="main" className="saju-home scroll-mt-24 bg-saju-canvas">
      {process.env.NODE_ENV === "production" && (
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6691879714410770"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c"),
        }}
      />
      <div className="mx-auto max-w-5xl px-4 pt-4 pb-7 sm:px-6 sm:pt-8 sm:pb-9 lg:px-8">
        <HomeIntro />
        <ReadingFlow
          firstYear={FIRST_YEAR}
          lastYear={Number(todayInKorea().slice(0, 4))}
          aside={<ElementsGuide />}
        />
      </div>

      <section
        id="guide"
        aria-labelledby="guide-title"
        className="mx-auto max-w-5xl scroll-mt-24 px-4 pb-9 sm:px-6 sm:pb-12 lg:px-8"
      >
        <div className="flex flex-col gap-2.5 rounded-3xl border border-saju-line bg-saju-surface px-4 py-4 sm:px-6 sm:py-5 lg:flex-row lg:items-start lg:gap-6">
          <h2
            id="guide-title"
            className="shrink-0 text-lg font-bold tracking-[-0.035em] text-saju-ink lg:w-[25%] lg:pt-3"
          >
            자주 묻는 질문
          </h2>
          <div className="min-w-0 flex-1 divide-y divide-saju-line">
            {questions.map(({ question, answer }) => (
              <details key={question} className="group">
                <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 rounded-md py-3 text-sm font-medium text-saju-ink hover:text-saju-accent [&::-webkit-details-marker]:hidden">
                  <span>{question}</span>
                  <ChevronDown
                    aria-hidden
                    size={18}
                    className="shrink-0 text-saju-muted motion-safe:transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="pb-4 pr-5 text-sm leading-7 text-saju-muted">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ElementsGuide() {
  return (
    <aside
      aria-labelledby="elements-title"
      className="min-w-0 rounded-3xl border border-saju-line bg-saju-surface p-4 sm:p-5"
    >
      <h2
        id="elements-title"
        className="text-lg font-bold tracking-[-0.025em] text-saju-ink"
      >
        사주에서 보는 오행
      </h2>
      <p className="mt-1.5 text-sm leading-6 text-saju-muted">
        확인된 사주 글자를 다섯 가지 오행으로 나눠 살펴봐요.
      </p>
      <ul className="mt-4 flex gap-1">
        {ELEMENTS.map((element) => {
          const detail = ELEMENT_DETAILS[element];
          return (
            <li
              key={element}
              className="flex min-w-0 flex-1 flex-col items-center gap-1.5 text-center text-saju-ink"
            >
              <span
                aria-hidden
                className={`flex size-9 items-center justify-center rounded-full text-base font-semibold ${detail.color}`}
              >
                {detail.hanja}
              </span>
              <span className="text-xs font-medium">{detail.name}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
