"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const title = "Workbot";
const className = "text-lg font-semibold tracking-tight";

export function SiteTitle() {
  // On the home page, the title is not a link, because it points to the same page.
  if (usePathname() === "/") {
    return <span className={className}>{title}</span>;
  }

  return (
    <Link href="/" className={className}>
      {title}
    </Link>
  );
}
