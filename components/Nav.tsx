"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

const TABS = [
  { href: "/", label: "Explore", icon: "explore" },
  { href: "/buy", label: "Buy", icon: "buy" },
  { href: "/sell", label: "Sell", icon: "sell" },
  { href: "/profile", label: "Profile", icon: "profile" },
];

export default function Nav() {
  const path = usePathname();
  const active = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(href + "/") || (href === "/buy" && path.startsWith("/auction"));

  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-bg/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight">
            <Icon name="gavel" className="text-brass" />
            Mazad <span className="text-sm font-medium text-muted" lang="ar">مزاد</span>
          </Link>
          <nav className="hidden gap-1 md:flex" aria-label="Main">
            {TABS.map((t) => (
              <Link key={t.href} href={t.href} aria-current={active(t.href) ? "page" : undefined}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${active(t.href) ? "bg-teal-soft text-teal" : "text-muted hover:text-fg"}`}>
                {t.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <nav aria-label="Main" className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {TABS.map((t) => (
            <li key={t.href}>
              <Link href={t.href} aria-current={active(t.href) ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${active(t.href) ? "text-teal" : "text-muted"}`}>
                <Icon name={t.icon} size={22} />
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
