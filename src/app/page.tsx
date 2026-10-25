import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { GuestButton } from "./_components/guest-button";

// Placeholder until the Portfolio Agent lands; doubles as an auth smoke test.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-4 p-8">
      <h1 className="text-3xl font-semibold">Amjad&apos;s Corner</h1>
      <p className="text-foreground/70">v2 is under construction.</p>
      <Suspense fallback={<p className="font-mono text-sm text-foreground/50">Checking session…</p>}>
        <SessionStatus />
      </Suspense>
    </main>
  );
}

async function SessionStatus() {
  const session = await getSession();
  if (!session) return <GuestButton />;

  const { user } = session;
  return (
    <p className="font-mono text-sm">
      Signed in as {user.name} ({user.isAnonymous ? "guest" : user.email})
    </p>
  );
}
