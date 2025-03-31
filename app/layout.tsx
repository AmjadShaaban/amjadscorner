import { ReactNode } from "react";
import "./globals.css";
import { auth } from "../lib/auth";
import Navbar from "../components/Navbar";
import SessionWrapper from "../components/SessionWrapper";

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <SessionWrapper initialSession={session}>
          <Navbar initialSession={session} />{" "}
          {/* Pass session to client-side Navbar */}
          <main className="p-4">{children}</main>
        </SessionWrapper>
      </body>
    </html>
  );
}
