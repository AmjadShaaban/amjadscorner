import mongoose, { Schema, Document,Model } from 'mongoose';
import { z } from 'zod';

const TodoSchema = z.object({
    userId: z.string().min(1,{message:'User ID is required'}),
    title: z.string().min(1,{message:'Title must be atleast 1 character'}),
    completed: z.boolean().default(false)
})

type ITodo = z.infer<typeof TodoSchema> & Document

const todoSchema: Schema<ITodo> = new Schema({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const Todo:Model<ITodo> = mongoose.models.Todo || mongoose.model<ITodo>('Todo', todoSchema);

export {Todo, TodoSchema}