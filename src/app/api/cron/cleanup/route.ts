import { timingSafeEqual } from "node:crypto";
import { runCleanup } from "@/lib/cleanup";
import { env } from "@/lib/env";

// Called daily by Vercel Cron (see vercel.json), which sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: Request) {
  if (!env.CRON_SECRET) return Response.json({ error: "CRON_SECRET is not configured" }, { status: 503 });

  const expected = Buffer.from(`Bearer ${env.CRON_SECRET}`);
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await runCleanup();
  console.info("[cleanup]", JSON.stringify(report));
  return Response.json(report);
}
