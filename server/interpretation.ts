import { PILLAR_KEYS, interpretationSchema, type Chart, type Interpretation } from "@/lib/contracts";
import { buildBasicReading } from "./basic-reading";

export function interpret(chart: Chart): Interpretation {
  const referencedPillars = PILLAR_KEYS.flatMap((key) => {
    const pillar = chart.pillars[key];
    return pillar ? [{ key, korean: pillar.korean }] : [];
  });
  if (referencedPillars.some(({ key }) => chart.uncertainFields.includes(key))) {
    throw new Error("Interpretation does not match the chart");
  }
  return interpretationSchema.parse({
    calculationVersion: chart.calculationVersion,
    referencedPillars,
    ...buildBasicReading(chart),
  });
}
