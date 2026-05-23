# Sonexa — Premium Fetal Ultrasound Clinical Reporting Platform

<img width="2468" height="1936" alt="sonexa1" src="https://github.com/user-attachments/assets/c5991141-1709-44ff-9078-c7e112eb7fb4" />


## Project Overview

**What is Sonexa?**
Sonexa is a premium, full-stack medical reporting web application built specifically for fetal ultrasound specialists (particularly TIFFA — Targeted Imaging For Fetal Anomalies). It allows clinicians to securely log in, fill in detailed fetal scan data across structured tabs, apply reusable text snippet templates, preview a fully formatted multi-page clinical report, and export it to PDF — all from a sleek glassmorphic browser interface.

Think of it as a private, self-hosted digital reporting suite for sonographers — replacing paper forms and generic word processors with a structured, intelligent, print-ready report generator backed by a cloud database.

Users sign in with Email/Password, get access to their personal vault of patient reports, manage reusable anatomy snippets (templates), configure their profile, and generate print-ready 6-page clinical PDFs — all within a stunning violet–fuchsia–pink glassmorphic dark UI.

---

## How Does It Work?

### For Users (Clinicians / Sonographers)

1. **Open the App** — The user visits the Sonexa URL and is greeted by a cinematic animated login screen — a centered logo that morphs and slides to the top-left corner as the glassmorphic sign-in card fades in.
2. **Sign In** — The user signs in using Email/Password (with sign-up, email verification support, and password reset via Firebase).

<img width="2468" height="1936" alt="sonexa2" src="https://github.com/user-attachments/assets/a404ce43-3f63-4a9c-b2f8-81a16818fffe" />


3. **View the Dashboard** — After logging in, the user sees their personal report vault:
   * A grid of patient report cards, sorted by last updated date.
   * Each card shows patient name, ID, age, and visit date.
   * Quick actions: Edit, Delete, Print (PDF view), and Clone as Template.
4. **Create a Report** — The user clicks New Report and is taken to the multi-tab `ReportEditor`. The editor is divided into 5 structured tabs:
   * **Patient Info:** Name, ID, Age/Sex, Visit No, Referred By, Visit Date, LMP Date, LMP EDD.
   * **Fetus Survey:** Presentation, Placenta, Liquor, SDP, AFI, Umbilical Cord, Fetal Activity, Cardiac Activity, FHR, plus a Maternal/Cervix templated textarea.
   * **Biometry & Bones:** BPD, HC, AC, FL-Rt, EFW (with auto-calculated gestational age and percentile) and Long Bones, TCD, Aneuploidy Markers.
   * **Anatomy & Doppler:** Fetal Anatomy (Head, Neck, Spine, Face, etc.) each with snippet template selectors, plus Fetal Doppler.
   * **Impression & Doctor:** Impression sections, Aneuploidy Risk Assessment, Counselling Notes, Doctor details.
5. **Auto-Biometry Calculations** — The system uses clinical formulae (Hadlock, Mediscan) to automatically calculate gestational age (e.g., "28W 3D") and growth percentile for each biometry measurement whenever a value or date changes.

<img width="2880" height="2278" alt="sonexa3" src="https://github.com/user-attachments/assets/01d3876d-5303-4a56-a38c-e6925e7ac21e" />


6. **Snippet Templates** — For every anatomy text field, clinicians can select from their saved reusable snippets (e.g., "Normal Head View", "Normal Heart") or save the current content as a new snippet. 
7. **Upload Reference Images** — Doctors can upload reference ultrasound images alongside the report form for visual reference while typing.
8. **View & Print Report** — Clicking Print navigates to the `ReportView`, rendering a full, clinical-grade 6-page A4 report featuring graphs, anatomy breakdowns, doppler readings, and legal doctor signature blocks.
9. **Download as PDF** — Uses `dom-to-image` + `jsPDF` to render each A4 page as a JPEG image and bundle them into a multi-page PDF, saved as `Sonexa_Report_<PatientName>.pdf`.
10. **Profile Settings** — Users can update their display name, upload a profile photo (stored as a base64 data URL in Turso), change passwords, or securely delete their account and associated data.

---

## The Key Architecture Idea

Sonexa uses a **single Express server** that serves both the React SPA and all API routes, heavily optimized for Vercel deployment:

| Mode | Behaviour |
| :--- | :--- |
| **Development** | Vite middleware is injected into the Express server for Hot Module Reload (HMR). Run with `npm run dev` (`tsx server.ts`). |
| **Production** | Vite builds the frontend into `/dist`. Express serves the static files and handles all `/api/*` routes as a **Vercel Serverless Function**. |

* **Client-Side Compute:** The auto-biometry calculation engine runs entirely client-side using clinical Hadlock/Mediscan formulae — no server round-trips needed.
* **Stateless Storage:** Profile photos are stored as base64 data URLs directly in the Turso `users` table, avoiding the need for dedicated file storage services.

---

## Technologies Used

### Frontend (What You See)
| Technology | What It Does |
| :--- | :--- |
| **React 19** | The entire UI is a React Single-Page Application. |
| **TypeScript** | Strict typing across all components, types, and API calls. |
| **TailwindCSS v4** | Utility classes for rapid, consistent glassmorphic dark UI styling. |
| **Framer Motion** | Powers cinematic login animations and smooth page transitions. |
| **Lucide React** | The icon library used for all UI icons. |
| **React Router DOM v7** | Client-side routing between Dashboard, Editor, Print Views, and Profile. |

### Backend (Behind the Scenes)
| Technology | What It Does |
| :--- | :--- |
| **Express (Node.js)** | The web framework powering all API routes (CRUD operations). |
| **TypeScript (tsx)** | The backend is executed directly using `tsx` — no local compile step needed. |
| **Turso (libSQL)** | Globally distributed, edge-native SQLite database storing all users, reports, and templates. |
| **Vite Middleware** | In development, Vite is embedded directly inside the Express server for HMR. |

### Auth & PDF Generation
| Technology | What It Does |
| :--- | :--- |
| **Firebase Auth** | Manages all user authentication. The Firebase UID acts as the database primary key. |
| **dom-to-image & jsPDF** | Converts HTML DOM pages into high-res JPEGs, then assembles them into a downloadable multi-page A4 PDF. |

### Deployment (Vercel)
| Technology | What It Does |
| :--- | :--- |
| **Vercel** | Hosts both the static frontend (CDN) and the Express backend (Serverless Function via `@vercel/node`). |
| **esbuild** | Bundles `server.ts` → `dist/server.cjs` for highly optimized Vercel deployment. |

---

## API Endpoints

### User & Utility Management
| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/users/:userId` | `GET` | Fetch a user's profile (photo URL) |
| `/api/users/:userId` | `POST` | Create or update a user record (upsert photoURL) |
| `/api/users/:userId` | `DELETE` | Delete a user and cascade delete reports/templates |
| `/api/setup-db` | `GET` | Trigger database schema initialisation |

### Template Management
| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/users/:userId/templates` | `GET` | List all snippet templates for a given user |
| `/api/users/:userId/templates` | `POST` | Create or update a template (upsert by id) |
| `/api/users/:userId/templates/:id` | `DELETE` | Delete a specific template |

### Report Management
| Route | Method | Description |
| :--- | :--- | :--- |
| `/api/users/:userId/reports` | `GET` | List all reports for a given user |
| `/api/users/:userId/reports/:id` | `GET` | Fetch a single report's full data |
| `/api/users/:userId/reports` | `POST` | Create or update a report (upsert by id) |
| `/api/users/:userId/reports/:id` | `DELETE` | Delete a specific report |

---

## Architecture Diagram

```text
┌──────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                        │
│                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────┐  │
│  │   React SPA    │  │ Framer Motion  │  │ Lucide /   │  │
│  │  (App.tsx +    │  │  (Animations)  │  │ Tailwind   │  │
│  │  Pages)        │  │                │  │            │  │
│  └───────┬────────┘  └────────────────┘  └────────────┘  │
│          │  Firebase Auth (Email/Password)               │
│          │  HTTP fetch() to /api/*                       │
└──────────┼───────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────────────┐
│         VERCEL HOSTING (Global Edge Network)             │
│                                                          │
│  ┌──────────────────────┐   ┌──────────────────────────┐ │
│  │  Static Frontend     │   │  Serverless Function     │ │
│  │  (Vite-built React)  │   │  (Express — server.ts)   │ │
│  │  Served from CDN     │   │  Handles all /api/* reqs │ │
│  └──────────────────────┘   └──────────┬───────────────┘ │
│                                        │                 │
└────────────────────────────────────────┼─────────────────┘
                                         │
                    ┌────────────────────┼─────────────────┐
                    │                    │                 │
                    ▼                    ▼                 │
          ┌──────────────┐    ┌──────────────────┐         │
          │  Turso DB    │    │  Firebase Auth   │         │
          │  (libSQL)    │    │  (Identity &     │         │
          │  users       │    │   Email Verify)  │         │
          │  reports     │    └──────────────────┘         │
          │  templates   │                                 │
          └──────────────┘                                 │
```

---

## Database Schema

### `users`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | Firebase UID |
| `photoURL` | TEXT | Profile photo stored as base64 data URL |

### `reports`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID (generated client-side via crypto) |
| `userId` | TEXT | FK → users.id (Firebase UID) |
| `createdAt` | INTEGER | Unix timestamp (ms) of creation |
| `updatedAt` | INTEGER | Unix timestamp (ms) of last update |
| `patientName` | TEXT | Patient's full name |
| `patientId` | TEXT | Hospital/clinic patient ID |
| `details` | TEXT | Full JSON blob of all form fields |
| *(+ metadata fields)*| *TEXT* | *age, gender, visitDate, lmpDate, etc.* |

### `templates`
| Column | Type | Description |
| :--- | :--- | :--- |
| `id` | TEXT (PK) | UUID |
| `userId` | TEXT | FK → users.id |
| `category` | TEXT | Anatomy category key (e.g., `headText`) |
| `name` | TEXT | Short display name |
| `content` | TEXT | Full text content of the snippet |

---

## Biometry Auto-Calculation Engine

Gestational age and growth percentiles are calculated entirely client-side using established clinical formulae:

| Measurement | Gestational Age Formula |
| :--- | :--- |
| **BPD** | $9.54 + 1.482 \times (mm/10) + 0.1676 \times (mm/10)^2 \text{ weeks}$ |
| **HC** | $8.96 + 0.54 \times (mm/10) + 0.0003 \times (mm/10)^3 \text{ weeks}$ |
| **AC** | $8.14 + 0.753 \times (mm/10) + 0.0036 \times (mm/10)^2 \text{ weeks}$ |
| **FL** | $10.35 + 2.46 \times (mm/10) + 0.17 \times (mm/10)^2 \text{ weeks}$ |
| **Tibia** | $0.598 \times mm \text{ weeks}$ |
| **Fibula / Ulna**| $0.588 \times mm \text{ weeks}$ |
| **Humerus** | $0.576 \times mm \text{ weeks}$ |
| **Radius** | $0.669 \times mm \text{ weeks}$ |
| **EFW** | $2.1 \times \sqrt[3]{grams} + 6.0 \text{ weeks}$ |

**Percentile Calculation:**
* SD is estimated as ~8% of the agreed gestational age from LMP.
* Z-score: $Z = \frac{\text{measured weeks} - \text{agreed weeks}}{SD}$
* Percentile ($p$): $p = \text{round}\left(\frac{1}{1 + e^{-1.702 \times Z}} \times 100\right)$ (clamped to [1, 99]).

---

## Snippet Template Categories
The `TemplateManager` and `ReportEditor` support 15 pre-defined anatomy/impression categories:

| Category Key | Label | | Category Key | Label |
| :--- | :--- | :--- | :--- | :--- |
| `headText` | Head Anatomy | | `extremitiesText` | Extremities Anatomy |
| `neckText` | Neck Anatomy | | `impressionHeading` | Impression Heading |
| `spineText`| Spine Anatomy | | `impressionBody` | Impression Body |
| `faceText` | Face Anatomy | | `impressionEcho` | Impression Echo |
| `thoraxText`| Thorax Anatomy | | `aneuploidyRisk` | Aneuploidy Risk Assessment|
| `heartText`| Heart Anatomy | | `counsellingNotes`| Counselling Notes |
| `abdomenText`| Abdomen Anatomy | | `cervix` | Maternal/Cervix |
| `kubText` | KUB Anatomy | | | |

---

## Project File Structure

```text
Sonexa/
│
├── server.ts                    ← Express backend — all API routes
├── index.html                   ← Root HTML entry point for Vite
├── vite.config.ts               ← Vite bundler configuration
├── vercel.json                  ← Vercel routing — /api/* → server.ts
├── package.json                 ← Dependencies and scripts
├── .env                         ← Secret keys (never committed to Git)
│
├── src/
│   ├── main.tsx                 ← React app entry point
│   ├── App.tsx                  ← Root component — routing, auth guards
│   ├── index.css                ← Minimal global CSS (Tailwind base)
│   │
│   ├── components/
│   │   └── AuthProvider.tsx     ← Firebase auth state context
│   │
│   ├── pages/
│   │   ├── Login.tsx            ← Animated sign-in / sign-up page
│   │   ├── Dashboard.tsx        ← Report grid and vault management
│   │   ├── ReportEditor.tsx     ← Multi-tab report form (biometry, snippets)
│   │   ├── ReportView.tsx       ← 6-page A4 clinical report renderer & PDF
│   │   ├── TemplateManager.tsx  ← Manage reusable snippet templates
│   │   └── Profile.tsx          ← Account settings
│   │
│   └── lib/
│       ├── firebase.ts          ← Firebase app initialisation
│       ├── db.ts                ← API fetch functions & typings
│       └── utils.ts             ← Utility helpers
│
└── public/                      ← Static assets served as-is
```

---

## Environment Variables Required
Create a `.env` file in the root of your project:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-auth-token

# Firebase (Authentication)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-app.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Gemini AI (Optional - for future AI-assist features)
GEMINI_API_KEY=your-gemini-api-key

# App URL
APP_URL=[https://your-app.run.app](https://your-app.run.app)
```

---

## Summary
Sonexa is a production-grade, full-stack fetal ultrasound clinical reporting platform built by Spirit Services. Clinicians log in via Firebase Auth, create and manage detailed patient scan reports backed by Turso's edge database, apply reusable anatomy snippet templates, auto-compute biometry gestational ages and percentiles using clinical Hadlock/Mediscan formulae, and export pixel-perfect 6-page A4 clinical reports as PDFs — all wrapped in a premium glassmorphic violet/fuchsia dark UI with a cinematic animated login sequence. 

The entire stack — **React 19, TailwindCSS v4, Framer Motion, Express, Turso, Firebase** — is deployed globally on **Vercel** with zero infrastructure to manage.

## 📄 License
© 2026 Sonexa. All rights reserved.
