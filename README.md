# TUC — The Ultimate Collaboration

TUC is a public-facing concept site that connects people, ideas, knowledge, and
existing efforts. This repository contains the Next.js App Router implementation
and the original Vite application, which is retained while the migration is
completed and verified.

## Project status

- The Vite → Next.js route migration is complete for all ten public routes plus
  the 404 page.
- Next.js is now the default application for `dev`, `build`, and `start`.
- The original Vite application remains in place and can still be run explicitly.
- Deployment readiness for Vercel is implemented and verified locally.
- Legacy decommissioning (removing Vite files, unused components, or dependency
  cleanup) is a separate, not-yet-authorized milestone.

## Requirements

| Tool | Version |
| --- | --- |
| Node.js | `24.x` (declared in `package.json` `engines`; verified with 24.19.0) |
| npm | 11.x (verified with 11.17.0) |

Next.js 16.4.3 requires Node.js `>=20.9.0`. Node 24 is the current Vercel
default runtime and is what `engines.node` pins for local and deployment use.

## Install and run

```bash
npm ci
npm run dev
```

Then open http://localhost:3000.

No environment variables, credentials, or external services are required to run
the application or its checks.

### Default (Next.js) commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build of the Next.js application |
| `npm start` | Serve the production Next.js build |
| `npm run dev:next` | Explicit alias for `next dev` |
| `npm run build:next` | Explicit alias for `next build` |
| `npm run start:next` | Explicit alias for `next start` |

### Legacy (Vite) commands

The legacy application is still available locally and is not the deployment
target.

| Command | Purpose |
| --- | --- |
| `npm run dev:vite` | Start the Vite development server |
| `npm run build:vite` | Build the legacy Vite application into `dist/` |
| `npm run preview` | Preview the legacy Vite build (unchanged behavior) |
| `npm run preview:vite` | Explicit alias for `vite preview` |

## Quality gates

Run these before opening a pull request:

```bash
npm run lint
npm run typecheck
npm run build
npm run build:vite
npm run verify:migration
git diff --check
```

`npm run typecheck` runs the Next.js type generation and all three TypeScript
projects (`tsconfig.json`, `tsconfig.legacy.json`, `tsconfig.node.json`).

### Migration verification harness

`scripts/verify-migration.mjs` drives a real Chrome instance over the DevTools
Protocol against an isolated production server. It checks every route, the 404,
skip navigation, dialogs, clipboard, toasts, accordions, the Top10 layout, the
survey contract, metadata, and favicon behavior.

Prerequisites:

- A production build must exist (`npm run build` or `npm run build:next`).
- Chrome or Chromium must be installed. The harness searches common macOS,
  Windows, and `PATH` locations automatically.
- Set `CHROME_PATH` to an explicit browser executable if discovery fails.
- The harness serves the app itself on an ephemeral port. To verify an already
  running build instead, set `BASE_URL=http://127.0.0.1:3000`.

```bash
npm run build
npm run verify:migration

# Or against an existing server:
BASE_URL=http://127.0.0.1:3000 node scripts/verify-migration.mjs
```

Safety properties of the harness:

- It starts an isolated Next.js production server and a temporary Chrome profile,
  then cleans both up.
- The survey's Apps Script host is blackholed with a Chrome host-resolver rule,
  and requests to it are intercepted and answered offline.
- It never submits real survey data and never contacts Google Apps Script.

## Routes

| Route | Description |
| --- | --- |
| `/` | Landing page and welcome overlay |
| `/black-hand` | What is TUC? |
| `/earth-globe` | The resources we need already exist |
| `/yellow-sticky-note` | 2% spare bandwidth |
| `/red-flag` | Red flags |
| `/crumpled-paper` | Another app? |
| `/closerlook` | CloserLook@ document workspace |
| `/top10-poc` | Top10: ways to engage |
| `/open-items` | OpenItems workspace |
| `/survey-poc` | "WTF is TUC?" survey |

Unmatched routes render the real 404 page with an HTTP 404 status and a
`noindex` robots tag.

## Metadata and favicon

- The brand icon lives at `src/app/icon.svg`, with a multi-size
  `src/app/favicon.ico` generated from it.
- The root layout defines the default title, description, Open Graph tags, and
  the `%s | TUC` title template.
- Every named route has a unique title, description, and Open Graph title and
  description.
- No canonical URL or `metadataBase` is emitted because the authoritative
  production domain has not been established. Add both when the final domain is
  confirmed.
- The 404 page keeps the root title and relies on the framework-injected
  `noindex` directive.

## Error handling

- `src/app/error.tsx` handles route-level render errors, offers "Try again" and
  "Back to TUC", and logs only the error digest.
- `src/app/global-error.tsx` handles errors thrown by the root layout. It
  supplies its own `<html>`/`<body>` document and inline TUC styling because it
  bypasses the global stylesheet.
- Neither boundary exposes stack traces, environment values, or user data.

Route-level recovery was verified with a temporary client probe route: a click
threw an error, `error.tsx` rendered the fallback without the error message, and
"Try again" recovered the route. The probe was removed before the final build.

To verify the global boundary locally, temporarily throw from the root layout
(for example, add `throw new Error("global-error probe")` inside `RootLayout` in
`src/app/layout.tsx`), run `npm run dev`, load any route, confirm the
document-level fallback renders, then revert the edit. The probe must not be
committed.

## Vercel deployment approach

- Vercel's native Next.js framework detection is used. There is intentionally no
  `vercel.json`.
- The default build command is `npm run build` (`next build`), and the default
  output is the standard Next.js build output. Static export is **not** used.
- `engines.node` pins Node 24.x, which overrides the project's Node setting on
  Vercel.
- All routes, the real 404, client interactions, and the survey's browser-side
  request are compatible with the default Next.js deployment model.
- No production secrets or environment variables are required at build time or
  runtime.
- The legacy Vite build is not the deployment target.

To deploy, import the repository in Vercel, confirm the framework preset is
Next.js, and use the default build and output settings. No Vercel project has
been created or linked from this worktree, and no deployment has been performed.

## Continuous integration

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`,
`next-impl`, and `migrate-to-nextjs`. It installs from the lockfile with
`npm ci`, runs lint, typecheck, the Next.js build, the Vite build, the migration
harness, and `git diff --check`. Chrome is installed explicitly with
`browser-actions/setup-chrome` and passed to the harness through `CHROME_PATH`.
The workflow requires no production secrets and cannot send a real survey
submission.

The workflow has been validated locally as YAML and matches the local gate
commands, but it has not yet run on GitHub Actions.

## Known limitations and deviations

- **Survey persistence cannot be confirmed client-side.** The survey uses a
  `no-cors` request, so the browser receives an opaque response. A resolved
  fetch only proves that the request was dispatched; it does **not** prove that
  Google Apps Script stored the submission. Do not describe a simulated or
  opaque response as server-side confirmation.
- **Canonical domain pending.** No production domain is confirmed, so canonical
  URLs and `metadataBase` are intentionally omitted.
- **Client pages use metadata layouts.** The landing page is split into a server
  `page.tsx` and a client `LandingPage.tsx`. Four client routes use
  metadata-only `layout.tsx` files so they can export metadata. Rendering and
  behavior are unchanged.
- **Legacy ESLint exclusions remain.** The legacy Vite components are still
  excluded from the lint gate. Production Next.js code, including
  `src/components/next/DeepLinkCard.tsx`, is linted.
- **`.DS_Store` is tracked.** This is a pre-existing repository condition and
  was left untouched.
- **No remote CI run yet.** The workflow is committed to the worktree only after
  review; its first remote run is still pending.

## Outstanding release-readiness items

1. Confirm the authoritative production domain, then add `metadataBase` and
   canonical URLs.
2. Create/link the Vercel project and run an authorized preview deployment.
3. Run the CI workflow on GitHub and confirm the Chrome-backed harness passes on
   the hosted runner.
4. Decide when to decommission the Vite application and legacy components in a
   separately authorized milestone.
5. Verify survey persistence through an authorized server-side or Apps Script
   check if that guarantee is required.
