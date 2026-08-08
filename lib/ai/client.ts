import {
  ContinueLearningRequest,
  ContinueLearningResponse,
  RespondLearningRequest,
  RespondLearningResponse,
  StartLearningRequest,
  StartLearningResponse,
  TopicValidationRequest,
  TopicValidationResult,
} from "./types";

const TIMEOUT_MS = 45_000;

function getBaseUrl(): string {
  return (process.env.AI_API_URL || "http://localhost:8000").replace(/\/$/, "");
}

export class AIClientError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly data?: unknown,
  ) {
    super(message);
    this.name = "AIClientError";
  }
}

async function post<T>(path: string, body: object): Promise<T> {
  const baseUrl = getBaseUrl();

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const data: unknown = await response.json().catch(async () => response.text());

    if (!response.ok) {
      throw new AIClientError(
        `FastAPI ${path} returned ${response.status}`,
        response.status,
        data,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof AIClientError) throw error;
    const cause = error instanceof Error ? error : new Error("Unknown network error");
    if (cause.name === "TimeoutError" || cause.name === "AbortError") {
      throw new AIClientError("FastAPI service timed out", 504);
    }
    throw new AIClientError(
      `Failed to connect to AI service at ${baseUrl}: ${cause.message}`,
      503,
    );
  }
}

export function startLearning(input: StartLearningRequest): Promise<StartLearningResponse> {
  return post("/learning/start", input);
}

export function validateTopic(input: TopicValidationRequest): Promise<TopicValidationResult> {
  return post("/learning/validate-topic", input);
}

export function respondToLearning(input: RespondLearningRequest): Promise<RespondLearningResponse> {
  return post("/learning/respond", input);
}

export function continueLearning(input: ContinueLearningRequest): Promise<ContinueLearningResponse> {
  return post("/learning/continue", input);
}
