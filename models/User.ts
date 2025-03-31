import mongoose, { Document, Model, Schema } from 'mongoose';
import {z} from 'zod';

const UserSchema = z.object({
  email: z.string().email({message: 'Invalid email address'}),
  password: z.string().min(8, {message: 'Password must be at least 8 characters long'}),
});

type IUser = z.infer<typeof UserSchema> & Document;

const userSchema:Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User:Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);


export {User, UserSchema};