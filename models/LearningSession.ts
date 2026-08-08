import mongoose, { Schema, InferSchemaType } from "mongoose";

const learningSessionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
    },
    collectionId: {
      type: Schema.Types.Mixed,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    mastery: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    learningState: {
      type: Schema.Types.Mixed,
      default: {},
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

learningSessionSchema.index({ userId: 1, collectionId: 1 });

export type LearningSession = InferSchemaType<typeof learningSessionSchema>;

if (process.env.NODE_ENV === "development" && mongoose.models.LearningSession) {
  delete (mongoose.models as Record<string, unknown>).LearningSession;
}

export default mongoose.models.LearningSession ||
  mongoose.model("LearningSession", learningSessionSchema);
