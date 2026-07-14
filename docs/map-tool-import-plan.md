# Mouza Map Tool Import & Modernization Plan

> Source: `D:\Nurulla Hasan\my\mouza-map-pro`
>
> Target: `mmp_frontend` (Next.js App Router)
>
> Status legend: `[ ]` pending, `[~]` in progress, `[x]` complete

## 1. Goal

Import the existing Mouza Map calculation engine into MMP without changing its proven geometry and measurement behavior, while rebuilding the tool as a modern, immersive map workspace.

The new experience will be:

- Desktop: full-page map, floating controls, wheel zoom at cursor, left-click to add points, drag to pan.
- Mobile/tablet: fixed center crosshair with an explicit **Add point** action, pinch zoom, drag to pan.
- Shared engine: upload, scale calibration, plot drawing, snapping, measurement, manual division, results, print, scratch sheet, and project persistence.
- MMP-native: Next.js routing, MMP theme/components, MMP authentication, and MMP backend APIs.

## 2. Product Decisions

These decisions are the baseline for implementation. Change them here first if product direction changes.

### 2.1 Desktop interaction

- A short primary/left click adds a point only when an applicable mode is active:
  - `calibrating`
  - `drawing_plot`
  - `measuring`
  - manual division point editing where applicable
- Primary-button drag pans the map.
- A movement threshold distinguishes click from drag; a drag must never create a point on release.
- Mouse-wheel zoom is centered on the cursor location.
- Clicking near the first plot point closes the polygon when at least three points exist.
- Escape cancels the current mode/draft.
- Enter completes a valid plot or current operation.
- `Ctrl/Cmd + Z` and `Ctrl/Cmd + Shift + Z` perform undo/redo while the map workspace is focused.
- Floating UI, plot handles, dialogs, and other controls must stop pointer propagation so their clicks never add map points.

### 2.2 Mobile and touch interaction

- Retain the fixed center crosshair workflow.
- Drag moves the map below the crosshair.
- Pinch zooms around the gesture midpoint.
- A floating **Add point** button adds the map coordinate below the crosshair.
- Touch movement and pinch gestures must never add accidental points.
- Mobile controls use bottom sheets/compact floating actions instead of desktop side panels.

### 2.3 Workspace layout

- The map is the primary surface and fills the available viewport.
- Desktop controls float above the map:
  - top-left: project/map identity and upload
  - left or right: workflow panel (upload, scale, draw, divide)
  - top-right: save, help, theme, close/back
  - bottom-left: zoom/reset/fit controls
  - bottom-center: active-mode instructions and undo/redo
  - bottom-right: current measurement/result summary
- Panels are collapsible and must not permanently reduce canvas width.
- Results open in a floating panel/drawer; they do not push the map down.
- The immersive tool route must not render the normal public footer or public mobile bottom navigation.
- Other MMP tools keep the existing public page layout.

### 2.4 Route model

- The single workspace URL is `/tools/land-measurement`.
- Measurement, plot drawing, manual land division, scratch sheet, results, and reports all live in this one workspace.
- Land division is an in-workspace mode/action, not a separate route or landing page.
- Do not create or maintain a `/tools/land-division` route for this map tool.
- Implement an immersive tool-specific route layout while keeping the public URL stable.

## 3. Preserve vs Rebuild

### Preserve behavior exactly

- Polygon normalization and validation.
- Pixel-to-feet scale convention: `scale = pixels / feet`.
- Shoelace area calculation.
- Shotok conversion: `1 shotok = 435.6 sq ft`.
- Katha conversion: `1 katha = 720 sq ft`.
- Edge length and perimeter calculations.
- Logical edge grouping and label behavior.
- Concave-safe diagonal calculation using triangulation.
- Point/edge snapping and polygon clipping.
- Manual polygon division by polyline.
- Undo/redo semantics.
- Scratch sheet geometry and label-placement algorithms.
- Large-image tiling behavior and stale-generation protection.

### Rebuild for MMP

- Page composition and responsive layout.
- Sidebar, toolbar, cards, dialogs, and result presentation.
- React Router navigation/search-param usage.
- Authentication and Pro access checks.
- Direct Supabase project access.
- Toast integration.
- Tutorial UI.
- Styling and color usage.

### Preserve initially, refactor only after parity

- Zustand slice behavior.
- Konva layer organization.
- PDF/image processing pipeline.
- Stage rendering and performance optimizations.
- Print and scratch-sheet export pipeline.

## 4. Target Architecture

```text
Next.js route (server component)
        |
        +-- access/metadata/initial project data
        |
        +-- MapToolClient (client-only boundary)
                |
                +-- immersive workspace UI
                +-- Zustand map store
                +-- Konva map renderer
                +-- pointer/keyboard interaction controller
                +-- browser file/PDF/tile services
                +-- MMP project API adapter
                |
                +-- pure engine
                    +-- geometry
                    +-- calculations
                    +-- polygon division
                    +-- scratch math
```

Proposed target folders:

```text
src/features/map-tool/
  components/
    workspace/
    floating-controls/
    stage/
    results/
    scratch/
    print/
  engine/
    calculations.ts
    geometry.ts
    polygon-division.ts
    scratch-math.ts
  hooks/
    use-desktop-map-input.ts
    use-touch-map-input.ts
    use-map-shortcuts.ts
  store/
    use-map-store.ts
    slices/
  services/
    pdf.ts
    tiling/
    project-client.ts
  types/
  constants/
```

## 5. Source-to-Target Inventory

| Source area | Migration treatment |
|---|---|
| `src/utils/calculations.ts` | Import as pure engine; preserve formulas and constants |
| `src/utils/geometry.ts` | Import as pure engine; preserve algorithms |
| `src/utils/polygonDivision.ts` | Import as pure engine; preserve split behavior |
| `src/utils/scratchMath.ts` | Import after core plotting parity |
| `src/utils/canvas.ts` | Split formatting/constants from visual styling |
| `src/utils/pdfHelper.ts` | Move to browser-only service; verify Next worker setup |
| `src/utils/tiling/**` | Import as browser-only service; retain IndexedDB cleanup |
| `src/store/**` | Import behavior, update paths/toasts, keep client-only |
| `src/hooks/map/**` | Separate desktop pointer and mobile touch behavior |
| `src/components/map/stage/**` | Import renderer, then apply MMP tokens and new inputs |
| `src/components/map/sidebar/**` | Do not copy UI; rebuild as floating workflow controls |
| `src/components/map/toolbar/**` | Do not copy UI; rebuild as floating workspace toolbar |
| `ResultsDisplay.tsx` | Rebuild UI; reuse result types and formatting |
| `PrintLayout.tsx` and `print/**` | Import behavior after core engine parity |
| `scratch/**` | Import behavior in a later phase; rebuild shell/UI |
| `lib/project-api.ts` | Replace with MMP backend adapter; no direct Supabase port |
| React Router/auth components | Replace with Next.js routes and MMP auth/access model |

## 6. Implementation Phases

### Phase 0 — Baseline and safety net

- [ ] Record the source revision/commit used for the import.
- [ ] Run and record the old engine test results.
- [ ] Copy representative test fixtures for convex, concave, divided, tiny, invalid, and multi-plot cases.
- [ ] Add golden expected results for sqft, shotok, katha, perimeter, lengths, and diagonals.
- [ ] Document known source limitations so they are not mistaken for migration regressions.
- [ ] Confirm whether access is public, authenticated, or plan-gated in MMP.

**Gate:** No engine code is imported until expected results are recorded.

### Phase 1 — Dependencies and client boundary

- [ ] Read the installed Next.js 16 documentation relevant to client components and browser-only libraries before implementation.
- [ ] Add only required dependencies, expected to include Zustand, Konva, React-Konva, and PDF processing packages.
- [ ] Verify React 19.2 compatibility of exact package versions.
- [ ] Create the `src/features/map-tool` module boundary.
- [ ] Create a minimal client-only map workspace loaded from the server route.
- [ ] Confirm the route builds without accessing `window`, `document`, IndexedDB, or canvas during server rendering.

**Gate:** Empty Konva workspace renders in development and production build.

### Phase 2 — Pure engine import

- [ ] Import map types.
- [ ] Import geometry utilities.
- [ ] Import measurement calculations and unit constants.
- [ ] Import polygon division.
- [ ] Convert internal imports to the MMP feature paths.
- [ ] Keep pure engine files independent of React, DOM, Zustand, toast, and Next.js.
- [ ] Port the old engine tests.
- [ ] Add tests for calibration scale and conversion constants.
- [ ] Compare all golden results with the old project.

**Gate:** Pure engine output matches the source for every fixture.

### Phase 3 — Store and orchestration

- [ ] Port Zustand slices for image, calibration, UI, plots, division, measurement, and saved plots.
- [ ] Replace source toast calls with MMP toast helpers through a small adapter.
- [ ] Preserve plot history and draft-point undo/redo separately.
- [ ] Preserve reset/clear confirmation semantics.
- [ ] Prevent store initialization from directly reading browser storage during SSR/module evaluation.
- [ ] Hydrate saved scale/scratch data after client mount.
- [ ] Define a serializable project snapshot type independent of UI components.

**Gate:** Store action tests pass without rendering the old UI.

### Phase 4 — Map rendering and file pipeline

- [ ] Port the Konva stage and layer structure.
- [ ] Port image background rendering.
- [ ] Port PDF first-page rendering and DPI detection.
- [ ] Port PNG/JPG loading and validation.
- [ ] Retain 25 MB upload validation unless product requirements change.
- [ ] Port large-image tiling, visible-tile selection, IndexedDB storage, and cleanup.
- [ ] Port plotted polygons, active draft, calibration line, measurements, labels, diagonals, manual cut, and magnifier.
- [ ] Add fit-to-map and reset-view commands.
- [ ] Confirm rendering remains sharp and labels maintain readable size across zoom levels.

**Gate:** An uploaded map renders and all source geometry layers display correctly.

### Phase 5 — New desktop and mobile inputs

- [ ] Introduce a pointer interaction state machine: idle, click candidate, dragging, pinching, control interaction.
- [ ] Add desktop wheel zoom centered at cursor.
- [ ] Add desktop primary-click point placement.
- [ ] Use a small movement threshold to distinguish click from pan.
- [ ] Suppress the click following any drag/pinch/control interaction.
- [ ] Convert screen coordinates to map coordinates using current stage position and scale.
- [ ] Apply existing snapping and clipping before committing a point.
- [ ] Allow near-first-point click to finish a polygon.
- [ ] Retain desktop drag-to-pan.
- [ ] Retain mobile pinch-to-zoom and drag-to-pan.
- [ ] Retain mobile center-crosshair point placement.
- [ ] Add keyboard shortcuts and visible shortcut hints for desktop.
- [ ] Ensure draggable plot/cut handles do not trigger stage point placement.

**Gate:** Desktop and mobile interaction acceptance matrices both pass.

### Phase 6 — Immersive modern UI

- [ ] Create a tool-specific immersive layout without public footer/mobile navigation.
- [ ] Make the canvas fill the available `dvh` viewport.
- [ ] Build floating desktop workflow panel.
- [ ] Build floating top workspace toolbar.
- [ ] Build floating zoom/fit/reset controls.
- [ ] Build active-mode instruction bar with finish/cancel/undo/redo.
- [ ] Build compact live result summary.
- [ ] Build detailed result drawer/panel.
- [ ] Build mobile bottom action bar and workflow sheets.
- [ ] Make every floating panel collapsible or dismissible.
- [ ] Use MMP shadcn components through built-in/extended variants only.
- [ ] Use MMP semantic color tokens with light and dark definitions.
- [ ] Add loading, empty, error, processing, and disabled states.
- [ ] Add focus management, accessible labels, and minimum touch targets.

**Gate:** The full workflow is usable at mobile, tablet, laptop, and wide-desktop widths.

### Phase 7 — Complete feature parity

- [ ] Scale-bar calibration with presets and manual distance.
- [ ] Manual pixel/feet scale entry.
- [ ] Multiple plot creation.
- [ ] Plot/draft undo and redo.
- [ ] Point/edge snapping.
- [ ] Line measurement and dashed/solid option.
- [ ] Manual land division and editable cut line.
- [ ] Diagonal visibility toggle.
- [ ] Magnifier toggle.
- [ ] Result cards/table and plot totals.
- [ ] Print metadata and printable report.
- [ ] Scratch library with expiry behavior.
- [ ] Scratch sheet selection, layout, line drawing, undo/redo, and PDF export.
- [ ] Help/tutorial adapted to the new floating UI.

**Gate:** Every old tool capability has a mapped and tested replacement.

### Phase 8 — MMP backend and projects

- [ ] Define backend DTOs for project, scale, plot points, and calculated results.
- [ ] Decide whether the original map file remains local or is uploaded securely.
- [ ] Implement authenticated save through the MMP backend.
- [ ] Implement update with conflict/error handling.
- [ ] Implement project load and recalculation from stored points and scale.
- [ ] Never trust stored calculated totals when points and scale are available; recalculate in the engine.
- [ ] Connect the MMP saved-calculations/dashboard experience.
- [ ] Add access/plan enforcement at both route/UI and backend levels.
- [ ] Remove all old Supabase/SWR assumptions from the imported feature.

**Gate:** Save, close, reopen, update, and delete work through MMP APIs.

### Phase 9 — Performance, regression, and release

- [ ] Test large PDF/image uploads near the size limit.
- [ ] Test low-memory mobile behavior.
- [ ] Confirm tile-generation cancellation and cleanup.
- [ ] Measure interaction responsiveness while drawing and zooming.
- [ ] Check for unnecessary Zustand subscriptions and Konva rerenders.
- [ ] Verify print and exported PDF output.
- [ ] Verify light/dark themes.
- [ ] Verify Chromium, Firefox, Safari, Android Chrome, and iOS Safari.
- [ ] Run lint, typecheck, tests, and production build.
- [ ] Run a source-vs-target calculation comparison suite.
- [ ] Release behind a feature flag or controlled route if available.
- [ ] Keep the old tool available until parity sign-off.

**Gate:** Product sign-off after calculation parity, interaction testing, and cross-device QA.

## 7. Interaction Acceptance Matrix

### Desktop

- [ ] Wheel up/down zooms smoothly at the cursor without map jumping.
- [ ] Left click in draw mode adds exactly one point at the clicked map location.
- [ ] Left drag pans and adds no point.
- [ ] Clicking a floating control adds no point.
- [ ] Clicking/dragging a vertex or cut handle adds no unrelated point.
- [ ] Near-start click closes a valid polygon.
- [ ] Click outside an existing containing plot is clipped according to the existing engine.
- [ ] Undo/redo works from controls and keyboard shortcuts.
- [ ] Escape cancels and Enter completes only when valid.

### Mobile/tablet

- [ ] One-finger drag pans and adds no point.
- [ ] Pinch zooms around the gesture center and adds no point.
- [ ] Add-point action uses the coordinate under the center crosshair.
- [ ] Rapid touch/pinch transitions do not create accidental points.
- [ ] Active controls remain reachable without covering the crosshair.
- [ ] Bottom sheets do not resize or jump the canvas unexpectedly.

## 8. Calculation Regression Matrix

- [ ] Triangle.
- [ ] Rectangle.
- [ ] Irregular convex polygon.
- [ ] Concave polygon.
- [ ] Polygon containing near-duplicate points.
- [ ] Reversed winding order.
- [ ] Multiple adjacent plots with snapping.
- [ ] Measurement clipped to a containing polygon.
- [ ] Straight manual division.
- [ ] Multi-segment manual division.
- [ ] Division passing near an existing vertex.
- [ ] Invalid/non-intersecting division.
- [ ] Scale preset calibration.
- [ ] Manual scale calibration.
- [ ] Save/load recalculation parity.

## 9. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Next.js SSR evaluates browser-only map code | Keep a narrow client boundary and dynamically load heavy browser modules |
| Click conflicts with drag/pan | Pointer state machine, movement threshold, and post-drag click suppression |
| Floating UI click creates map point | Stop propagation plus explicit stage-target validation |
| Engine changes accidentally during UI rewrite | Import pure engine first and lock output with golden tests |
| Large maps freeze the UI | Preserve chunked tiling, progress, cancellation, and visible-tile rendering |
| Zustand localStorage hydration mismatch | Client-side hydration actions; no storage reads during server render |
| PDF worker/bundling problems | Validate exact Next.js worker configuration before completing PDF import |
| Old Supabase model leaks into MMP | Use a project service interface and MMP backend adapter only |
| Tool route still shows public footer/nav | Use a dedicated immersive route layout while preserving URL |
| Mobile browser address-bar resize causes canvas jumps | Preserve guarded resize logic and base layout on stable `dvh` behavior |

## 10. Definition of Done

The import is complete only when:

- [ ] Pure calculation outputs match the old project.
- [ ] Desktop click-to-add and drag-to-pan are reliable.
- [ ] Mobile crosshair workflow remains reliable.
- [ ] All old engine features have working replacements.
- [ ] The workspace is immersive, responsive, and MMP-themed.
- [ ] Save/load uses MMP backend/auth instead of direct Supabase.
- [ ] Accessibility and keyboard behavior are verified.
- [ ] Lint, typecheck, tests, and production build pass.
- [ ] Manual QA passes on agreed desktop and mobile browsers.
- [ ] Product owner signs off before retiring the old tool.

## 11. Working Rule

During implementation, update this document in the same change:

1. Mark the active task `[~]` before starting.
2. Mark it `[x]` only after its acceptance check passes.
3. Record any intentional engine behavior change under Product Decisions.
4. Do not begin a later phase if the current phase gate is failing, except for independent UI prototyping.
5. When a source feature is intentionally dropped, document the reason instead of silently omitting it.
