# RuralConnect

A full-stack medical platform connecting patients and doctors in rural areas, featuring AI-powered disease prediction, real-time disease outbreak mapping, and secure medical record management.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Vanilla CSS with modern glassmorphism (Dark Theme)
- **Map**: Leaflet.js with `leaflet-heat`
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Storage)
- **Backend (AI)**: FastAPI (Python)
- **Machine Learning**: Scikit-Learn (Random Forest)

## Features

- **Role-Based Access**: Specialized dashboards for Patients and Doctors.
- **AI Disease Prediction**: Doctors can select from 131 symptoms to predict 41 distinct diseases with a confidence score.
- **Real-Time Heatmap**: View disease outbreak reports across India. Live updates via Supabase Realtime.
- **Medical Records**: Securely upload and manage PDFs/images using Supabase Storage.
- **Strict Privacy**: Patients cannot see AI predictions; data is restricted via PostgreSQL Row-Level Security (RLS).

## Setup Instructions

### 1. Supabase Setup

1. Create a new project on [Supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the entire contents of `supabase/migrations/001_init.sql`. This will:
   - Create all tables (`profiles`, `medical_records`, `visits`, `predictions`, `disease_reports`).
   - Enable Row Level Security (RLS) on all tables.
   - Setup RLS policies for doctors and patients.
   - Insert seed data for the disease heatmap.
3. Go to **Storage**, create a new bucket named `medical-records` (public).
4. Go to **Project Settings -> API** and copy your `Project URL` and `anon public key`.

### 2. Frontend Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_FASTAPI_URL=http://localhost:8000
   ```
3. Install dependencies and start the Vite dev server:
   ```bash
   npm install
   npm run dev
   ```

### 3. FastAPI Backend Setup (Existing)

The ML API server expects the frontend to communicate with it on `localhost:8000`.

1. Ensure you have Python installed.
2. Navigate to your FastAPI backend directory.
3. Start the server (usually via Uvicorn):
   ```bash
   uvicorn main:app --reload --port 8000
   ```
4. *Note: Ensure your backend uses CORSMiddleware allowing requests from `localhost:3000` (or `localhost:5173`).*

---

## Folder Structure

```
rural-connect/
├── supabase/
│   └── migrations/
│       └── 001_init.sql       # Database schema & RLS policies
├── src/
│   ├── components/            # Shared UI (Sidebar, Heatmap, Modal, FileUploader)
│   ├── context/               # AuthContext (Supabase Auth state)
│   ├── hooks/                 # React Query hooks for fetching data
│   ├── lib/                   # Supabase & API API clients
│   ├── pages/
│   │   ├── auth/              # Login, Register
│   │   ├── doctor/            # Doctor Dashboard, Patients, Predict, Heatmap
│   │   └── patient/           # Patient Dashboard, Records, Profile, Map
│   ├── types/                 # TypeScript interfaces for DB and API
│   ├── App.tsx                # React Router & Protected Routes
│   ├── main.tsx               # Entry point
│   └── index.css              # Global styles & Leaflet overrides
├── index.html
├── vite.config.ts
└── package.json
```