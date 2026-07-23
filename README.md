# Mouza Map Pro

A Bangla-first land-surveying platform that combines surveyor discovery, land calculations, interactive map tools, PDF workflows, and geospatial export for users in Bangladesh.

[Live Product](https://mouzamappro.com/) · [Developer Portfolio](https://nurulla-hasan-portfolio-pink.vercel.app/)

> **Status:** Version 2 is under active development. This repository contains the Next.js frontend.

## Overview

Mouza Map Pro translates practical land-surveying workflows into responsive digital tools. Landowners can find and contact surveyors, while surveyors can manage professional profiles and use calculation, canvas, PDF, alignment, tracing, and export tools.

The product uses a deliberately simple service flow: users review a surveyor’s profile, services, starting prices, and approved reviews, then contact the surveyor directly through WhatsApp.

## Product Areas

### Visitors and landowners

- Find surveyors by profile, service, and service area
- Review experience, verification information, services, and starting prices
- Read administrator-approved ratings and reviews
- Contact surveyors directly through WhatsApp
- Use free land-calculation utilities

### Surveyors

- Create and maintain a professional public profile
- Configure service areas, offered services, and service-specific starting prices
- Manage calculation history
- Use advanced mapping tools based on the active subscription plan

### Administrators

- Manage users, subscribers, plans, payments, and device access
- Review surveyor verification requests
- Approve, reject, and moderate reviews
- Manage service categories, broadcasts, calculations, and administrator accounts

## Surveying and Mapping Tools

| Tool | Purpose | Access |
| --- | --- | --- |
| Unit Converter | Convert common land-measurement units | Free |
| Inheritance Calculator | Assist with inheritance-related land calculations | Free |
| Land Measurement | Measure plots directly from a mouza map on desktop or mobile | Pro |
| Pantagraph | Align and compare C.S. and B.S. mouza maps | Pro |
| Tracer | Draw, label, snap, edit, and export plot boundaries | Pro |
| Mouza Map Studio | Align maps, crop a combined result, clean it, annotate it, and prepare sheets | Pro |
| Mouza Geo Studio | Georeference a mouza-map PDF against a world map and export it as KMZ | Pro |

The application’s plan configuration is the source of truth for current tool availability and pricing.

## Engineering Highlights

- Built mobile-first canvas and PDF interactions with mouse, touch, and anchored pinch controls
- Moved image cleanup and processing to Web Workers to keep heavy work off the main UI thread
- Added low-memory previews and tiled, streaming KMZ generation for large map exports
- Implemented snapping, path editing, undo/redo, composite cropping, opacity control, and configurable annotations
- Uses a persistent map canvas and OpenStreetMap-based basemaps for georeferencing workflows
- Provides a typed server-only API client with configurable authentication, validated request bodies, and structured API errors
- Localized the product experience for Bangla-speaking users

## Simplified Service Workflow

1. A user searches for a surveyor.
2. The user reviews the surveyor’s services, prices, verification information, and approved reviews.
3. The user contacts the surveyor through WhatsApp.
4. The surveyor and client discuss the work outside the platform.

The current product intentionally excludes in-app bidding, quotation negotiation, job posting, and service-order management. This keeps the workflow understandable for users and easier to operate.

## Tech Stack

| Area | Technologies |
| --- | --- |
| Core | Next.js 16, React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/Base UI, Framer Motion |
| Forms and state | React Hook Form, Zod, Zustand, TanStack Table |
| Canvas | Konva, React Konva |
| Maps | Leaflet, OpenStreetMap |
| PDF and export | PDF.js, pdf-lib, jsPDF, html2canvas |
| Geospatial archive | fflate |

## Main Application Areas

- Public landing, pricing, tools, and surveyor discovery
- User dashboard and calculation history
- Surveyor dashboard and professional-profile management
- Administrator dashboard and moderation workflows
- Free land-calculation tools
- Advanced canvas, PDF, georeferencing, and export tools

## Getting Started

### Prerequisites

- Node.js 20 or newer
- npm
- Access to the Mouza Map Pro backend for API-connected features

### Installation

```bash
git clone https://github.com/nurulla-hasan/mmp_frontend.git
cd mmp_frontend
npm install
```

Configure the required API environment variables for your local setup, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |

## Project Direction

The current focus is a stable, understandable surveying workflow—especially on mobile and lower-powered devices—while frontend and backend integration continues.

## Author

Developed by [Nurulla Hasan](https://github.com/nurulla-hasan).
