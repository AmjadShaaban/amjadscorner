import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { z } from 'zod';

const ShopItemSchema = z.object({
  name: z.string().min(1, { message: 'Item name is required' }).max(100, { message: 'Item name must be 100 characters or less' }).trim(),
  description: z.string().min(1, { message: 'Description is required' }).max(1000, { message: 'Description must be 1000 characters or less' }).trim(),
  price: z.number().min(0, { message: 'Price must be a positive number' }).max(1000000, { message: 'Price must be less than 1,000,000' }),
  categoryId: z.string().min(1, { message: 'Category ID is required' }),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()).optional(),
});

type IShopItem = z.infer<typeof ShopItemSchema> & Document;

const shopItemSchema: Schema<IShopItem> = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    categoryId: { type: String, required: true, index: true },
},
  { timestamps: true }
);

const ShopItem: Model<IShopItem> = mongoose.models.ShopItem || mongoose.model<IShopItem>('ShopItem', shopItemSchema);

export { ShopItem, ShopItemSchema };