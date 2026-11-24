import { z } from "zod";
import { birthSchema } from "./contracts";

export const PERSONAL_TOPICS = ["wealth", "career", "romance", "marriage", "health", "study", "children"] as const;
const personalTopic = z.enum(PERSONAL_TOPICS);
export const DAEUN_PERIOD_MONTHS = 120;

export const FORTUNE_LABELS = {
  wealth: "재물운",
  career: "직업운",
  romance: "연애운",
  marriage: "결혼운",
  health: "건강운",
  study: "학업운",
  children: "자녀운",
  compatibility: "궁합",
  cycles: "대운",
  nine: "아홉수",
} as const;

export const fortuneRequestSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("topic"), topic: personalTopic, birth: birthSchema }).strict(),
  z.object({ kind: z.literal("compatibility"), birth: birthSchema, partner: birthSchema }).strict(),
  z.object({ kind: z.literal("cycles"), birth: birthSchema, directionBasis: z.enum(["male", "female"]) }).strict(),
  z.object({ kind: z.literal("nine"), birth: birthSchema, ageStandard: z.enum(["international", "counting"]) }).strict(),
]);

export const fortuneTextSchema = z.object({
  summary: z.string().min(1).max(400),
  sections: z.array(z.object({ title: z.string().min(1).max(60), body: z.string().min(1).max(600) })).max(3),
  notes: z.array(z.string().min(1).max(240)).max(4),
}).strict();

const monthRange = z.object({ minMonths: z.number().int().nonnegative(), maxMonths: z.number().int().nonnegative() }).strict();

export const fortuneResponseSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("topic"), topic: personalTopic, content: fortuneTextSchema }).strict(),
  z.object({ kind: z.literal("compatibility"), content: fortuneTextSchema }).strict(),
  z.object({
    kind: z.literal("cycles"),
    direction: z.enum(["forward", "backward"]).nullable(),
    startAge: monthRange.nullable(),
    periods: z.array(z.object({
      pillar: z.string().length(2),
      startAge: monthRange,
      theme: z.string().min(1).max(60),
      body: z.string().min(1).max(260),
      current: z.enum(["yes", "possible", "no"]),
    }).strict()).max(10),
    notes: z.array(z.string().min(1).max(240)).max(4),
  }).strict(),
  z.object({
    kind: z.literal("nine"),
    age: z.number().int().nonnegative(),
    isNine: z.boolean(),
    nextAge: z.number().int().positive(),
    nextYear: z.number().int(),
    ageStandard: z.enum(["international", "counting"]),
  }).strict(),
]);

export type PersonalTopic = z.infer<typeof personalTopic>;
export type FortuneRequest = z.infer<typeof fortuneRequestSchema>;
export type FortuneResponse = z.infer<typeof fortuneResponseSchema>;
export type FortuneText = z.infer<typeof fortuneTextSchema>;
