import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";
import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";

const ThreadSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  subcategory: z.string().min(1, { message: "Subcategory ID is required" }),
});

type IThread = {
  title: string;
  content: string;
  edits?: {
    content: string;
    editedAt: Date;
    editedBy: mongoose.Types.ObjectId;
  }[];
  subcategory: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} & Document;

const threadSchema: Schema<IThread> = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
      required: true,
    },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
  }
);

applyDefaultToJSONTransform(threadSchema);

const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", threadSchema);

export { Thread, ThreadSchema };
