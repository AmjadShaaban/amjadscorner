import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { z } from "zod";

// Zod schema for API validation
const SubcategorySchema = z.object({
  name: z.string().min(1, { message: "Subcategory name is required" }),
  categoryId: z.string().min(1, { message: "Category ID is required" }),
});

interface ISubcategory extends Document {
  name: string;
  category: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  deletedBy?: Types.ObjectId | null;
  deletedAt?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const subcategorySchema = new Schema<ISubcategory>(
  {
    name: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    deletedAt: { type: Date, default: null },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Subcategory: Model<ISubcategory> =
  mongoose.models.Subcategory ||
  mongoose.model<ISubcategory>("Subcategory", subcategorySchema);

export { Subcategory, SubcategorySchema };
