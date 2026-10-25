import { apps } from "./nav";

export function ComingSoon({ href }: { href: (typeof apps)[number]["href"] }) {
  const app = apps.find((a) => a.href === href)!;
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-2 p-8">
      <h1 className="text-3xl font-semibold">{app.label}</h1>
      <p className="text-muted-foreground">{app.blurb}</p>
      <p className="text-sm text-muted-foreground">Coming soon.</p>
    </main>
  );
}
