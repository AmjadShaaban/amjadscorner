import "server-only";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Data Access Layer entry point for the current session. Reads request headers,
// so callers must render behind a <Suspense> boundary (cacheComponents is on).
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}
