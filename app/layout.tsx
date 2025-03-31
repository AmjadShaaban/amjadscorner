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
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body className="min-h-screen bg-gray-100">
        <SessionWrapper initialSession={session}>
          <Navbar />
          <main>{children}</main>
        </SessionWrapper>
      </body>
    </html>
  );
}
