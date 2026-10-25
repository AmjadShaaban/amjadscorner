import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "./account-menu";
import { NavLinkList, NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          Amjad&apos;s Corner
        </Link>
        <Suspense fallback={<NavLinkList />}>
          <NavLinks />
        </Suspense>
        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <Suspense fallback={<div className="size-8" />}>
            <AccountMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
