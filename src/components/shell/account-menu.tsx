import { enabledSocialProviders } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { AccountMenuClient } from "./account-menu-client";

// Reads the session, so it must render inside <Suspense>.
export async function AccountMenu() {
  const session = await getSession();
  const user = session
    ? { name: session.user.name, email: session.user.email, isAnonymous: !!session.user.isAnonymous }
    : null;

  return <AccountMenuClient user={user} providers={enabledSocialProviders} />;
}
