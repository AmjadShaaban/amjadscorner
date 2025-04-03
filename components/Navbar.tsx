"use client";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../lib/state";
import Image from "next/image";
// TODO role-based system
// Hardcoded admin email (replace with your email or a role-based system)
const ADMIN_EMAIL = "test@test.com";

export default function Navbar() {
  const { setUser } = useAuthStore();
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    console.log("Session in useEffect:", session);
    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email || "",
      });
    } else if (session === null) {
      setUser(null);
    }
  }, [session, setUser]);

  const links = [
    { name: "Home", href: "/" },
    { name: "Todo", href: "/todo" },
    { name: "Shop", href: "/shop" },
    { name: "Forums", href: "/forums" },
  ];

  if (session?.user?.email === ADMIN_EMAIL) {
    links.push({ name: "Admin", href: "/admin" });
  }

  const activeLink = links.find((link) => link.href === pathname) || links[0];
  const inactiveLinks = links.filter((link) => link.href !== activeLink.href);
  const orderedInactiveLinks = inactiveLinks.sort((a, b) => {
    const order = {
      Home:
        activeLink.name === "Home"
          ? ["Todo", "Shop", "Forums", "Admin"]
          : ["Home", "Shop", "Forums", "Admin"],
      Todo: ["Home", "Shop", "Forums", "Admin"],
      Shop: ["Home", "Todo", "Forums", "Admin"],
      Forums: ["Home", "Todo", "Shop", "Admin"],
      Admin: ["Home", "Todo", "Shop", "Forums"],
    };
    return (
      order[activeLink.name].indexOf(a.name) -
      order[activeLink.name].indexOf(b.name)
    );
  });

  return (
    <header className="bg-gray-900 text-white p-4">
      <nav className="flex justify-between items-center max-w-4xl mx-auto">
        {/* Logo and Active Link (Left) */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="Amjad's Corner Logo"
            width={32}
            height={32}
          />
          <span className="underline text-gray-300 cursor-default">
            {activeLink.name}
          </span>
        </div>

        {/* Inactive Links (Right) */}
        <div className="flex space-x-4 items-center">
          {orderedInactiveLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative group hover:text-gray-200 transition-colors duration-300"
            >
              {link.name}
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <div>
            {session?.user ? (
              <>
                <span>{session.user.email}</span>
                <button onClick={() => signOut()} className="ml-4 underline">
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="relative group hover:text-gray-200 transition-colors duration-300"
              >
                Login
                <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
