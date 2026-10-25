import { getSession } from "@/lib/session";
import { readStoredFile } from "@/lib/storage";
import { getExpense } from "../../_lib/data";

// Receipts are private: only the owner can fetch one, and it's streamed through here.
export async function GET(_req: Request, ctx: RouteContext<"/expenses/receipts/[id]">) {
  const { id } = await ctx.params;
  const session = await getSession();
  if (!session || !/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });

  const row = await getExpense(session.user.id, id);
  const file = row?.receiptPath ? await readStoredFile(row.receiptPath) : null;
  if (!file) return new Response("Not found", { status: 404 });

  return new Response(file.body as BodyInit, {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
