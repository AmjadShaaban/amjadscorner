"use client";
import { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

type Props = {
  children: ReactNode;
  initialSession: any;
};

export default function SessionWrapper({ children, initialSession }: Props) {
  return <SessionProvider session={initialSession}>{children}</SessionProvider>;
}
