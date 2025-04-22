import { withAuditAndSoftDelete } from "@/lib/mongoose/baseSchema";
import { applyDefaultToJSONTransform } from "@/lib/mongoose/toJSONTransform";
import { UserRole } from "@/types/roles";
import mongoose, { Document, Model, Schema } from "mongoose";

type IUser = {
  email: string;
  password: string;
  handle: string;
  _handle: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  verifiedEmail: boolean;
  isDeleted: boolean;
  banned: boolean;
  reasonBanned?: string;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
} & Document;

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    handle: {
      type: String,
      required: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9_]+$/,
        "Handle can only contain letters, numbers, and underscores.",
      ],
    },
    _handle: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      select: false,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    firstName: { type: String },
    lastName: { type: String },
    verifiedEmail: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    reasonBanned: { type: String, default: null },
    ...withAuditAndSoftDelete,
  },
  { timestamps: true }
);

userSchema.pre("save", function (next) {
  if (this.isModified("handle")) {
    this._handle = this.handle.toLowerCase();
  }
  next();
});

applyDefaultToJSONTransform(userSchema, {
  isUserModel: true,
  remove: ["password", "_handle", "reasonBanned", "banned", "isDeleted"],
});

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export { User };
