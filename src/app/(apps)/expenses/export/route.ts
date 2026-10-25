import { getSession } from "@/lib/session";
import { listAllExpenses } from "../_lib/data";
import { csvRow } from "../_lib/csv";
import { centsToInput } from "../_lib/money";

export async function GET() {
  const session = await getSession();
  if (!session) return new Response("Not signed in", { status: 401 });

  const rows = await listAllExpenses(session.user.id);
  const csv = [
    csvRow(["Date", "Merchant", "Category", "Amount", "Currency", "Notes"]),
    ...rows.map((e) => csvRow([e.spentOn, e.merchant, e.category, centsToInput(e.amountCents), e.currency, e.notes])),
  ].join("\r\n");

  return new Response(csv + "\r\n", {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="expenses-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
