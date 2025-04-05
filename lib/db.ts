import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;
let connected = false;

export const connectToDatabase = async () => {
  if (connected) return;
  await mongoose.connect(MONGODB_URI);
  connected = true;
};
