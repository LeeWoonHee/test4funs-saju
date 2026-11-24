import { Elysia, status } from "elysia";
import { birthSchema, errorSchema, readingSchema } from "@/lib/contracts";
import { fortuneRequestSchema, fortuneResponseSchema, type FortuneResponse } from "@/lib/fortune-contracts";
import { calculateChart, InputError } from "./calendar";
import { readCycles, readNine } from "./fortune-calendar";
import { readCompatibility } from "./fortune-compatibility";
import { readTopic } from "./fortune-topics";
import { interpret } from "./interpretation";

const PUBLIC_SITE_ORIGIN = "https://test4funs.com";
const failure = {
  400: errorSchema, 403: errorSchema, 404: errorSchema, 413: errorSchema, 500: errorSchema,
};

export const api = new Elysia({ prefix: "/api" })
  .onRequest(({ request, set }) => {
    set.headers["cache-control"] = "private, no-store";
    set.headers["referrer-policy"] = "no-referrer";
    const url = new URL(request.url);
    const origin = request.headers.get("origin");
    const host = request.headers.get("host") ?? url.host;
    if (request.headers.get("sec-fetch-site") === "cross-site" ||
      (origin && origin !== PUBLIC_SITE_ORIGIN && origin !== url.origin && origin !== `${url.protocol}//${host}`)) {
      return status(403, { error: "이 사이트에서 요청을 다시 보내 주세요." });
    }
    if (Number(request.headers.get("content-length")) > 6000) {
      return status(413, { error: "입력 내용이 너무 길어요." });
    }
  })
  .onError(({ code, error }) => {
    if (error instanceof InputError) return status(400, { error: error.message });
    if (code === "VALIDATION" || code === "PARSE") return status(400, { error: "입력한 정보를 확인해 주세요." });
    if (code === "NOT_FOUND") return status(404, { error: "요청한 기능을 찾을 수 없어요." });
    return status(500, { error: "잠시 후 다시 시도해 주세요." });
  })
  .post("/reading", ({ body }) => {
    const chart = calculateChart(body);
    return { chart, interpretation: interpret(chart) };
  }, { body: birthSchema, response: { 200: readingSchema, ...failure } })
  .post("/fortunes", ({ body }): FortuneResponse => {
    switch (body.kind) {
      case "topic": return { kind: body.kind, topic: body.topic, content: readTopic(calculateChart(body.birth), body.topic) };
      case "compatibility": return { kind: body.kind, content: readCompatibility(calculateChart(body.birth), calculateChart(body.partner)) };
      case "cycles": return readCycles(body.birth, body.directionBasis);
      case "nine": return readNine(body.birth, body.ageStandard);
    }
  }, { body: fortuneRequestSchema, response: { 200: fortuneResponseSchema, ...failure } });
