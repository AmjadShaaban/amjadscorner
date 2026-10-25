import Link from "next/link";
import { apps } from "@/components/shell/nav";

// Placeholder until the Portfolio homepage is built (see docs/spec.md).
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-8 p-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-semibold tracking-tight">Amjad&apos;s Corner</h1>
        <p className="text-muted-foreground">v2 is under construction. Here&apos;s what&apos;s coming:</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {apps.map((app) => (
          <li key={app.href}>
            <Link href={app.href} className="block h-full rounded-xl border p-5 transition-colors hover:bg-muted">
              <h2 className="font-medium">{app.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{app.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
