import { withAuditAndSoftDelete } from "@/lib/mongoose/baseSchema";
import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";
import mongoose, { Document, Model, Schema } from "mongoose";

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
    ...withAuditAndSoftDelete,
  },
  {
    timestamps: true,
  }
);

applyDefaultToJSONTransform(threadSchema);

const Thread: Model<IThread> =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", threadSchema);

export { Thread };
