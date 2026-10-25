import "server-only";
import { cookies, headers } from "next/headers";
import { auth } from "@/lib/auth";

// Data Access Layer entry point for the current session. Reads request headers,
// so callers must render behind a <Suspense> boundary (cacheComponents is on).
export async function getSession() {
  // Rebuild the Cookie header from cookies(), which also reflects cookies set earlier in
  // this request. Without this, the re-render that follows a Server Action that just
  // created a guest session would still see the visitor as signed out.
  const requestHeaders = new Headers(await headers());
  requestHeaders.set("cookie", (await cookies()).toString());
  return auth.api.getSession({ headers: requestHeaders });
}

/**
 * For Server Actions that save data: returns the current user, signing the visitor in
 * as a guest first if they have no session. The session cookie is set on the action's
 * response via Better Auth's nextCookies plugin.
 */
export async function getOrCreateUser() {
  const session = await getSession();
  if (session) return session.user;

  const result = await auth.api.signInAnonymous({ headers: await headers() });
  if (!result) throw new Error("Could not start a guest session");
  return result.user;
}
