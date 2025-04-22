import { withAuditAndSoftDelete } from "@/lib/mongoose/baseSchema";
import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";
import mongoose, { Document, Model, Schema, Types } from "mongoose";

type ISubcategory = {
  name: string;
  category: Types.ObjectId;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  deletedBy?: Types.ObjectId | null;
  deletedAt?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
} & Document;

const subcategorySchema = new Schema<ISubcategory>(
  {
    name: { type: String, required: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    ...withAuditAndSoftDelete,
  },
  { timestamps: true }
);

applyDefaultToJSONTransform(subcategorySchema);

const Subcategory: Model<ISubcategory> =
  mongoose.models.Subcategory ||
  mongoose.model<ISubcategory>("Subcategory", subcategorySchema);

export { Subcategory };
