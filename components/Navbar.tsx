"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
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
import { useAuthStore } from "@/lib/state";
import NavLink from "./NavLink";
import Image from "next/image";

const Navbar = () => {
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const role = user?.role ?? UserRole.GUEST;

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

  const userDisplayName = user?.firstName || user?.email;

  return (
    <header className="bg-gray-900 text-white p-4 rounded-t-xl">
      <nav className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.png"
            alt="Logo"
            className="w-8 h-8"
            width={0}
            height={0}
          />
          <span className="text-gray-300 font-semibold">
            Amjad&apos;s Corner
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {visibleLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}

          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">{userDisplayName}</span>
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

        <div className="md:hidden">
          <button onClick={() => setMenuOpen((prev) => !prev)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden mt-2 flex flex-col items-start space-y-2 px-4">
          {visibleLinks.map((link) => (
            <NavLink key={link.href} {...link} />
          ))}
          {user ? (
            <>
              <span className="text-sm text-gray-400">{userDisplayName}</span>
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
};
export default Navbar;
