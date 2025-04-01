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
      <body className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
        <SessionWrapper initialSession={session}>
          <div className="max-w-5xl mx-auto my-6 p-6 bg-gray-800 rounded-xl shadow-lg">
            <Navbar />
            <main>{children}</main>
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}
