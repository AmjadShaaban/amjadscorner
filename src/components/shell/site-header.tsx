import Link from "next/link";
import { Suspense } from "react";
import { AccountMenu } from "./account-menu";
import { CommandPalette } from "./command-palette";
import { NavLinkList, NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      {/* On phones the app links drop to a second row instead of disappearing. */}
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 px-4 py-2 sm:h-14 sm:flex-nowrap sm:py-0">
        <Link href="/" className="font-semibold tracking-tight">
          Amjad&apos;s Corner
        </Link>
        <Suspense fallback={<NavLinkList />}>
          <NavLinks />
        </Suspense>
        <div className="ml-auto flex items-center gap-1 sm:order-last">
          <CommandPalette />
          <ThemeToggle />
          <Suspense fallback={<div className="size-8" />}>
            <AccountMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
