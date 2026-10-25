import type { Metadata } from "next";
import { ComingSoon } from "@/components/shell/coming-soon";

export const metadata: Metadata = { title: "Board" };

export default function Page() {
  return <ComingSoon href="/board" />;
}
