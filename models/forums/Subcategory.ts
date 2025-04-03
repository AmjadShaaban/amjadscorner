import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

const SubcategorySchema = z.object({
  categoryId: z.string().min(1, { message: 'Category ID is required' }),
  name: z.string().min(1, { message: 'Subcategory name is required' }),
  createdAt: z.date().default(() => new Date()),
});

type ISubcategory = z.infer<typeof SubcategorySchema> & Document;

const subcategorySchema: Schema<ISubcategory> = new Schema({
  categoryId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Subcategory:Model<ISubcategory> = mongoose.models.Subcategory || mongoose.model<ISubcategory>('Subcategory', subcategorySchema);

export { Subcategory, SubcategorySchema };