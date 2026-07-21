# Mouza Map Pro

Mouza Map Pro is a Bangla-first land surveying platform built for surveyors, landowners, and administrators in Bangladesh. It combines a simple surveyor discovery workflow with practical land calculation and digital mapping tools.

The product intentionally avoids a complicated marketplace workflow. Users find a suitable surveyor, review the surveyor's services and starting prices, and contact them directly through WhatsApp.

## Current Product Scope

### For visitors and landowners

- Find surveyors by profile, service, and service area
- View surveyor experience, verification details, and service-wise starting prices
- Read administrator-approved ratings and reviews
- Contact a surveyor directly through WhatsApp
- Use free land calculation utilities

### For surveyors

- Create and maintain a professional public profile
- Add personal and professional information
- Select service areas
- Configure offered services and a separate starting price for each service
- Add a WhatsApp contact number
- Manage calculation history
- Use advanced mapping tools according to the active subscription plan

### For administrators

- Manage users, subscribers, plans, payments, and device access
- Review surveyor verification requests
- Approve, reject, and moderate user reviews
- Manage service categories
- View calculations
- Publish system broadcasts
- Manage administrator accounts

## Simplified Service Workflow

1. A user searches for a surveyor.
2. The user checks the surveyor's profile, services, prices, and approved reviews.
3. The user contacts the surveyor directly through WhatsApp.
4. The surveyor and client discuss the work outside the platform.

The following marketplace features are intentionally not part of the current product:

- In-app chat or messaging
- Quotation or bidding
- Job posting and service-request management
- Complex order negotiation inside the application

This keeps the system easier to operate, easier for administrators to manage, and more understandable for its target users.

## Surveying and Mapping Tools

| Tool | Purpose | Access |
| --- | --- | --- |
| Unit Converter | Convert common land measurement units | Free |
| Inheritance Calculator | Assist with inheritance-related land calculations | Free |
| Land Measurement | Measure land directly from a mouza map on desktop or mobile | Pro |
| Pantagraph | Align and compare C.S. and B.S. mouza maps | Pro |
| Tracer | Draw, label, snap, edit, and export plot boundaries | Pro |
| Mouza Map Studio | Align maps, crop the combined result, clean it up, add text/marks, and prepare sheets | Pro |
| Mouza Geo Studio | Georeference a mouza-map PDF against a world map and export it as KMZ | Pro |

Advanced tools are grouped into subscription plans. The plan configuration in the application is the source of truth for current tool availability and pricing.

## Technology Stack

- [Next.js 16](https://nextjs.org/) with the App Router
- React 19 and TypeScript
- Tailwind CSS 4 and shadcn/Base UI components
- React Hook Form and Zod
- Zustand for client-side state
- Konva and React Konva for interactive canvas work
- Leaflet and OpenStreetMap-based mapping
- PDF.js and pdf-lib for PDF processing
- jsPDF and html2canvas for document export
- fflate for KMZ archive generation

## Getting Started

### Requirements

- Node.js 20 or newer
- npm
- Access to the Mouza Map Pro backend when testing API-connected features

### Installation

```bash
git clone https://github.com/nurulla-hasan/mmp_frontend.git
cd mmp_frontend
npm install
```

Configure the required environment variables for your local backend and deployment environment, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run lint` runs ESLint.

## Main Application Areas

- Public landing, pricing, tools, and surveyor discovery
- User dashboard and calculation history
- Surveyor dashboard and professional profile management
- Administrator dashboard and moderation workflows
- Free calculation tools
- Advanced canvas, PDF, georeferencing, and export tools

## Development Direction

The current priority is a stable and understandable surveying workflow, especially on mobile and lower-powered devices. New features should support that goal without reintroducing unnecessary operational complexity.

Potential future improvements include more backend integration, expanded moderation controls, improved map processing, and optional vector conversion for aligned mouza maps.

## Project Status

Mouza Map Pro is under active development. Some screens may still use development data while frontend and backend integration continues.
