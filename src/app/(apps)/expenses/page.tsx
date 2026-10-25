import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, PaperclipIcon, PlusIcon, TrendingDownIcon, TrendingUpIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getSession } from "@/lib/session";
import { CategoryBars, MonthlyColumns } from "./_components/charts";
import { SampleDataButton } from "./_components/expense-buttons";
import { categoryTotals, countExpenses, listExpensesForMonth, monthlyTotals } from "./_lib/data";
import { formatMoney } from "./_lib/money";
import { addMonths, formatMonth } from "./_lib/months";
import { monthSchema } from "./_lib/schemas";

export const metadata: Metadata = { title: "Expenses" };

export default function ExpensesPage(props: PageProps<"/expenses">) {
  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 p-4 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track spending. Scan receipts right in your browser.</p>
        </div>
        <Link href="/expenses/new" className={buttonVariants()}>
          <PlusIcon /> Add expense
        </Link>
      </div>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-muted" />}>
        <Dashboard {...props} />
      </Suspense>
    </main>
  );
}

async function Dashboard({ searchParams }: PageProps<"/expenses">) {
  const session = await getSession();
  const total = session ? await countExpenses(session.user.id) : 0;
  if (!session || total === 0) return <EmptyState />;

  await connection();
  const thisMonth = new Date().toISOString().slice(0, 7);
  const requested = monthSchema.safeParse((await searchParams).month);
  const month = requested.success ? requested.data : thisMonth;
  const userId = session.user.id;

  const [monthly, categories, expenses] = await Promise.all([
    monthlyTotals(userId, month, 6),
    categoryTotals(userId, month),
    listExpensesForMonth(userId, month),
  ]);
  const current = monthly.at(-1)!.cents;
  const previous = monthly.at(-2)!.cents;
  const top = categories[0];
  const days = month === thisMonth ? new Date().getUTCDate() : new Date(Date.UTC(+month.slice(0, 4), +month.slice(5), 0)).getUTCDate();

  return (
    <>
      {/* One filter row scopes everything below it. */}
      <nav aria-label="Month" className="flex items-center gap-1">
        <Link
          href={`/expenses?month=${addMonths(month, -1)}`}
          aria-label="Previous month"
          className={buttonVariants({ variant: "outline", size: "icon-sm" })}
        >
          <ChevronLeftIcon />
        </Link>
        <span className="min-w-36 text-center font-medium">{formatMonth(month)}</span>
        {month < thisMonth ? (
          <Link
            href={`/expenses?month=${addMonths(month, 1)}`}
            aria-label="Next month"
            className={buttonVariants({ variant: "outline", size: "icon-sm" })}
          >
            <ChevronRightIcon />
          </Link>
        ) : (
          <span className={cn(buttonVariants({ variant: "outline", size: "icon-sm" }), "pointer-events-none opacity-40")} aria-hidden>
            <ChevronRightIcon />
          </span>
        )}
        <a href="/expenses/export" download className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "ml-auto")}>
          <DownloadIcon /> Export CSV
        </a>
      </nav>

      <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1fr]">
        <Card>
          <CardHeader>
            <CardDescription>Spent in {formatMonth(month)}</CardDescription>
            <CardTitle className="text-5xl font-semibold tracking-tight">{formatMoney(current)}</CardTitle>
            <Delta current={current} previous={previous} previousMonth={addMonths(month, -1)} />
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Top category</CardDescription>
            <CardTitle className="text-2xl">{top?.category ?? "None"}</CardTitle>
            {top && <p className="text-sm text-muted-foreground">{formatMoney(top.cents)}</p>}
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Daily average</CardDescription>
            <CardTitle className="text-2xl">{formatMoney(Math.round(current / days))}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {expenses.length} {expenses.length === 1 ? "expense" : "expenses"}
            </p>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly spending</CardTitle>
            <CardDescription>Last six months. Select a month to view it.</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyColumns data={monthly} selected={month} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>By category</CardTitle>
            <CardDescription>{formatMonth(month)}</CardDescription>
          </CardHeader>
          <CardContent>
            {categories.length ? (
              <CategoryBars data={categories} />
            ) : (
              <p className="text-sm text-muted-foreground">No expenses this month.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing recorded in {formatMonth(month)}.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 pr-4 font-normal">Date</th>
                    <th className="py-2 pr-4 font-normal">Merchant</th>
                    <th className="hidden py-2 pr-4 font-normal sm:table-cell">Category</th>
                    <th className="py-2 text-right font-normal">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => (
                    <tr key={e.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground tabular-nums">
                        {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" }).format(
                          new Date(`${e.spentOn}T00:00:00Z`),
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        <Link href={`/expenses/${e.id}`} className="font-medium hover:underline">
                          {e.merchant}
                        </Link>
                        {e.receiptPath && <PaperclipIcon className="ml-1.5 inline size-3.5 text-muted-foreground" aria-label="Has receipt" />}
                      </td>
                      <td className="hidden py-2 pr-4 sm:table-cell">
                        <Badge variant="secondary">{e.category}</Badge>
                      </td>
                      <td className="py-2 text-right tabular-nums">{formatMoney(e.amountCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function Delta({ current, previous, previousMonth }: { current: number; previous: number; previousMonth: string }) {
  if (previous === 0) return null;
  const change = (current - previous) / previous;
  const up = change > 0;
  const Icon = up ? TrendingUpIcon : TrendingDownIcon;
  // Spending more is bad; the icon and words carry direction, not just the color.
  return (
    <p
      className="flex items-center gap-1 text-sm font-medium"
      style={{ color: up ? "var(--viz-delta-bad)" : "var(--viz-delta-good)" }}
    >
      <Icon className="size-4" />
      {up ? "+" : "−"}
      {Math.abs(Math.round(change * 100))}% vs {formatMonth(previousMonth, "short")}
    </p>
  );
}

function EmptyState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Start tracking</CardTitle>
        <CardDescription>
          Add an expense or scan a receipt. No sign-up needed: you&apos;ll be a guest until you sign in. Just looking?
          Load six months of sample data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Link href="/expenses/new" className={buttonVariants()}>
          <PlusIcon /> Add expense
        </Link>
        <SampleDataButton />
      </CardContent>
    </Card>
  );
}
