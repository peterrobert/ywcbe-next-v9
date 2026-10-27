"use client";

// Visually hidden but keyboard-accessible navigation used across migrated TUC
// screens. Only working Next.js routes are listed here; the legacy Vite route
// list remains in src/components/TucSkipNav.tsx.
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "TUC Landing Page" },
  { href: "/black-hand", label: "Black Hand Overview" },
  { href: "/earth-globe", label: "Earth/Globe Overview" },
  { href: "/yellow-sticky-note", label: "Yellow Sticky Note Overview" },
  { href: "/red-flag", label: "Red Flag Overview" },
  { href: "/crumpled-paper", label: "Crumpled Paper Overview" },
  { href: "/closerlook", label: "CloserLook@ Workspace" },
  { href: "/top10-poc", label: "Top 10 Ways to Engage" },
  { href: "/open-items", label: "OpenItems" },
];

const TucSkipNav = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="TUC sections"
      className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:z-50 focus-within:w-full focus-within:bg-background focus-within:border-b-2 focus-within:border-foreground focus-within:p-3"
    >
      <ul className="flex flex-wrap gap-3">
        <li>
          <a
            href="#main-content"
            className="text-sm underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm px-1"
          >
            Skip to main content
          </a>
        </li>
        {links.map((l) => {
          const isActive = pathname === l.href;

          return (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={isActive ? "page" : undefined}
                className={`text-sm underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm px-1 ${
                  isActive ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                {l.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default TucSkipNav;
