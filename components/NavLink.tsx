"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

type NavLinkProps = {
  href: string;
  name: string;
  Icon?: LucideIcon;
};

const NavLink = ({ href, name, Icon }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Tooltip content={name}>
      <Link
        href={href}
        className={`flex items-center space-x-1 relative group transition-colors duration-300 ${
          isActive ? "text-white underline" : "hover:text-gray-300"
        }`}
      >
        {Icon && <Icon size={16} />}
        <span className="hidden sm:inline">{name}</span>
      </Link>
    </Tooltip>
  );
};

export default NavLink;
