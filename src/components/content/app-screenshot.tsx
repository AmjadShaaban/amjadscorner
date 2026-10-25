import Image, { type StaticImageData } from "next/image";
import type { AppSlug } from "@/components/shell/nav";
import boardDark from "@/content/screens/board-dark.png";
import boardLight from "@/content/screens/board-light.png";
import expensesDark from "@/content/screens/expenses-dark.png";
import expensesLight from "@/content/screens/expenses-light.png";
import scheduleDark from "@/content/screens/schedule-dark.png";
import scheduleLight from "@/content/screens/schedule-light.png";
import { cn } from "@/lib/utils";

// Static imports give each capture a content-hashed URL, so re-running
// `npm run screenshots` never serves a stale cached image.
const screens: Record<AppSlug, { light: StaticImageData; dark: StaticImageData }> = {
  schedule: { light: scheduleLight, dark: scheduleDark },
  board: { light: boardLight, dark: boardDark },
  expenses: { light: expensesLight, dark: expensesDark },
};

/** Light and dark captures from scripts/screenshots.mjs; CSS shows the one matching the theme. */
export function AppScreenshot({
  slug,
  alt,
  className,
  priority,
}: {
  slug: AppSlug;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const { light, dark } = screens[slug];
  const sizes = "(min-width: 1024px) 640px, 100vw";
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-background shadow-sm", className)}>
      <Image src={light} alt={alt} sizes={sizes} priority={priority} placeholder="blur" className="h-auto w-full dark:hidden" />
      <Image src={dark} alt={alt} sizes={sizes} priority={priority} placeholder="blur" className="hidden h-auto w-full dark:block" />
    </div>
  );
}
