import { Schema } from "mongoose";

/**
 * Applies a default `toJSON` transform:
 * - Converts `_id` to `id`
 * - Deletes `_id`, `__v`, and optionally any custom fields (e.g., "password")
 */
export function applyDefaultToJSONTransform(
  schema: Schema,
  options?: { remove?: string[] }
) {
  schema.set("toJSON", {
    transform: (_doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;

      if (options?.remove?.length) {
        for (const field of options.remove) {
          delete ret[field];
        }
      }

      return ret;
    },
  });
}
