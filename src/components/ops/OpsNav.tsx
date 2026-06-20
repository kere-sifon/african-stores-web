"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/ops", label: "Status" },
  { href: "/ops/evals", label: "Eval scores" },
  { href: "/ops/costs", label: "Cost" },
] as const;

export function OpsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b border-border pb-3">
      {TABS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
