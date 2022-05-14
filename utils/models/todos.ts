import mongoose, { Document, Model, model } from 'mongoose';

export interface ITodo extends Document {
  label: string;
  list: mongoose.ObjectId;
  done: boolean;
  deleted: boolean;
}

const TodoSchema = new mongoose.Schema({
  label: { type: String },
  listId: { type: mongoose.Schema.Types.ObjectId, ref: 'TodoList' },
  done: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false },
});

export const Todo: Model<ITodo> =
  mongoose.models.Todo || model('Todo', TodoSchema);
