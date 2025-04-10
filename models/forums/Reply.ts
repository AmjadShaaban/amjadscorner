import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";
import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";

const ReplySchema = z.object({
  content: z.string().min(1, { message: "Reply content is required" }),
  thread: z.string().min(1, { message: "Thread ID is required" }),
  quotedReply: z.string().optional(),
  quotedThread: z.string().optional(),
});

type IReply = {
  content: string;
  thread: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  quotedReply?: mongoose.Types.ObjectId;
  quotedThread?: mongoose.Types.ObjectId;
  edits?: {
    content: string;
    editedAt: Date;
    editedBy: mongoose.Types.ObjectId;
  }[];
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
} & Document;

const replySchema: Schema<IReply> = new Schema(
  {
    content: { type: String, required: true },
    thread: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    quotedReply: { type: Schema.Types.ObjectId, ref: "Reply", default: null },
    quotedThread: { type: Schema.Types.ObjectId, ref: "Thread", default: null },
    edits: [
      {
        content: String,
        editedAt: Date,
        editedBy: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

applyDefaultToJSONTransform(replySchema);

const Reply: Model<IReply> =
  mongoose.models.Reply || mongoose.model<IReply>("Reply", replySchema);

export { Reply, ReplySchema };
