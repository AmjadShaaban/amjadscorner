import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

const CategorySchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }),
  createdAt: z.date().default(() => new Date()),
});

type ICategory = z.infer<typeof CategorySchema> & Document;

const categorySchema: Schema<ICategory> = new Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Category:Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);

export { Category, CategorySchema };