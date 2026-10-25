"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { apps } from "./nav";

/** Highlights the current app. usePathname is dynamic on param routes, so render inside <Suspense>. */
export function NavLinks() {
  return <NavLinkList pathname={usePathname()} />;
}

/** Also the Suspense fallback: the same links with no active state. */
export function NavLinkList({ pathname }: { pathname?: string }) {
  return (
    <nav className="hidden items-center gap-1 sm:flex">
      {apps.map((app) => {
        const active = pathname?.startsWith(app.href) ?? false;
        return (
          <Link
            key={app.href}
            href={app.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
              active && "bg-muted text-foreground",
            )}
          >
            {app.label}
          </Link>
        );
      })}
    </nav>
  );
}
