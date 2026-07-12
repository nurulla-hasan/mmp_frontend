<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MMP Frontend

## Quick Start

```bash
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

**Stack:** Next.js 16, React 19, TypeScript (strict), Tailwind CSS v4, shadcn/ui (base-nova style), @base-ui/react primitives.

## Route Groups

| Group | Path | Layout |
|---|---|---|
| `(public)` | `/` | `PublicHeader` + `PublicFooter` + `MobileBottomNav` |
| `(auth)` | `/login`, `/register`, etc. | Centered layout with Logo |
| `(user-dashboard)` | `/dashboard/**` | `DashboardShell` role="user" |
| `(surveyor-dashboard)` | `/surveyor/**` | `DashboardShell` role="surveyor" |
| `(admin-dashboard)` | `/admin/**` | `DashboardShell` role="admin" |

## Key Patterns

- **`cn()`** from `@/lib/utils` — use for all conditional Tailwind class merging (wraps `clsx` + `tailwind-merge`).
- **`useNextFilter`** (`src/hooks/useNextFilter.ts`) — manage all URL search params (filter, pagination, search). Use `updateFilter`, `toggleFilter`, `updateBatch`, `clearAll`. Debounced, auto-syncs with browser history.
- **`nextServerFetch`** (`src/lib/nextServerFetch.ts`) — server-side data fetching wrapper. Auto-injects `accessToken` from cookies, handles token refresh. Use `isPublic: true` for unauthenticated requests.
- **`DataTable`** (`src/components/ui/custom/data-table.tsx`) — TanStack Table wrapper with URL-driven search, server/client pagination, empty state.
- **`Button`** uses `@base-ui/react` `render` prop for polymorphic composition: `<Button nativeButton={false} render={<Link href="..." />} />`.
- **`Field` component system** — use `Field`, `FieldLabel`, `FieldGroup`, `FieldError` from `@/components/ui/field` for all forms.
- **Toasts** — `SuccessToast(msg)`, `ErrorToast(msg)`, `WarningToast(msg)`, `InfoToast(msg)` from `@/lib/utils`.

## Component Architecture

- **Server components by default** — only add `"use client"` when using hooks, browser APIs, or interactivity.
- **Interactive components** (`dashboard-shell.tsx`, `auth-form.tsx`): `"use client"`.
- **Page shell components** (`dashboard-page.tsx`, `public-page.tsx`): server components — no `"use client"`.
- **`render` prop pattern** for polymorphic composition (e.g., Button + Link).
- **`ConfirmationModal`** for confirm dialogs; **`ModalWrapper`** for generic dialogs.

## Styling

- Tailwind CSS v4 with `@import "tailwindcss"` syntax (not v3 `@tailwind` directives).
- CSS variables in OKLCH color space, primary is green.
- Dark mode via `.dark` class, `next-themes` for toggling.
- Use `cn()` for all class composition; prefer Tailwind utility classes over custom CSS.

## Navigation

Navigation configs in `src/components/navigation/navigation-config.ts` — three role-based arrays (`userNav`, `surveyorNav`, `adminNav`). Each item: `{ title, href, icon }`. DashboardShell renders the correct set based on `role` prop.

## Auth

Three roles: `USER`, `SURVEYOR`, `ADMIN`. Auth form via `AuthForm` component with `mode` prop. Token stored in `accessToken` cookie, auto-handled by `nextServerFetch`.

## Important Notes

- This project uses a **monorepo-style layout**: `mmp_frontend/` and `mmp_backned/` are separate apps.
- See `README.md` for general setup info.
- See `CLAUDE.md` which references this file.
