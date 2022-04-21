import mongoose, { Document, Model, model } from 'mongoose';

export interface IMessage extends Document {
  name: string;
  email: string;
  message: string;
}

const MessageSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  message: { type: String },
});

export const Message: Model<IMessage> =
  mongoose.models.Message || model('Message', MessageSchema);
