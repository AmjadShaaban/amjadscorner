"use client";
import { useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../lib/state";

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

  // Define all links with their routes
  const links = [
    { name: "Home", href: "/" },
    { name: "Todo", href: "/todo" },
    { name: "Shop", href: "/shop" },
    { name: "Forums", href: "/forums" },
  ];

  // Determine the active link based on the current pathname
  const activeLink = links.find((link) => link.href === pathname) || links[0]; // Default to Home if no match

  // Filter out the active link and order the remaining links as specified
  const inactiveLinks = links.filter((link) => link.href !== activeLink.href);
  const orderedInactiveLinks = inactiveLinks.sort((a, b) => {
    const order = {
      Home:
        activeLink.name === "Home"
          ? ["Todo", "Shop", "Forums"]
          : ["Home", "Shop", "Forums"],
      Todo: ["Home", "Shop", "Forums"],
      Shop: ["Home", "Todo", "Forums"],
      Forums: ["Home", "Todo", "Shop"],
    };
    return (
      order[activeLink.name].indexOf(a.name) -
      order[activeLink.name].indexOf(b.name)
    );
  });

  return (
    <header className="bg-gray-900 text-white p-4">
      <nav className="flex justify-between max-w-4xl mx-auto">
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
        <div className="flex space-x-4">
          {orderedInactiveLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="relative group hover:text-gray-200 transition-colors duration-300"
            >
              {link.name}
              {/* Animated underline on hover */}
              <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          {/* Auth Section */}
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
