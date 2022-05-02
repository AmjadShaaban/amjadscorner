import mongoose, { Document, Model, model } from 'mongoose';
import { Roles } from '../../interfaces/interfaces';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Roles;
}

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: Object.values(Roles), default: Roles.USER },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || model('User', UserSchema);
