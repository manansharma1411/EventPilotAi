# EventPilot AI

> **Plan smarter. Celebrate better.**

EventPilot AI is a production-minded GenAI event planning application engineered for **Prompt Wars Challenge 5 — Celebration & Event Planner**. It guides users through crafting unforgettable celebrations with structured Gemini AI workflows, deterministic financial calculations, and persistent Supabase PostgreSQL storage.

---

## Architecture & Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | High-performance React framework with server components and edge-ready API routes |
| **Language** | TypeScript (Strict Mode) | End-to-end type safety across domain models and API contracts |
| **Styling** | Tailwind CSS | Modern, utility-first responsive interface |
| **Icons** | Lucide React | Clean, consistent UI iconography |
| **Persistence** | Supabase (PostgreSQL) | Production relational storage with Row Level Security |
| **AI Engine** | Google Gemini API | Structured event architecture, run-of-show itineraries, and smart suggestions |
| **Hosting & CI/CD** | Vercel & GitHub | Continuous deployment pipeline with automated previews |

---

## Phased Build Roadmap

- **Phase 1: Deploy Before Building (Current)**:
  - Base project scaffolding with Next.js App Router, Tailwind CSS, TypeScript strict mode.
  - Responsive landing page with tagline and branding.
  - Production-ready `GET /api/health` endpoint.
  - GitHub repository setup & Vercel deployment pipeline.
- **Phase 2: Database Architecture & Auth**:
  - Supabase PostgreSQL schema (events, budgets, guest lists, timeline items).
  - Row Level Security (RLS) policies and database migrations.
  - Safe client wrappers with type generation.
- **Phase 3: Gemini AI Event Architect**:
  - Structured prompt engineering with Zod validation.
  - Deterministic calculations for budgets and timelines.
  - Real-time generation of custom celebration itineraries.
- **Phase 4: Dashboard, Analytics & Polish**:
  - Recharts budget allocation breakdown and spend tracking.
  - Interactive RSVP manager and run-of-show editor.
  - End-to-end user workflows and full mobile optimization.

---

## Getting Started Locally

### Prerequisites
- Node.js `v18.18+` or `v20+` (verified on `v24.14.1`)
- npm `v10+` (verified on `v11.11.0`)
- Git

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/<your-username>/EventPilotAI.git
   cd EventPilotAI
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   *(Values can remain blank for Phase 1 verification; they will be populated during Phases 2 & 3)*.

4. **Run the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Verify System Health**:
   Visit [http://localhost:3000/api/health](http://localhost:3000/api/health) to confirm the backend is responding with `status: "ok"`.

---

## Health Check Endpoint

EventPilot AI exposes a dedicated diagnostic endpoint at `/api/health`:

- **Route**: `GET /api/health`
- **Response Format**: `application/json`
- **Sample Payload**:
  ```json
  {
    "status": "ok",
    "app": "EventPilot AI",
    "tagline": "Plan smarter. Celebrate better.",
    "version": "0.1.0",
    "timestamp": "2026-10-22T00:45:00.000Z",
    "uptimeSeconds": 42,
    "environment": "production",
    "services": {
      "supabase": "pending_keys",
      "gemini": "pending_keys"
    }
  }
  ```

---

## Verification & Quality Assurance

Run the following checks before committing any changes:

```bash
# Type check TypeScript codebase
npx tsc --noEmit

# Run ESLint
npm run lint

# Create production build
npm run build
```

---

## Deployment to Vercel

EventPilot AI is designed for seamless continuous deployment via Vercel:

1. Push your repository to GitHub.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), click **Add New** &rarr; **Project**.
3. Import your `EventPilotAI` GitHub repository.
4. Keep the default Next.js build settings (`npm run build`, output `.next`).
5. Click **Deploy**.
6. Every push to `main` automatically triggers a production deployment, while pull requests generate isolated preview deployments.

---

## Security Best Practices
- Never commit `.env.local` or any private credentials to GitHub.
- All database mutations enforce Row Level Security (RLS) in Supabase.
- AI inputs and outputs are sanitized and validated against explicit Zod schemas.
- Financial figures are computed deterministically using standard application arithmetic.
