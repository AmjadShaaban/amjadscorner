"use client";
import { ReactNode } from "react";
import "./globals.css"; // Global CSS styles
import { useStore } from "../lib/state"; // Zustand for shared state
import Link from "next/link";

export default function RootLayout({ children }: { children: ReactNode }) {
  const { user } = useStore(); // Example: accessing shared state

  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <Link href={"/"}>Home</Link> | <Link href="/todo">Todo</Link> |{" "}
            <Link href="/shop">Shop</Link> | <Link href="/forums">Forums</Link>
            {user && <span>Logged in as {user}</span>}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
