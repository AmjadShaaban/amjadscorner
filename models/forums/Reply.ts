import { withAuditAndSoftDelete } from "@/lib/mongoose/baseSchema";
import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";
import mongoose, { Document, Model, Schema } from "mongoose";

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
    ...withAuditAndSoftDelete,
  },
  {
    timestamps: true,
  }
);

applyDefaultToJSONTransform(replySchema);

const Reply: Model<IReply> =
  mongoose.models.Reply || mongoose.model<IReply>("Reply", replySchema);

export { Reply };
