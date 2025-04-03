import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

const PostSchema = z.object({
  userId: z.string().min(1, { message: 'User ID is required' }),
  subcategoryId: z.string().min(1, { message: 'Subcategory ID is required' }),
  title: z.string().min(1, { message: 'Title must be at least 1 character' }),
  content: z.string().min(1, { message: 'Content must be at least 1 character' }),
  createdAt: z.date().default(() => new Date()),
});

type IPost = z.infer<typeof PostSchema> & Document;

const postSchema: Schema<IPost> = new Schema({
  userId: { type: String, required: true, index: true },
  subcategoryId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Post:Model<IPost> = mongoose.models.Post || mongoose.model<IPost>('Post', postSchema);

export { Post, PostSchema };