# Mouza Map Pro Frontend

A high-performance, Bangla-first web platform for digital land surveying, cadastral map analysis, plot calculations, interactive canvas tools, PDF workflows, KMZ geospatial export, and surveyor networking in Bangladesh.

[Live Product](https://mouzamappro.com/) · [Developer Portfolio](https://nurulla-hasan-portfolio-pink.vercel.app/)

> **Status:** Version 2 is under active development. This repository contains the Next.js 16 App Router frontend.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | Next.js 16.2.10 (App Router), React 19.2.4, TypeScript 5 (strict mode) |
| **Styling & Theming** | Tailwind CSS v4, OKLCH Color System, Shadcn UI / `@base-ui/react`, Framer Motion |
| **State & Filtering** | Zustand 5 (Canvas Stores), TanStack Table 8, URL-driven `useNextFilter` |
| **Canvas & Interactive Mapping** | Konva, React Konva, Leaflet, OpenStreetMap |
| **PDF & Image Processing** | PDF.js (`pdfjs-dist`), `pdf-lib`, `jsPDF`, `html2canvas`, `react-easy-crop` |
| **Geospatial & Compression** | `fflate` (KMZ streaming & compression) |
| **Security & Routing** | Next.js 16 `src/proxy.ts` (Route Protection & Token Refresh) |

---

## 🗺️ Surveying, Calculation & Mapping Tools

| Tool | Purpose | Access | Route |
|---|---|---|---|
| **Unit Converter** | Convert between Shotok, Katha, Bigha, Acre, Sq. Feet, Sq. Meter, and Hectare | Free | `/tools/unit-converter` |
| **Inheritance Calculator** | Assist with inheritance-related land property distribution among heirs | Free | `/tools/inheritance-calculator` |
| **Map Scale Guide** | Step-by-step tutorial on 16 inch = 1 mile and custom scale calibration | Free | `/tools/scale-guide` |
| **Land Measurement** | Measure plots directly from mouza maps with custom scale, plot splitting & PDF reports | Pro | `/tools/land-measurement` |
| **Pantagraph** | Overlay, superimpose, rotate, and compare C.S. and B.S. mouza maps | Pro | `/tools/pantagraph` |
| **Digital Map Tracer** | Trace boundaries and plot numbers from old maps to create clean digital vector maps | Pro | `/tools/tracer` |
| **Mouza Map Studio** | Align C.S/B.S maps, crop, clean up artifacts, annotate, and export printable sheets | Pro | `/tools/mouza-map-studio` |
| **Mouza Geo Studio** | Georeference mouza-map PDFs against real-world satellite maps and export as KMZ | Pro | `/tools/mouza-geo-studio` |

---

## 🌟 Key Application Features

### 1. Visitors & Landowners
- **Surveyor Directory**: Discover verified surveyors by district, division, and offered services.
- **Direct Engagement**: View surveyor experience, starting prices, and client reviews with 1-click WhatsApp messaging.
- **Free Calculation Tools**: Access unit conversions, inheritance calculation, and map scale guides without requiring a subscription.

### 2. Surveyors
- **Professional Profile**: Manage bio, service areas, offered surveying services, and custom starting prices.
- **Verification Badging**: Submit NID and professional certifications for administrator verification.
- **Cloud Project Storage**: Automatically sync plot calculations, land measurements, and client reports.

### 3. Subscription & Manual Checkout System
- **Transparent Plans**: Monthly Pro (৳২৯৯), 6 Months Pro (৳৯৯৯), and Yearly Pro (৳১,৫৯৯).
- **Manual Payments**: bKash, Nagad, and Rocket payment checkout with TrxID submission modal.
- **Validity Stacking (Accumulated Duration)**: When upgrading or renewing, remaining active days are preserved and added to the new subscription term.
- **Downgrade Guard**: Prevents accidental subscription downgrades while on a higher active plan.

### 4. Administrator Panel
- **User & Subscriber Roster**: Manage users and view active subscribers (1 row per user).
- **Transaction Logs**: Dedicated chronological subscription history and payment audit log on the Plans page.
- **Payment Verification**: 1-click Approve / Reject for manual bKash/Nagad payment requests.
- **Dynamic Platform Settings**: Manage bKash/Nagad payment numbers, Auto-Grant Pro on registration toggle, and broadcast announcements.

---

## ⚡ Engineering & Architecture Highlights

- **Next.js 16 Proxy Convention**: Implements `src/proxy.ts` for unified network-level route protection, token refresh, and role-based redirects.
- **Mobile-First Canvas Controls**: Custom touch gesture handlers with anchored pinch-to-zoom, pan, and smooth stylus drawing.
- **Multi-File State Isolation**: Dedicated Zustand stores (`useMapStore`, `usePantagraphStore`, `useTracerStore`, `useMouzaMapStudioStore`) for high-performance canvas rendering.
- **Server-Only API Client**: Typed `nextServerFetch` client with automatic server-side token injection and tag-based cache revalidation (`updateTag`).

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 20+** or **Node.js 22+**
- **npm** or **pnpm**
- Running **Mouza Map Pro Backend** instance (default: `http://localhost:5000`)

### Installation

```bash
# Clone the repository
git clone https://github.com/nurulla-hasan/mmp.git
cd mmp/mmp_frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
```

### Configure `.env`
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

### Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Available Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Compile and build production bundle |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint checks |

---

## 👨‍💻 Author & Maintainer

Developed with ❤️ by **[Nurulla Hasan](https://github.com/nurulla-hasan)**.
All rights reserved © 2026 **Mouza Map Pro**.

