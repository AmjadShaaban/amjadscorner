import mongoose, { Mongoose } from 'mongoose';
//@ts-expect-error it can be undefiend
const MONGODB_URI: string = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

//@ts-expect-error lacking global mongoose decleration
let cached = global.mongoose;

if (!cached) {
  //@ts-expect-error lacking global mongoose decleration
  cached = global.mongoose = { conn: null, promise: null };
}

export const dbConnect = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
};
