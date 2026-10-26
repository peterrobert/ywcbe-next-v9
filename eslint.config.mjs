import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Generated shadcn primitives: keep the project lint rules intact, but do not
  // refactor these files as part of the route migration. Revisit when the
  // primitives are regenerated.
  {
    files: [
      "src/components/ui/carousel.tsx",
      "src/hooks/use-mobile.tsx",
    ],
    rules: {
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    files: ["src/components/ui/sidebar.tsx"],
    rules: {
      "react-hooks/purity": "off",
    },
  },
  {
    files: ["src/components/ui/textarea.tsx"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },

  // The legacy Vite application is intentionally outside the Next lint scope
  // until it is migrated. Build output and generated files are ignored too.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
    "src/legacy-pages/**",
    "src/App.tsx",
    "src/main.tsx",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "src/components/Index/**",
    "src/components/WelcomeWorkspace.tsx",
    "src/components/CloserLookWorkspace/**",
    "src/components/ConceptOverlay.tsx",
    "src/components/TucSkipNav.tsx",
  ]),
]);
