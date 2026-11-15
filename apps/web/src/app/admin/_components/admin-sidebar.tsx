"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/settings", label: "Settings" },
];

// Overview is active only on /admin. Each other link is active on its page
// and on the pages below it.
function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    // On mobile the links are a row above the page content. From md up, the
    // sidebar is a column on the left.
    <nav
      aria-label="Admin"
      className="flex flex-row items-center gap-4 border-b pb-4 md:w-40 md:shrink-0 md:flex-col md:items-start md:gap-3 md:border-r md:border-b-0 md:pr-6 md:pb-0"
    >
      <p className="text-xs font-semibold tracking-wider text-muted-foreground">
        ADMIN
      </p>
      <ul className="flex flex-row gap-4 text-sm md:flex-col md:gap-2">
        {links.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "transition-colors hover:text-foreground",
                  active
                    ? "font-medium text-foreground"
                    : "text-muted-foreground",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
