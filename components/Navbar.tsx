"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  Home,
  ClipboardList,
  ShoppingBag,
  Users,
  Shield,
} from "lucide-react";
import { UserRole } from "@/types/roles";
import { useAuthStore } from "../lib/state";
import NavLink from "./NavLink";
import Image from "next/image";

export default function Navbar() {
  const { setUser } = useAuthStore();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setUser({ id: session.user.id, email: session.user.email ?? "" });
    } else if (session === null) {
      setUser(null);
    }
  }, [session, setUser]);

  const role = session?.user?.role ?? UserRole.GUEST;

  const links = [
    { name: "Home", href: "/", showFor: UserRole.GUEST, Icon: Home },
    {
      name: "Todo",
      href: "/todo",
      showFor: UserRole.USER,
      Icon: ClipboardList,
    },
    { name: "Shop", href: "/shop", showFor: UserRole.GUEST, Icon: ShoppingBag },
    { name: "Forums", href: "/forums", showFor: UserRole.GUEST, Icon: Users },
    { name: "Admin", href: "/admin", showFor: UserRole.ADMIN, Icon: Shield },
  ] as const;

  const visibleLinks = links.filter((link) => {
    if (link.showFor === UserRole.GUEST) return true;
    if (
      link.showFor === UserRole.USER &&
      (role === UserRole.USER || role === UserRole.ADMIN)
    )
      return true;
    if (link.showFor === UserRole.ADMIN && role === UserRole.ADMIN) return true;
    return false;
  });

  return (
    <header className="bg-gray-900 text-white p-4 rounded-t-xl">
      <nav className="max-w-4xl mx-auto flex justify-between items-center">
        {/* Left: Logo + Name */}
        <div className="flex items-center space-x-3">
          <Image src="/logo.png" alt="Logo" className="w-8 h-8" />
          <span className="text-gray-300 font-semibold">
            Amjad&apos;s Corner
          </span>
        </div>

        {/* Right: Desktop Links */}
        <div className="hidden md:flex items-center space-x-4">
          {visibleLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}

          {session?.user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="underline hover:text-gray-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <NavLink href="/login" name="Login" />
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen((prev) => !prev)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      {menuOpen && (
        <div className="md:hidden mt-2 flex flex-col items-start space-y-2 px-4">
          {visibleLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          {session?.user ? (
            <>
              <span className="text-sm text-gray-400">{session.user.name}</span>
              <button
                onClick={() => signOut()}
                className="underline hover:text-gray-200"
              >
                Logout
              </button>
            </>
          ) : (
            <NavLink href="/login" name="Login" />
          )}
        </div>
      )}
    </header>
  );
}
