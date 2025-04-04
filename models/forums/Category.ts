import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { z } from "zod";

const CategorySchema = z.object({
  name: z.string().min(1, { message: "Category name is required" }),
});

interface ICategory extends Document {
  name: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  deletedBy?: Types.ObjectId | null;
  deletedAt?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema: Schema<ICategory> = new Schema(
  {
    name: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);

export { Category, CategorySchema };
