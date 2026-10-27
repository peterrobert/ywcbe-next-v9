import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  // Generated shadcn primitive kept as-is.
  {
    files: ["src/components/ui/textarea.tsx"],
    rules: {
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },

  // Build output and root build configuration are outside the app lint scope.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "node_modules/**",
    "next-env.d.ts",
    "tailwind.config.js",
    "postcss.config.js",
  ]),
]);
