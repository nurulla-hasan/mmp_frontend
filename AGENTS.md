<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# MMP Frontend

## Quick Start

```bash
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint (run before pushing)
npm run lint -- --fix  # Auto-fix lint issues
```

**Stack:** Next.js 16.2.10, React 19.2.4, TypeScript 5 (strict), Tailwind CSS v4, shadcn/ui (base-nova style), @base-ui/react ^1.6, @tanstack/react-table ^8.21.

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
- **`useNextFilter`** / **`useSmartFilter`** (`src/hooks/useNextFilter.ts`) — manage all URL search params (filter, pagination, search). Generic `useNextFilter<T extends string>(config?)`. Returns `{ updateFilter, toggleFilter, updateBatch, clearAll, getFilter, getArrayFilter, isSelected, isFilterActive, getAllFilters, getActiveCount, pendingKeys }`. Debounced, auto-syncs with browser history.
- **`nextServerFetch<T>(endpoint, options)`** (`src/lib/nextServerFetch.ts`) — **server-only** data fetching wrapper (marked `"server-only"`). Auto-injects `Authorization: Bearer <accessToken>` from cookies, auto-refreshes expired tokens via `/auth/refresh-token`. Use `isPublic: true` for unauthenticated requests. Options include `setCookies`, `persistCookies`, `revalidate`, `tags`, `invalidateMode` ("updateTag" | "revalidateTag"). Returns typed `T` or throws `ApiError { status, data }`.
- **`buildQueryString(query)`** (`src/lib/buildQueryString.ts`) — builds `?key=val&key2=val2` from `Record<string, string | number | string[] | undefined>`. Skips undefined/null/empty.
- **`DataTable`** (`src/components/ui/custom/data-table.tsx`) — TanStack Table wrapper with URL-driven search via `useSmartFilter` (debounced 500ms), server/client pagination, wrap in `<Suspense>` for `useSearchParams()`. Props: `columns`, `data`, `limit`, `meta`, `searchKey`, `searchPlaceholder`.
- **`SearchInput`** (`src/components/ui/custom/search-input.tsx`) — connects to URL params via `useNextFilter`. Debounced 300ms, `filterKey` defaults to `"searchTerm"`.
- **`Button`** (`src/components/ui/button.tsx`) — uses `@base-ui/react` `render` prop for polymorphic composition: `<Button nativeButton={false} render={<Link href="..." />} />`. Variants via `cva`: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`. Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`.
- **`Field` component system** — use `Field`, `FieldLabel`, `FieldGroup`, `FieldError` from `@/components/ui/field` for all forms (from shadcn).
- **Toast helpers** — `SuccessToast(msg)`, `ErrorToast(msg)`, `WarningToast(msg)`, `InfoToast(msg)` from `@/lib/utils` (wrap `sonner` toast).
- **Utility helpers** from `@/lib/utils`: `getInitials(name)` → "JD", `formatDate(dateString)` → "dd MMM yyyy", `timeAgo(createdAt)` → "5m ago", `generateSlug(title)`.
- **`Spinner`** (`src/components/ui/spinner.tsx`) — renders `Loader2Icon` with `animate-spin`, `size-4`, `role="status"`.

## Component Architecture

- **Server components by default** — only add `"use client"` when using hooks, browser APIs, or interactivity.
- **Page shell components** (`dashboard-page.tsx`, `public-page.tsx`): server components (no `"use client"`).
- **Interactive components** (`dashboard-shell.tsx`, `dashboard-header.tsx`): `"use client"`.
- **`DashboardPageHeader`** (`src/components/ui/custom/dashboard-page-header.tsx`) — shows back button (`router.back()`), title (uppercase primary), optional `length` badge, description.
- **`PublicPage`** (`src/components/shared/public-page.tsx`) — server component with title, description, optional eyebrow, cards grid, primaryAction.
- **`DashboardPage`** (`src/components/shared/dashboard-page.tsx`) — server component with title, description, cards (4-column grid), optional `showBack`.
- **`render` prop pattern** for polymorphic composition (e.g., `<Button nativeButton={false} render={<Link href="..." />} />`).
- **`ConfirmationModal`** (`src/components/ui/custom/confirmation-modal.tsx`) for confirm dialogs.
- **`ModalWrapper`** (`src/components/ui/custom/modal-wrapper.tsx`) for generic dialogs.

## Styling & Theming

- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax (NOT v3's `@tailwind` directives). Config via `@theme inline` block in CSS, not `tailwind.config`.
- **CSS variables in OKLCH color space** — defined in `globals.css`. Primary color is green (`oklch(0.527 0.154 150.069)`).
- **Radius system** — `sm=0.6r`, `md=0.8r`, `lg=r`, `xl=1.4r`, `2xl=1.8r`, `3xl=2.2r`, `4xl=2.6r` (where `r=0.425rem`).
- **Dark mode** — `.dark` class toggle via `next-themes` `<ThemeProvider>`. Dark variables in `.dark {}` block.
- **Fonts** — `Inter` (variable `--font-sans`), `Geist` (variable `--font-geist-sans`), `Geist_Mono` (variable `--font-geist-mono`). Body uses `font-sans`.
- **PostCSS** — `postcss.config.mjs` with only `@tailwindcss/postcss` plugin.
- Use `cn()` for all class composition; prefer Tailwind utility classes over custom CSS.

## Navigation

Navigation configs in `src/components/navigation/navigation-config.ts` — three role-based arrays (`userNav`, `surveyorNav`, `adminNav`). Each item: `{ title: string; href: string; icon: LucideIcon }`. `DashboardShell` renders the correct set based on `role` prop.

## Auth

Three roles: `USER`, `SURVEYOR`, `ADMIN`. Token stored in `httpOnly` `accessToken` cookie. Auto-handled by `nextServerFetch` (auto-injects `Authorization` header, auto-refreshes via `/auth/refresh-token` when expired). No middleware/route guard exists yet — protection is at layout level.

## UI Components Library

**shadcn base-nova components** (`src/components/ui/`):
`alert-dialog`, `button`, `calendar`, `collapsible`, `dialog`, `drawer`, `dropdown-menu`, `field`, `input-otp`, `input`, `label`, `pagination`, `scroll-area`, `separator`, `sonner`, `spinner`, `table`.

**Custom components** (`src/components/ui/custom/`):
`back-button`, `confirmation-modal`, `custom-calender` (note: typo preserved), `custom-pagination`, `dashboard-page-header`, `data-table-pagination`, `data-table`, `mobile-bottom-nav`, `modal-wrapper`, `search-input`, `star-rating`, `theme-toggle`.

## State Management

- **No Zustand/global state store** — this project relies on server components, URL search params (via `useNextFilter`), and local React state.
- **URL as source of truth** for filters, pagination, and search via `useNextFilter`.
- **Server components** for data fetching via `nextServerFetch` (auto-cached per request).

## Project Structure Notes

- This is a monorepo-style layout: `mmp_frontend/` and `mmp_backend/` are separate apps.
- `src/proxy.ts` does NOT exist — there is no middleware file yet.
- ESLint v9 flat config in `eslint.config.mjs` (uses `eslint-config-next`).
- TSConfig path alias: `@/*` → `./src/*`.
- Icons: primarily `lucide-react`, also `@hugeicons/core-free-icons` + `@hugeicons/react` available.
- See `CLAUDE.md` which references this file.
