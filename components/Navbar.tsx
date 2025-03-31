"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import { useAuthStore } from "../lib/state";
import { useEffect } from "react";
import { auth } from "../lib/auth";

const links = [
  { title: "Home", href: "/" },
  { title: "Todo", href: "/todo" },
  { title: "Shop", href: "/shop" },
  { title: "Forums", href: "/forums" },
];

type NavbarProps = {
  initialSession: any;
};

export default function Navbar({ initialSession }: NavbarProps) {
  const { setUser } = useAuthStore();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email,
      });
    } else {
      setUser(null);
    }
  }, [session, setUser]);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 p-4 shadow-md flex justify-between items-center"
    >
      <header className="bg-blue-600 text-white p-4 text-xl font-bold tracking-wide">
        Amjad&apos;s Corner{" "}
        <div>
          {session ? (
            <>
              <span>{session.user.email}</span>
              <button onClick={() => signOut()} className="ml-4 underline">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:underline">
              Login
            </Link>
          )}
        </div>
      </header>
      <ul className="flex space-x-6">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href}>
              <span className="hover:text-blue-400 transition-colors">
                {link.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.nav>
  );
}
