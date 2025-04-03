import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

const ReplySchema = z.object({
  postId: z.string().min(1, { message: 'Post ID is required' }),
  userId: z.string().min(1, { message: 'User ID is required' }),
  content: z.string().min(1, { message: 'Content must be at least 1 character' }),
  quotedReplyId: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
});

type IReply = z.infer<typeof ReplySchema> & Document;

const replySchema: Schema<IReply> = new Schema({
  postId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  quotedReplyId: { type: String, index: true },
  createdAt: { type: Date, default: Date.now },
});

const Reply:Model<IReply> = mongoose.models.Reply || mongoose.model<IReply>('Reply', replySchema);

export { Reply, ReplySchema };