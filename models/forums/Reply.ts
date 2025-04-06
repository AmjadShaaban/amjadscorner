import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";
import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";

const ReplySchema = z.object({
  content: z.string().min(1, { message: "Reply content is required" }),
  thread: z.string().min(1, { message: "Thread ID is required" }),
});

type IReply = {
  content: string;
  thread: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
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

applyDefaultToJSONTransform(replySchema);

const Reply: Model<IReply> =
  mongoose.models.Reply || mongoose.model<IReply>("Reply", replySchema);

export { Reply, ReplySchema };
