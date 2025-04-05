import mongoose, { Schema, Document, Model } from "mongoose";
import { z } from "zod";
import { UserRole } from "@/types/roles";
import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";

const UserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole).default(UserRole.USER),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

type IUser = {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
} & Document;

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    firstName: { type: String },
    lastName: { type: String },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

applyDefaultToJSONTransform(userSchema, { remove: ["password"] });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export { User, UserSchema };
