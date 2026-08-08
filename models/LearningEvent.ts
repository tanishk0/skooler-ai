import mongoose, { Schema, InferSchemaType } from "mongoose";

const learningEventSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "LearningSession",
      required: true,
      index: true,
    },
    parentEventId: {
      type: Schema.Types.ObjectId,
      ref: "LearningEvent",
      default: null,
    },
    sequence: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "teaching",
        "understanding_check",
        "choice",
        "feynman",
        "prediction",
        "multiple_choice",
        "short_answer",
        "user_answer",
        "evaluation",
        "reteach",
        "mastered",
        "concept_transition",
      ],
      required: true,
    },
    role: {
      type: String,
      enum: ["assistant", "user"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      default: "",
    },
    moduleId: {
      type: String,
      default: null,
    },
    conceptId: {
      type: String,
      default: "",
    },
    conceptName: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

learningEventSchema.index({ sessionId: 1, sequence: 1 }, { unique: true });

export type LearningEventDoc = InferSchemaType<typeof learningEventSchema>;

// Clear cached model in development to ensure updated enum values apply immediately
if (process.env.NODE_ENV === "development" && mongoose.models.LearningEvent) {
  delete (mongoose.models as Record<string, unknown>).LearningEvent;
}

export default mongoose.models.LearningEvent ||
  mongoose.model("LearningEvent", learningEventSchema);
