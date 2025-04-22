import { SchemaTypeOptions, Types } from "mongoose";

export const withAuditAndSoftDelete: Record<string, SchemaTypeOptions<any>> = {
  createdBy: { type: Types.ObjectId, ref: "User", required: true },
  updatedBy: { type: Types.ObjectId, ref: "User", default: null },
  deletedBy: { type: Types.ObjectId, ref: "User", default: null },
  deletedAt: { type: Date, default: null },
  isDeleted: { type: Boolean, default: false },
};
