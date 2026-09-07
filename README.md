# Mouza Map Pro Frontend

A high-performance, Bangla-first web platform for digital land surveying, cadastral map analysis, plot calculations, interactive canvas tools, PDF workflows, KMZ geospatial export & visualization, and surveyor networking in Bangladesh.

[Live Product](https://mouzamappro.com/) · [Developer Portfolio](https://nurulla-hasan-portfolio-pink.vercel.app/)

> **Status:** Version 2 is under active development. This repository contains the Next.js 16 App Router frontend.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | Next.js 16.2.10 (App Router), React 19.2.4, TypeScript 5 (strict mode) |
| **Styling & Theming** | Tailwind CSS v4, OKLCH Color System, Shadcn UI / `@base-ui/react`, Lucide & Hugeicons, Framer Motion |
| **State & Filtering** | Zustand 5 (Dedicated Canvas & Studio Stores), TanStack Table 8, URL-driven `useNextFilter` |
| **Canvas & Interactive Mapping** | Konva, React Konva, Leaflet, Esri World Imagery (Satellite), OpenStreetMap |
| **Geospatial & Compression** | `fflate` (High-speed KMZ/ZIP streaming & archive parsing), KML DOM Parser |
| **PDF & Image Processing** | PDF.js (`pdfjs-dist`), `pdf-lib`, `jsPDF`, `html2canvas`, `react-easy-crop` |
| **PWA & Offline** | Web App Manifest, Service Worker caching, Custom Offline Fallback (`/offline`) |
| **Security & Routing** | Next.js 16 `src/proxy.ts` (Network-level Route Protection & Token Refresh) |
| **Package Manager** | `pnpm` (Recommended) / `npm` |

---

## 🗺️ Surveying, Calculation & Mapping Tools

| Tool | Purpose | Access | Route |
|---|---|---|---|
| **Unit Converter** | Convert between Shotok, Katha, Bigha, Acre, Sq. Feet, Sq. Meter, and Hectare | Free | `/tools/unit-converter` |
| **Inheritance Calculator** | Assist with Muslim and legal land property distribution among heirs | Free | `/tools/inheritance-calculator` |
| **Map Scale Guide** | Step-by-step tutorial on 16 inch = 1 mile, Gunia, and custom scale calibration | Free | `/tools/scale-guide` |
| **KMZ Map Viewer** | Render and inspect Google Earth `.kmz` & `.kml` overlays on live satellite maps | Free | `/tools/kmz-viewer` |
| **Land Measurement** | Measure plots directly from mouza maps with custom scale, plot splitting & PDF reports | Pro | `/tools/land-measurement` |
| **Pantagraph** | Overlay, superimpose, rotate, and compare C.S. and B.S. mouza maps | Pro | `/tools/pantagraph` |
| **Digital Map Tracer** | Trace boundaries and plot numbers from old maps to create clean digital vector maps | Pro | `/tools/tracer` |
| **Mouza Map Studio** | Align C.S/B.S maps, crop, clean up artifacts, annotate, and export printable sheets | Pro | `/tools/mouza-map-studio` |
| **Mouza Geo Studio** | Georeference mouza-map PDFs against real-world satellite maps and export as KMZ | Pro | `/tools/mouza-geo-studio` |

---

## 🌟 Key Application Features

### 1. Geospatial KMZ & Map Workflows
- **KMZ Map Viewer**: Client-side unzipping via `fflate`, extracting Ground Overlays, Placemarks, Polygons, and Screen Overlays directly inside the browser.
- **Satellite & Street Layers**: Toggle seamlessly between Esri World Imagery and OpenStreetMap base layers.
- **Layer & Viewport Controls**: Filter overlay visibilities, zoom to fit bounds, inspect coordinates in real time, and persist toolbar popovers during map interactions.
- **Mouza Geo Studio**: Calibrate raster and vector mouza sheets against geographic coordinates, align GCPs (Ground Control Points), and export production-ready `.kmz` files for Google Earth.

### 2. Digital Surveying & Canvas Studios
- **Touch & Stylus Gestures**: Anchored pinch-to-zoom, pan, rotation, and precision stylus drawing across mobile and tablet devices.
- **Land Plot Splitting**: Divide irregular mouza plots into exact required areas with real-time geometric calculation.
- **Map Alignment & Cleanup**: Compare historical C.S. (Cadastral Survey) and modern B.S. (Bangladesh Survey) sheets with opacity blending, scale synchronization, and noise reduction.
- **Automated Client Reports**: Export branded survey measurement sheets and calculation summaries directly to high-resolution PDF.

### 3. Surveyor Directory & Community
- **Verified Surveyor Directory**: Search and filter licensed surveyors across districts, divisions, and specialties.
- **Direct Engagement**: Review surveyor credentials, experience, ratings, and start 1-click WhatsApp messaging.
- **Surveyor Profiles**: Custom public profiles displaying badges, service areas, offered surveying services, and portfolio work.
- **Cloud Project Sync**: Surveyors can store, reload, and organize plot calculations and measurement histories.

### 4. Subscription & Payment System
- **Transparent Plans**: Monthly Pro (৳২৯৯), 6 Months Pro (৳৯৯৯), and Yearly Pro (৳১,৫৯৯).
- **Manual Mobile Payments**: bKash, Nagad, and Rocket checkout workflow with Transaction ID (TrxID) submission.
- **Validity Stacking (Accumulated Duration)**: Unused active subscription days automatically carry forward and stack onto renewed or upgraded terms.
- **Downgrade Guard**: Protects active subscribers from accidental lower-tier downgrades.

### 5. Administration & Governance
- **Subscriber & User Roster**: Comprehensive user roster and active subscriber monitor.
- **Payment Verification**: 1-click administrative review (Approve / Reject) for manual bKash/Nagad transactions with audit logs.
- **Surveyor Verification**: Administrative verification of submitted NID and surveying certifications.
- **Platform Controls**: Dynamic payment numbers, device locking management, and sitewide broadcast announcements.

### 6. PWA & Offline Readiness
- **Installable Web App**: Standalone mobile and desktop application experience with custom icons and splash themes.
- **Service Worker Caching**: Resilient offline fallback (`/offline`) ensuring critical calculation utilities remain accessible in rural surveying fields with low connectivity.

---

## ⚡ Engineering & Architecture Highlights

- **Next.js 16 Proxy Convention**: Uses `src/proxy.ts` for unified network-level route protection, token refresh, and role-based redirects.
- **Zero-Leak Memory Management**: Centralized tracking and automatic revocation (`URL.revokeObjectURL`) of tile and raster blob URLs generated during KMZ parsing and canvas operations.
- **$O(1)$ Media Indexing**: Indexed media dictionaries for instantaneous retrieval of embedded archive assets during KMZ rendering.
- **Isolated Canvas Contexts**: Isolated drawing states preventing canvas shadow leakage and visual artifacts during map re-renders.
- **State Isolation**: Independent Zustand stores (`useMapStore`, `usePantagraphStore`, `useTracerStore`, `useMouzaMapStudioStore`) to maintain 60fps canvas performance.
- **Typed Server Fetcher**: `nextServerFetch` client with automatic server-side cookie injection and tag-based revalidation (`updateTag`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+** or **Node.js 22+**
- **pnpm** (Recommended) or **npm**
- Running **Mouza Map Pro Backend** instance (default: `http://localhost:5000`)

### Installation

```bash
# Clone the repository
git clone https://github.com/nurulla-hasan/mmp.git
cd mmp/mmp_frontend

# Install dependencies (pnpm recommended)
pnpm install
# or: npm install

# Configure environment
cp .env.example .env.local
```

### Configure `.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Start Development Server

```bash
# Start development server
pnpm dev
# or: npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start development server on port 3000 |
| `pnpm build` | Compile and build production bundle |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint checks |

---

## 👨‍💻 Author & Maintainer

Developed with ❤️ by **[Nurulla Hasan](https://github.com/nurulla-hasan)**.  
All rights reserved © 2026 **Mouza Map Pro**.
