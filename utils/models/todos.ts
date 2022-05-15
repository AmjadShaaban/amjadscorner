import mongoose, { Document, Model, model } from 'mongoose';

export interface ITodo extends Document {
  label: string;
  listId: mongoose.ObjectId;
  done: boolean;
}

const TodoSchema = new mongoose.Schema({
  label: { type: String },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'TodoList' },
  done: { type: Boolean, default: false },
});

export const Todo: Model<ITodo> =
  mongoose.models.Todo || model('Todo', TodoSchema);
