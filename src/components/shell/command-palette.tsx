"use client";

import {
  CalendarClockIcon,
  CopyIcon,
  HomeIcon,
  LayoutGridIcon,
  MoonIcon,
  ReceiptIcon,
  SearchIcon,
  SquareKanbanIcon,
  WrenchIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { profile } from "@/content/profile";
import { apps, howItsBuiltHref } from "./nav";

const icons = { schedule: CalendarClockIcon, board: SquareKanbanIcon, expenses: ReceiptIcon };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    if (href.startsWith("http")) window.open(href, "_blank", "noopener,noreferrer");
    else router.push(href);
  };

  return (
    <>
      <Button variant="ghost" size="icon" aria-label="Search and commands (⌘K)" onClick={() => setOpen(true)}>
        <SearchIcon />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen} title="Go to…" description="Jump to an app, a write-up or an action">
        <Command>
          <CommandInput placeholder="Where to?" />
          <CommandList>
            <CommandEmpty>Nothing matches.</CommandEmpty>
            <CommandGroup heading="Apps">
              <CommandItem onSelect={() => go("/")}>
                <HomeIcon /> Home
              </CommandItem>
              {apps.map((app) => {
                const Icon = icons[app.slug];
                return (
                  <CommandItem key={app.slug} value={`${app.label} app`} onSelect={() => go(app.href)}>
                    <Icon /> {app.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandGroup heading="How it's built">
              {apps.map((app) => (
                <CommandItem key={app.slug} value={`How ${app.label} is built`} onSelect={() => go(howItsBuiltHref(app.slug))}>
                  <WrenchIcon /> {app.label}: how it&apos;s built
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => go(`/meet/${profile.bookingHandle}`)}>
                <CalendarClockIcon /> Book a call with {profile.name.split(" ")[0]}
              </CommandItem>
              <CommandItem onSelect={() => go(profile.links.github)}>
                <LayoutGridIcon /> Source code on GitHub
              </CommandItem>
              {profile.links.email && (
                <CommandItem
                  onSelect={async () => {
                    await navigator.clipboard.writeText(profile.links.email);
                    setOpen(false);
                    toast.success("Email copied");
                  }}
                >
                  <CopyIcon /> Copy email address
                </CommandItem>
              )}
              <CommandItem
                onSelect={() => {
                  setTheme(resolvedTheme === "dark" ? "light" : "dark");
                  setOpen(false);
                }}
              >
                <MoonIcon /> Toggle dark mode
                <CommandShortcut>theme</CommandShortcut>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
