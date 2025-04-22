import mongoose, { Schema, Document, Model } from "mongoose";

type ITodo = {
  userId: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
};

const todoSchema: Schema<ITodo> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Todo: Model<ITodo> =
  mongoose.models.Todo || mongoose.model<ITodo>("Todo", todoSchema);

export { Todo };
