import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";
import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";

const ReplySchema = z.object({
  content: z.string().min(1, { message: "Reply content is required" }),
  post: z.string().min(1, { message: "Post ID is required" }),
});

type IReply = {
  content: string;
  post: mongoose.Types.ObjectId;
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
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
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
