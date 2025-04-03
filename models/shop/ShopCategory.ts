import mongoose, { Schema, Document, Model } from 'mongoose';
import { z } from 'zod';

const ShopCategorySchema = z.object({
  name: z.string().min(1, { message: 'Category name is required' }).max(50, { message: 'Category name must be 50 characters or less' }).trim(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()).optional(),
});

type IShopCategory = z.infer<typeof ShopCategorySchema> & Document;

const shopCategorySchema: Schema<IShopCategory> = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

const ShopCategory: Model<IShopCategory> = mongoose.models.ShopCategory || mongoose.model<IShopCategory>('ShopCategory', shopCategorySchema);

export { ShopCategory, ShopCategorySchema };