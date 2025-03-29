"use client";
import { ReactNode } from "react";
import "./globals.css"; // Global CSS styles
import { useStore } from "../lib/state"; // Zustand for shared state

export default function RootLayout({ children }: { children: ReactNode }) {
  const { user } = useStore(); // Example: accessing shared state

  return (
    <html lang="en">
      <body>
        <header>
          <nav>
            <a href="/landing">Home</a> | <a href="/todo">Todo</a> |{" "}
            <a href="/ecommerce">Shop</a> | <a href="/forums">Forums</a>
            {user && <span>Logged in as {user}</span>}
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
