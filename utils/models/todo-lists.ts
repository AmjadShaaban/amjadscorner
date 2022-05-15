import mongoose, { Document, Model, model } from 'mongoose';
import { ITodo } from './todos';

export interface ITodoList extends Document {
  label: string;
  owner: mongoose.ObjectId;
  todos: ITodo[];
}

const TodoListSchema = new mongoose.Schema({
  label: { type: String },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

TodoListSchema.virtual('todos', {
  ref: 'Todo',
  localField: '_id',
  foreignField: 'listId',
});

TodoListSchema.set('toObject', { virtuals: true });
TodoListSchema.set('toJSON', { virtuals: true });

export const TodoList: Model<ITodoList> =
  mongoose.models.TodoList || model('TodoList', TodoListSchema);
