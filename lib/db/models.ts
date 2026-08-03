import mongoose, { Schema, model, models } from "mongoose";

export interface ITopic {
  id: string;
  name: string;
  description: string;
  order: number;
}

export interface IStudyMaterial {
  id: string;
  title: string;
  subject: string;
  fileName: string;
  fileType: string;
  rawText: string;
  summary: string;
  topics: ITopic[];
  chunksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IShortNote {
  id: string;
  materialId: string;
  topic: string;
  bulletPoints: string[];
  definitions: Array<{ term: string; definition: string }>;
  keyFormulas: string[];
  examples: string[];
  summary: string;
  createdAt: string;
}

export interface IStudySession {
  id: string;
  materialId: string;
  type: "quiz" | "feynman";
  topic: string;
  score: number; // 0-100
  totalQuestions?: number;
  correctAnswers?: number;
  strongTopics: string[];
  weakTopics: string[];
  missedConcepts: string[];
  details: any;
  createdAt: string;
}

// Mongoose Schemas for MongoDB integration
const TopicSchema = new Schema<ITopic>({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  order: { type: Number, required: true },
});

const StudyMaterialSchema = new Schema<IStudyMaterial>(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    subject: { type: String, required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, required: true },
    rawText: { type: String, required: true },
    summary: { type: String, required: true },
    topics: [TopicSchema],
    chunksCount: { type: Number, required: true },
    createdAt: { type: String, required: true },
    updatedAt: { type: String, required: true },
  },
  { timestamps: false }
);

const ShortNoteSchema = new Schema<IShortNote>(
  {
    id: { type: String, required: true, unique: true },
    materialId: { type: String, required: true, index: true },
    topic: { type: String, required: true },
    bulletPoints: [{ type: String }],
    definitions: [{ term: String, definition: String }],
    keyFormulas: [{ type: String }],
    examples: [{ type: String }],
    summary: { type: String },
    createdAt: { type: String, required: true },
  },
  { timestamps: false }
);

const StudySessionSchema = new Schema<IStudySession>(
  {
    id: { type: String, required: true, unique: true },
    materialId: { type: String, required: true, index: true },
    type: { type: String, enum: ["quiz", "feynman"], required: true },
    topic: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number },
    correctAnswers: { type: Number },
    strongTopics: [{ type: String }],
    weakTopics: [{ type: String }],
    missedConcepts: [{ type: String }],
    details: { type: Schema.Types.Mixed },
    createdAt: { type: String, required: true },
  },
  { timestamps: false }
);

export const StudyMaterialModel =
  models.StudyMaterial || model<IStudyMaterial>("StudyMaterial", StudyMaterialSchema);

export const ShortNoteModel =
  models.ShortNote || model<IShortNote>("ShortNote", ShortNoteSchema);

export const StudySessionModel =
  models.StudySession || model<IStudySession>("StudySession", StudySessionSchema);
