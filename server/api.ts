import { Elysia, status } from "elysia";
import { z } from "zod";
import {
  birthSchema, checkoutResponseSchema, errorSchema, orderSchema, readingSchema,
} from "@/lib/contracts";
import { fortuneRequestSchema, fortuneResponseSchema, type FortuneResponse } from "@/lib/fortune-contracts";
import { calculateChart, InputError } from "./calendar";
import { readCycles, readNine } from "./fortune-calendar";
import { readCompatibility } from "./fortune-compatibility";
import { readTopic } from "./fortune-topics";
import { interpret } from "./interpretation";
import { advanceOrder, createOrder, deleteOrder, getOrder, refundOrder, restoreOrder, RETENTION_MS } from "./orders";
import { issueCheckout, verifyCheckout } from "./tokens";
import { SAJU_API_PATH } from "@/lib/paths";

const SESSION_COOKIE = "saju_report";
const PUBLIC_SITE_ORIGIN = "https://test4funs.com";
const secretBody = z.object({ checkoutToken: z.string().min(16).max(4096) }).strict();
const restoreBody = z.object({ code: z.string().regex(/^[\w-]{24}$/) }).strict();
const failure = {
  400: errorSchema, 403: errorSchema, 404: errorSchema, 409: errorSchema,
  413: errorSchema, 429: errorSchema, 500: errorSchema,
};

function cookieHeader(request: Request, session: string, expired = false) {
  const secure = new URL(request.url).protocol === "https:" || Boolean(process.env.DATABASE_URL);
  return `${SESSION_COOKIE}=${session}; Path=${SAJU_API_PATH}; HttpOnly; SameSite=Strict; Max-Age=${expired ? 0 : RETENTION_MS / 1000}${secure ? "; Secure" : ""}`;
}

function missing() {
  return status(404, { error: "조회할 리포트가 없어요. 복구 코드를 확인해 주세요." });
}

export const api = new Elysia({ prefix: "/api" })
  .onRequest(({ request, set }) => {
    set.headers["cache-control"] = "private, no-store";
    set.headers["referrer-policy"] = "no-referrer";
    if (request.method === "GET") return;
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
  .post("/reading", async ({ body }) => {
    const chart = calculateChart(body);
    return { chart, interpretation: interpret(chart, "basic"), checkoutToken: await issueCheckout(chart) };
  }, { body: birthSchema, response: { 200: readingSchema, ...failure } })
  .post("/fortunes", ({ body }): FortuneResponse => {
    switch (body.kind) {
      case "topic": return { kind: body.kind, topic: body.topic, content: readTopic(calculateChart(body.birth), body.topic) };
      case "compatibility": return { kind: body.kind, content: readCompatibility(calculateChart(body.birth), calculateChart(body.partner)) };
      case "cycles": return readCycles(body.birth, body.directionBasis);
      case "nine": return readNine(body.birth, body.ageStandard);
    }
  }, { body: fortuneRequestSchema, response: { 200: fortuneResponseSchema, ...failure } })
  .post("/orders", async ({ body, request, set }) => {
    const token = await verifyCheckout(body.checkoutToken);
    if (!token) return status(400, { error: "무료 풀이를 다시 확인한 뒤 리포트를 신청해 주세요." });
    const purchase = await createOrder(token.id, token.chart);
    if (!purchase) return status(409, { error: "이미 처리한 주문이에요. 내 리포트에서 조회하거나 복구 코드를 입력해 주세요." });
    set.headers["set-cookie"] = cookieHeader(request, purchase.session);
    return { order: purchase.order, recoveryCode: purchase.recoveryCode };
  }, { body: secretBody, response: { 200: checkoutResponseSchema, ...failure } })
  .post("/orders/restore", async ({ body, request, set }) => {
    const restored = await restoreOrder(body.code);
    if (restored.kind === "limited") return status(429, { error: "복구 시도가 많아요. 잠시 뒤 다시 시도해 주세요." });
    if (restored.kind === "missing") return missing();
    set.headers["set-cookie"] = cookieHeader(request, restored.session);
    return restored.order;
  }, { body: restoreBody, response: { 200: orderSchema, ...failure } })
  .get("/orders/current", async ({ cookie }) => {
    const session = cookie[SESSION_COOKIE]?.value;
    if (typeof session !== "string") return missing();
    return await getOrder(session) ?? missing();
  }, { response: { 200: orderSchema, ...failure } })
  .post("/orders/current/process", async ({ cookie, body }) => {
    const session = cookie[SESSION_COOKIE]?.value;
    if (typeof session !== "string") return missing();
    return await advanceOrder(session, body.retry) ?? missing();
  }, { body: z.object({ retry: z.boolean() }).strict(), response: { 200: orderSchema, ...failure } })
  .post("/orders/current/refund", async ({ cookie }) => {
    const session = cookie[SESSION_COOKIE]?.value;
    if (typeof session !== "string") return missing();
    return await refundOrder(session) ?? missing();
  }, { response: { 200: orderSchema, ...failure } })
  .delete("/orders/current", async ({ cookie, request, set }) => {
    const session = cookie[SESSION_COOKIE]?.value;
    if (typeof session !== "string" || !await deleteOrder(session)) return missing();
    set.headers["set-cookie"] = cookieHeader(request, "", true);
    return { deleted: true as const };
  }, { response: { 200: z.object({ deleted: z.literal(true) }), ...failure } });
