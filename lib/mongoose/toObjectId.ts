import mongoose from "mongoose";

/**
 * Converts a valid string ID into a Mongoose ObjectId.
 * Throws if the ID is invalid.
 */
export function toObjectId(id: string): mongoose.Types.ObjectId {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Invalid ObjectId: ${id}`);
  }
  return new mongoose.Types.ObjectId(id);
}

/**
 * Converts a string to ObjectId safely.
 * Returns null if the ID is invalid.
 */
export function toObjectIdSafe(
  id: string | undefined | null
): mongoose.Types.ObjectId | null {
  return mongoose.Types.ObjectId.isValid(id)
    ? new mongoose.Types.ObjectId(id)
    : null;
}
