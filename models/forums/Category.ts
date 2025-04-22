import { withAuditAndSoftDelete } from "@/lib/mongoose/baseSchema";
import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";
import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ICategory = {
  name: string;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId | null;
  deletedBy?: Types.ObjectId | null;
  deletedAt?: Date | null;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
} & Document;

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    ...withAuditAndSoftDelete,
  },
  { timestamps: true }
);

applyDefaultToJSONTransform(categorySchema);

const Category: Model<ICategory> =
  mongoose.models.Category ||
  mongoose.model<ICategory>("Category", categorySchema);

export { Category };
