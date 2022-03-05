import mongoose, { Document, Model, model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  text: string;
  text2: string;
  img: string;
}

const ProjectSchema = new mongoose.Schema({
  title: { type: String },
  text: { type: String },
  text2: { type: String },
  img: { type: String },
});

export const Project: Model<IProject> =
  mongoose.models.Project || model('Project', ProjectSchema);
