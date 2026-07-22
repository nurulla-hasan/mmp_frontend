<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


<!-- Design Rules -->
# 📚 Documentation & Knowledge Rules
1. DO NOT rely on your pre-trained outdated knowledge.
2. ALWAYS search and read the latest official documentation for React, Tailwind CSS, and Shadcn UI before generating or modifying code.

# 🎨 Shadcn UI Rules
1. Shadcn components are pre-designed. Prefer built-in props like `variant` and `size` over ad-hoc styling.
2. NEVER use `className` on a shadcn component to change appearance such as size, color, spacing, or typography.
3. For layout and spacing, wrap the shadcn component in regular HTML elements and apply Tailwind utilities to the wrapper, not the component itself.
4. If you need a new appearance, EXTEND the component's `variant` or `size` in its source file with `cva()`. Add only what you actually need.
5. The same rule applies to any custom component that already uses `cva()` — extend variants, do not override with `className`.

✅ Correct:
```tsx
// button.tsx — add new size
size: { xl: "h-12 gap-2 px-5 text-base" }

// usage
<Button size="xl">Book now</Button>
```

❌ Wrong:
```tsx
<Button className="h-12 px-5 text-base">Book now</Button>
```

# 🎨 Color System Rules
1. NEVER use hardcoded color values (e.g., `text-amber-500`, `bg-[#123456]`, `border-blue-300`, custom hex/rgb/oklch) directly on any component.
2. ALWAYS use CSS variable-based colors: `text-primary`, `bg-muted`, `border-border`, etc. All colors must be defined in `globals.css`.
3. Every color variable MUST have BOTH `:root` (light mode) and `.dark` (dark mode) definitions in `globals.css`, plus an `@theme inline` entry for Tailwind v4.
4. If a color you need doesn't exist in `globals.css`, add it first — in all three places: `@theme inline` block, `:root` section, and `.dark` section. Never skip dark mode.
5. For opacity variants, use the slash syntax with CSS variables: `text-primary/80`, `bg-primary/10`, `border-border/50`. Do NOT hardcode separate opacity colors.

# Responsive Design Rule
1. ALWAYS follow a mobile-first approach. Use base Tailwind utility classes for mobile screens and apply breakpoints (sm:, md:, lg:) for larger screens.

# TypeScript Error Handling Rule
1. ALWAYS use `error: unknown` in `catch` blocks instead of `error: any` to satisfy strict linting rules.
2. When extracting error messages, safely check the error type using `error instanceof Error ? error.message : "Fallback message"`.

<!-- End: Design rules -->



# MMP Frontend

## Quick Start

```bash
npm run dev      # http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint (run before pushing)
npm run lint -- --fix  # Auto-fix lint issues
```

**Stack:** Next.js 16.2.10, React 19.2.4, TypeScript 5 (strict), Tailwind CSS v4, shadcn/ui (base-nova style), @base-ui/react ^1.6, @tanstack/react-table ^8.21, **Zustand ^5.0.14** (land measurement, pantagraph, tracer, mouza map studio).

## Route Groups

| Group | Path | Layout | Notes |
|---|---|---|---|
| `(public)` | `/`, `/about`, `/contact`, `/fraud-awareness`, `/pricing`, `/surveyors`, `/surveyors/[slug]` | `PublicHeader` + `PublicFooter` + `MobileBottomNav` | Public pages |
| `(private)/(shell)` | `/tools`, `/tools/unit-converter`, `/tools/scale-guide`, `/tools/inheritance-calculator`, `/community`, `/join-as-surveyor`, `/dashboard/**`, `/surveyor/**` | `PrivateLayout` (PublicHeader + PublicFooter + MobileBottomNav) | Shell pages; route protection logic exists in `src/proxy.ts` but is currently disabled |
| `(private)/(bare)` | `/tools/tracer`, `/tools/pantagraph`, `/tools/land-measurement`, `/tools/mouza-map-studio`, `/tools/mouza-geo-studio` | `BareLayout` (empty wrapper, no shell) | Canvas-heavy tools — no header/footer wrapper |
| `(auth)` | `/login`, `/register`, `/forgot-password`, etc. | Centered layout with Logo | Auth flows |
| `(admin-dashboard)` | `/admin/**` | `AdminShell` | Admin panel |

## Key Patterns

- **`cn()`** from `@/lib/utils` — use for all conditional Tailwind class merging (wraps `clsx` + `tailwind-merge`).
- **`useNextFilter`** / **`useSmartFilter`** (`src/hooks/useNextFilter.ts`) — manage all URL search params (filter, pagination, search). Generic `useNextFilter<T extends string>(config?)`. Returns `{ updateFilter, toggleFilter, updateBatch, clearAll, getFilter, getArrayFilter, isSelected, isFilterActive, getAllFilters, getActiveCount, pendingKeys }`. Debounced, auto-syncs with browser history.  
  Note: `useSmartFilter` is a thin re-export wrapper — prefer `useNextFilter` directly.
- **`nextServerFetch<T>(endpoint, options)`** (`src/lib/nextServerFetch.ts`) — **server-only** data fetching wrapper (marked `"server-only"`). Reads `accessToken` from cookies and supports `auth: "required" | "optional" | "none"`. Accepts JSON or `FormData` body, forwards `next` fetch options, returns typed `T`, and throws `ApiError { status, data }` on failure. **Cannot be used in client components** — server-only import restriction.
- **`buildQueryString(query)`** (`src/lib/buildQueryString.ts`) — builds `?key=val&key2=val2` from `Record<string, string | number | string[] | undefined>`. Skips undefined/null/empty.
- **`DataTable`** (`src/components/ui/custom/data-table.tsx`) — TanStack Table wrapper with URL-driven search via `useSmartFilter` (debounced 500ms), server/client pagination, and an internal `React.Suspense` boundary for `useSearchParams()`. Props: `columns`, `data`, `limit`, `meta`, `searchKey`, `searchPlaceholder`.
- **`SearchInput`** (`src/components/ui/custom/search-input.tsx`) — connects to URL params via `useNextFilter`. Debounced 300ms, `filterKey` defaults to `"searchTerm"`.
- **`Button`** (`src/components/ui/button.tsx`) — uses `@base-ui/react` `render` prop for polymorphic composition: `<Button nativeButton={false} render={<Link href="..." />} />`. Variants via `cva`: `default`, `outline`, `secondary`, `ghost`, `destructive`, `link`. Sizes: `default`, `xs`, `sm`, `lg`, `icon`, `icon-xs`, `icon-sm`, `icon-lg`.
- **`Field` component system** — use `Field`, `FieldLabel`, `FieldGroup`, `FieldError` from `@/components/ui/field` for all forms (from shadcn).
- **Toast helpers** — `SuccessToast(msg)`, `ErrorToast(msg)`, `WarningToast(msg)`, `InfoToast(msg)` from `@/lib/utils` (wrap `sonner` toast).
- **Utility helpers** from `@/lib/utils`: `getInitials(name)`, `formatDate(dateString)`, `timeAgo(createdAt)`, `generateSlug(title)`, `clamp(value, min, max)`.
- **`Spinner`** (`src/components/ui/spinner.tsx`) — renders `Loader2Icon` with `animate-spin`, `size-4`, `role="status"`.
- **`nextDynamic`** — `next/dynamic` aliased as `nextDynamic` for SSR-disabled imports (used for Konva stage, PrintLayout).
- **`useShallow` from `zustand/shallow`** — used extensively in map tool and tracer for selective store subscriptions.
- **Canvas helpers** — `src/lib/canvasImage.ts`, `src/lib/cropImage.ts`, and `src/lib/konvaPerformance.ts` handle safe image scaling, avatar crop/compression, and Konva pixel ratio tuning.

## Component Architecture

- **Server components by default** — only add `"use client"` when using hooks, browser APIs, or interactivity.
- **Page shell components** (`dashboard-page.tsx`): server components (no `"use client"`). Note: `public-page.tsx` does NOT exist.
- **Interactive components** (`dashboard-shell.tsx`, `dashboard-header.tsx`): `"use client"`.
- **`DashboardPage`** (`src/components/shared/dashboard-page.tsx`) — server component with title, description, cards (4-column grid), optional `showBack`.
- **`PublicDynamicPage` / `DashboardDynamicPage`** (`src/components/shared/dynamic-page.tsx`) — generic route content components.
- **`SectionWrapper`** (`src/components/ui/custom/section-wrapper.tsx`) — configurable container: `padding` (none/sm/md/lg/xl), `bg` (white/muted/primary), `container`, `asSection`.
- **`PageWrapper`** (`src/components/ui/custom/page-wrapper.tsx`) — layout container with configurable padding and optional screen-height handling.
- **`RouteCard`** (`src/components/shared/route-card.tsx`) — link card with hover arrow animation.
- **`LoadingView`** (`src/components/shared/loading-view.tsx`) — centered `Spinner` + label.
- **`Logo`** (`src/components/shared/logo.tsx`) — image (`/assets/logo.png`) with optional text, 3 sizes.
- **`ImageCropDialog`** (`src/components/ui/custom/image-crop-dialog.tsx`) — `react-easy-crop` integration for avatar/profile cropping.
- **`render` prop pattern** for polymorphic composition (e.g., `<Button nativeButton={false} render={<Link href="..." />} />`).
- **`ConfirmationModal`** (`src/components/ui/custom/confirmation-modal.tsx`) for confirm dialogs.
- **`ModalWrapper`** (`src/components/ui/custom/modal-wrapper.tsx`) for generic dialogs.

## Styling & Theming

- **Tailwind CSS v4** — uses `@import "tailwindcss"` syntax (NOT v3's `@tailwind` directives). Config via `@theme inline` block in CSS, not `tailwind.config`.
- **CSS variables in OKLCH color space** — defined in `globals.css`. Primary: `oklch(54.758% 0.12188 161.051)` (green).
- **Radius system** — `sm=0.6r`, `md=0.8r`, `lg=r`, `xl=1.4r`, `2xl=1.8r`, `3xl=2.2r`, `4xl=2.6r` (where `r=0.425rem`).
- **Dark mode** — `.dark` class toggle via `next-themes` `<ThemeProvider>`. Dark variables in `.dark {}` block. Background: `oklch(17.764% 0.00002 271.152)`, borders: `oklch(1 0 0 / 10%)`.
- **Fonts** — `Noto_Sans_Bengali` (`--font-sans`, body), `Hind_Siliguri` (`--font-heading`), `Space_Grotesk` (`--font-display`), `Geist_Mono` (`--font-mono`). No Inter. Bengali-optimized.
- **Body constraint**: `<body>` has `max-w-480 mx-auto` at the root layout. Full-width backgrounds, sticky/fixed UI, and desktop-style shell assumptions may behave unexpectedly because the app is visually constrained to a narrow centered viewport.
- **Custom scrollbar**: 6px width, semi-transparent border-colored thumb.
- **Print styles**: scratch sheet print support with `body.printing-scratch`, A4 portrait, hides modals/overlays.
- **Chart colors**: 5-level green gradient for multi-plot differentiation.
- **PostCSS** — `postcss.config.mjs` with only `@tailwindcss/postcss` plugin.

## Navigation

Navigation configs in `src/components/navigation/navigation-config.ts` — three role-based arrays (`userNavigation`, `surveyorNavigation`, `adminNavigation`). Each item: `{ title: string; href: string; icon: LucideIcon }`.

## Auth

Three roles: `USER`, `SURVEYOR`, `ADMIN`. Token is stored in `httpOnly` cookies. `src/proxy.ts` contains auth route detection, token refresh, cookie sync, and role redirect logic, but `ROUTE_PROTECTION_ENABLED = false` currently keeps private route protection effectively off. `nextServerFetch` only reads the access token from cookies and forwards it as `Authorization` when auth is enabled.

## UI Components Library

**shadcn base-nova components** (`src/components/ui/`):
`alert-dialog`, `button`, `calendar`, `collapsible`, `dialog`, `drawer`, `dropdown-menu`, `field`, `input-otp`, `input`, `label`, `pagination`, `scroll-area`, `separator`, `sonner`, `spinner`, `table`, `tooltip`.

**Custom components** (`src/components/ui/custom/`):
`back-button`, `confirmation-modal`, `custom-breadcrumb`, `custom-calender` (note: filename typo — "calender" vs "calendar"), `custom-pagination`, `dashboard-page-header`, `data-table-pagination`, `data-table`, `mobile-bottom-nav`, `modal-wrapper`, `search-input`, `star-rating`, `theme-toggle`.

## State Management

- **Zustand IS used** for complex features — `useMapStore`, `usePantagraphStore`, `useTracerStore`, and `useMouzaMapStudioStore`.
- **No Zustand for simple pages** — rely on server components, URL search params (via `useNextFilter`), and local React state.
- **URL as source of truth** for filters, pagination, and search via `useNextFilter`.
- **Server components** for data fetching via `nextServerFetch` (auto-cached per request).

## Land Measurement / Map Tool (`src/features/land-measurement/`)

- **Stack**: `react-konva` + `konva` canvas rendering. Import with `nextDynamic(() => import(...), { ssr: false })`.
- **Zustand store** with 7 composed slices: `imageSlice`, `calibrationSlice`, `uiSlice`, `plotSlice`, `divideSlice`, `measurementSlice`, `savedPlotsSlice`. Orchestrated via `useMapStore`.
- **Modes**: `'none' | 'calibrating' | 'manual_scale' | 'drawing_plot' | 'measuring' | 'manual_divide_plot'`
- **Tiling system** (`src/features/land-measurement/utils/tiling/`): custom tile pyramid stored in IndexedDB (`mouzaMapTiles` DB), `TILE_SIZE = 256`, handles large map images exceeding GPU texture limits.
- **Bangladeshi land units**: shotok (435.6 sqft), katha (720 sqft), sqft. Scale: 16 inches = 1 mile (330 feet per map inch).
- **Print system**: SVG-based print layout with Bengali numeral conversion via `PrintLayout`, `PrintMapSVG`, `PrintLabelEngine`.
- **Google Drive**: `SaveProjectDialog` exports maps as local JSON; Drive API available for cloud storage.

## Pantagraph Tool (`src/features/pantagraph/`)

- Map overlay/comparison tool for comparing former vs current mouza maps.
- **Zustand store** (`usePantagraphStore`) with: two image layers (opacity, scale, rotation, position), match points, background removal, alignment computation.
- **Types**: `MatchPoint`, `Point2D`, `SimilarityResult`.
- **Utils**: `bgRemover.ts`, `getPixelColor.ts`, `similarity.ts`.

## Tracer Tool (`src/features/tracer/`)

- Polygon tracing tool for marking land boundaries on map images. Renders on a Konva canvas stage (imported via `nextDynamic`).
- **Zustand store** (`useTracerStore`) — multi-layer polygon drawing with:
  - Default layers: `'cs'` (C.S ম্যাপ, red `#DC2626`) and `'bs'` (B.S ম্যাপ, green `#16A34A`)
  - Up to 5 additional custom layers with auto-assigned colors
  - **Modes**: `'select'` | `'polygon'` | `'label'`
  - **Undo/redo**: full history stack via `past`/`future` snapshots (`cloneLayers` deep clone), capped by `MAX_HISTORY_ENTRIES = 100`
  - **Pending point undo/redo**: per-polygon drawing with `undoPendingPoint()`/`redoPendingPoint()`
  - **Label support**: free-position text labels with separate selection state and CRUD actions
  - Polygon auto-routing: when committing a polygon that starts/ends on an existing polygon edge, `routeAlongPolygon()` snaps the closing edge to follow the existing polygon boundary
- **Components**: `TracerCanvas` (Konva stage), `TracerLayout` (page shell), `TracerSidebar` (layer list & controls), `TracerToolbar` (mode toggle, undo/redo/clear), `PendingPolygon` (in-progress drawing overlay), `CompletedPolygons` (renders all committed polygons)
- **Hooks**: `useTracerTouch` — touch/pan/zoom handler (pinch zoom, drag) for the Konva stage
- **Utils**: `snapping.ts` — `getTracerSnappedPoint()` for vertex/edge snap with angle-based magnet falloff; `routing.ts` — `routeAlongPolygon()` finds path along existing polygon edges between two points; `exportTracer.ts` — SVG/PDF export via `jsPDF` with proportional font sizing and CS-on-top layer sorting

## Mouza Map Studio (`src/features/mouza-map-studio/`)

- Sheet editing workspace with a 3-step flow: `align | edit | layout`.
- **Zustand store** (`useMouzaMapStudioStore`) manages alignment state, editor strokes/text history, sheet metadata, layout state, and reset flow.

## Mouza Geo Studio / Mouza Geo (`src/features/mouza-geo/`)

- Georeferencing-oriented tool used by `/tools/mouza-geo-studio`.
- **Capabilities**: image processing, affine/similarity geo math, and KMZ export helpers.

## Hooks

| Hook | File | Purpose |
|---|---|---|
| `useNextFilter<T>` | `src/hooks/useNextFilter.ts` | URL search params manager |
| `useSmartFilter<T>` | `src/hooks/useSmartFilter.ts` | Thin re-export of useNextFilter |
| `usePanZoom` | `src/hooks/usePanZoom.ts` | Pan/zoom/pinch for canvas |
| `useUtilityHooks` | `src/hooks/useUtilityHooks.ts` | `useCopyToClipboard()`, `useCountdown()`, `useLocalStorage()`, `useMediaQuery()`, `useNetworkStatus()` |
| `useStageEvents` | `src/features/land-measurement/hooks/useStageEvents.ts` | Konva stage events (wheel zoom, touch/pinch) |
| `useEdgeLabels` | `src/features/land-measurement/hooks/useEdgeLabels.ts` | Edge label positions for polygon side lengths |
| `useGeometrySnap` | `src/features/land-measurement/hooks/useGeometrySnap.ts` | Snap cursor to polygon vertices/edges |
| `usePolygonSegments` | `src/features/land-measurement/hooks/usePolygonSegments.ts` | Group segments by co-linearity, compute real-world lengths |

## Server Actions & API Routes

- **`src/actions/drive.ts`** — `getDriveFolders(parentId?)`, `getDriveFiles(folderId)` — Google Drive listing.
- **`src/app/api/drive/proxy/route.ts`** — `GET?id=fileId` — proxies image files from Google Drive (streams response).

## Key Dependencies Not in Standard Stack

- `zustand ^5.0.14` — map/pantagraph state management
- `konva ^10.3.0` + `react-konva ^19.2.5` — canvas rendering
- `framer-motion ^12.42.2` — animations
- `html2canvas ^1.4.1` — screenshot capture for print
- `jspdf ^4.2.1` — PDF generation
- `pdf-lib ^1.17.1` — PDF manipulation
- `pdfjs-dist ^6.1.200` — PDF rendering for map import
- `googleapis ^173.0.0` — Google Drive API
- `react-easy-crop ^6.2.2` — image cropping
- `@hugeicons/core-free-icons ^4.2.2` — alternative icon library
- `input-otp ^1.4.2` — OTP input
- `jwt-decode ^4.0.0` — token expiration checking
- `zod ^4.4.3` — **v4** syntax (not v3)

## Potential Pitfalls

1. **`src/proxy.ts` exists, but protection is disabled** — do not assume private pages are truly guarded just because proxy auth logic is present.
2. **`nextServerFetch` is server-only** — cannot be used in client components; there is no documented client-side fetch wrapper yet.
3. **Body has `max-w-480 mx-auto`** — full-width backgrounds, sticky sidebars, and fixed-position UI may behave unexpectedly due to the narrow centered viewport.
4. **Map, tracer, and studio stores use browser-only types** like `HTMLImageElement` — they are client-side only and cannot be SSR'd.
5. **`PublicPage` component does NOT exist** — use `SectionWrapper` + `PageWrapper` instead.
6. **Auth and profile flows are still partly placeholder** — several forms still contain `console.log(...)` and `TODO` logic.
7. **`zod ^4.4.3`** is used — some forms still rely on `zodResolver(... ) as any` casts.
8. **Filename typo**: `custom-calender.tsx` (should be `calendar`).
9. **Bangla-first content** — all public-facing content (home, community, surveyor search) is in Bengali. Assume Bengali text for public pages.
10. **Tracer uses hardcoded layer colors in store defaults** — preserve them unless you intentionally redesign that color system.

## Project Structure Notes

- This is a monorepo-style layout: `mmp_frontend/` and `mmp_backend/` are separate apps.
- ESLint v9 flat config in `eslint.config.mjs` (uses `eslint-config-next`).
- TSConfig path alias: `@/*` → `./src/*`.
- Icons: primarily `lucide-react`, also `@hugeicons/core-free-icons` + `@hugeicons/react` available.
- See `CLAUDE.md` which references this file.
