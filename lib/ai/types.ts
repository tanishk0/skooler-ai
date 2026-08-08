/**
 * HTTP contract for skooler-ai-engine. The FastAPI APIModel alias generator
 * serializes Pydantic fields as camelCase, so these names deliberately match
 * the JSON received by Next.js rather than the Python attribute names.
 */
export type InputType = "topic" | "text" | "pdf" | "image";

export type LearningStage =
  | "awaiting_understanding_check"
  | "awaiting_continue_after_understood"
  | "awaiting_continue_after_reteach"
  | "awaiting_interaction_response"
  | "awaiting_continue_after_evaluation"
  | "awaiting_continue_after_concept_transition"
  | "complete";

export type LearningAction =
  | "reteach"
  | "clarify"
  | "try_again"
  | "deepen"
  | "ask_again"
  | "test_deeper"
  | "teach_next"
  | "complete";

export type InteractionType =
  | "understanding_check"
  | "choice"
  | "feynman"
  | "prediction"
  | "multiple_choice"
  | "short_answer";

export type LearningEventType =
  | "teaching"
  | "understanding_check"
  | "choice"
  | "feynman"
  | "prediction"
  | "multiple_choice"
  | "short_answer"
  | "user_answer"
  | "evaluation"
  | "reteach"
  | "mastered"
  | "concept_transition";

export const INTERACTIVE_EVENT_TYPES: readonly InteractionType[] = [
  "understanding_check",
  "choice",
  "feynman",
  "prediction",
  "multiple_choice",
  "short_answer",
];

export interface Concept {
  id: string;
  name: string;
  description: string;
  status: "not_started" | "in_progress" | "partial" | "mastered";
  attempts: number;
  moduleId?: string | null;
  depth?: number;
  targetDepth?: number;
  importance?: string;
  difficulty?: number;
  prerequisites?: string[];
  misconceptions?: string[];
  teachingDepth?: string;
  suitableInteractions?: string[];
  masteryEvidence?: string[];
  requiresApplication?: boolean;
}

export interface LearningModule {
  id: string;
  name: string;
  description: string;
  concepts: Concept[];
  prerequisites: string[];
  status: "not_started" | "in_progress" | "partial" | "mastered";
  progress: number;
}

export interface LearningPlan {
  topic: string;
  prerequisites: string[];
  modules?: LearningModule[];
  concepts: Concept[];
  commonMisconceptions: string[];
  masteryQuestions: string[];
}

export interface InteractionOption {
  id: string;
  label: string;
}

export interface InteractionPrompt {
  type: InteractionType;
  question: string;
  options: InteractionOption[];
}

export interface SourceChunk {
  chunkId: string;
  content: string;
  type: "title" | "heading" | "paragraph" | "list" | "table" | "image";
  heading: string | null;
  page: number | null;
  source: string | null;
  metadata: Record<string, unknown>;
}

export interface LearningState {
  sessionId: string;
  topic: string;
  inputType: InputType;
  concepts: Concept[];
  plan: LearningPlan | null;
  currentModuleIndex?: number;
  currentModuleId?: string | null;
  currentConceptIndex: number;
  currentConceptId: string | null;
  conceptDepth?: number;
  evidenceCount?: number;
  currentStage: LearningStage;
  currentInteraction: InteractionPrompt | null;
  conceptProgress: Record<string, number>;
  moduleProgress?: Record<string, number>;
  mastery: number;
  pendingAction: LearningAction | null;
  lastEvaluation?: Evaluation | null;
  eventSequence: number;
  stage: LearningStage;
  misconceptions: string[];
  recentInteractions: Array<Record<string, string>>;
  sourceChunks: SourceChunk[];
}

export interface Evaluation {
  understanding: "incorrect" | "partial" | "correct" | "mastered";
  confidence: number;
  masteryReached?: boolean;
  misconceptions: string[];
  missingConcepts: string[];
  reasoningQuality: "weak" | "adequate" | "strong";
  nextAction: LearningAction;
  feedback: string;
}

export interface FastApiEvent {
  sequence: number;
  type: LearningEventType;
  moduleId?: string | null;
  conceptId: string | null;
  content: string;
  question: string | null;
  options: InteractionOption[];
  metadata: Record<string, unknown>;
}

export interface LearningEventMetadata extends Record<string, unknown> {
  options?: InteractionOption[];
  evaluation?: Evaluation;
}

/** A MongoDB event serialized by the Next.js API for browser use. */
export interface LearningEvent {
  _id: string;
  sessionId: string;
  parentEventId: string | null;
  sequence: number;
  type: LearningEventType;
  role: "assistant" | "user";
  content: string;
  moduleId?: string | null;
  conceptId: string | null;
  conceptName: string | null;
  metadata: LearningEventMetadata | null;
  createdAt: string;
}

export type InteractionResponse =
  | { type: "understanding_check"; value: "understood" | "not_understood" }
  | { type: Exclude<InteractionType, "understanding_check">; value: string };

export interface StartLearningRequest {
  sessionId: string;
  inputType: InputType;
  topic: string;
  content?: string | null;
  sourceChunks?: SourceChunk[] | null;
}

export interface TopicValidationRequest {
  topic: string;
}

export interface TopicValidationResult {
  isValid: boolean;
  normalizedTopic: string | null;
  message: string;
}

export interface StartLearningResponse {
  sessionId: string;
  stage: LearningStage;
  concept: string;
  message: string;
  question: string;
  learningState: LearningState;
  events: FastApiEvent[];
  isComplete: boolean;
}

export interface RespondLearningRequest {
  sessionId: string;
  userResponse: string;
  learningState: LearningState;
}

export interface ContinueLearningRequest {
  sessionId: string;
  learningState: LearningState;
}

export interface RespondLearningResponse {
  sessionId: string;
  stage: LearningStage;
  action: LearningAction;
  concept: string | null;
  message: string;
  question: string | null;
  evaluation: Evaluation | null;
  learningState: LearningState;
  events: FastApiEvent[];
  isComplete: boolean;
}

export interface ContinueLearningResponse {
  sessionId: string;
  stage: LearningStage;
  action: LearningAction | null;
  concept: string | null;
  message: string | null;
  question: string | null;
  learningState: LearningState;
  events: FastApiEvent[];
  isComplete: boolean;
}
