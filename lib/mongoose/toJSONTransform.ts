import { Schema } from "mongoose";

/**
 * Applies a default `toJSON` transform:
 * - Converts `_id` to `id`
 * - Deletes `_id`, `__v`, and optionally any custom fields (e.g., "password")
 * - Adds `name` field if model is User
 */
export function applyDefaultToJSONTransform(
  schema: Schema,
  options?: { remove?: string[]; isUserModel?: boolean }
) {
  schema.set("toJSON", {
    virtuals: true,
    transform: (_doc, ret) => {
      if (options.isUserModel && ret.firstName && ret.lastName) {
        ret.name = `${ret.firstName} ${ret.lastName}`.trim();
      }
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
