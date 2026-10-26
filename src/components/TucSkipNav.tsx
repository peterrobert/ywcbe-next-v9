// Visually hidden but keyboard-accessible quick navigation used across all TUC screens
// so every route is reachable without relying on mouse hover.
import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "TUC Landing Page" },
  { to: "/black-hand", label: "Black Hand Overview" },
  { to: "/earth-globe", label: "Earth/Globe Overview" },
  { to: "/yellow-sticky-note", label: "Yellow Sticky Note Overview" },
  { to: "/red-flag", label: "Red Flag Overview" },
  { to: "/crumpled-paper", label: "Crumpled Paper Overview" },
  { to: "/closerlook", label: "CloserLook@ Workspace" },
];

const TucSkipNav = () => {
  return (
    <nav
      aria-label="TUC sections"
      className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:z-50 focus-within:w-full focus-within:bg-background focus-within:border-b-2 focus-within:border-foreground focus-within:p-3"
    >
      <ul className="flex flex-wrap gap-3">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) =>
                `text-sm underline focus:outline-none focus:ring-2 focus:ring-ring rounded-sm px-1 ${
                  isActive ? "font-bold text-foreground" : "text-muted-foreground"
                }`
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default TucSkipNav;