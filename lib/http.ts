import { SAJU_API_PATH } from "./paths";

export class RequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function requestJson<T>(path: string, method = "GET", data?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(SAJU_API_PATH + path, {
    method,
    signal,
    headers: data === undefined ? undefined : { "content-type": "application/json" },
    body: data === undefined ? undefined : JSON.stringify(data),
    cache: "no-store",
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) {
    throw new RequestError(response.status, result?.error || "연결을 확인하고 다시 시도해 주세요.");
  }
  return result as T;
}

export function messageFor(error: unknown) {
  return error instanceof RequestError ? error.message : "연결을 확인하고 다시 시도해 주세요.";
}
