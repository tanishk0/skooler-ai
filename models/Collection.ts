import mongoose, { Schema, InferSchemaType } from "mongoose";

const collectionSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: "",
      maxlength: 300,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

collectionSchema.index({ userId: 1, createdAt: -1 });

export type CollectionDoc = InferSchemaType<typeof collectionSchema>;

if (process.env.NODE_ENV === "development" && mongoose.models.Collection) {
  delete (mongoose.models as Record<string, unknown>).Collection;
}

export default mongoose.models.Collection ||
  mongoose.model("Collection", collectionSchema);
