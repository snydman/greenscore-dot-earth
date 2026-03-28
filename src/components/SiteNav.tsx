"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINK_CLS =
  "hidden sm:inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/25 text-[color:var(--gs-text-muted)] hover:bg-black/5 px-3 py-1.5 text-xs";

const ACTIVE_LINK_CLS =
  "hidden sm:inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/25 text-emerald-800 bg-emerald-50 px-3 py-1.5 text-xs";

const CTA_CLS =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600/40 bg-[color:var(--gs-accent)] text-white shadow-sm hover:bg-[color:var(--gs-accent-deep)] px-3 py-1.5 text-xs";

const NAV_LINKS = [
  { href: "/learn", label: "Learn" },
  { href: "/methodology", label: "Methodology" },
] as const;

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="flex items-center justify-between"
    >
      <Link href="/" className="inline-flex items-center gap-2">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-[color:var(--gs-accent)] text-white shadow-sm">
          G
        </span>
        <span className="text-sm font-semibold tracking-tight">
          GreenScore
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive =
            pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={isActive ? ACTIVE_LINK_CLS : LINK_CLS}
            >
              {label}
            </Link>
          );
        })}
        <Link href="/quiz" className={CTA_CLS}>
          Take the quiz
        </Link>
      </div>
    </nav>
  );
}
