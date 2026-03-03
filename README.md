# elyzor-web

Web dashboard for [Elyzor](../elyzor) — manage API keys and service identities through a clean UI.

> **Backend:** [elyzor](../elyzor) — Node.js + Express + MongoDB + Redis

## Requirements

- Node.js 18+
- Running [elyzor](../elyzor) backend (default: `localhost:3000`)

## Setup

```bash
npm install
cp .env.example .env
```

The default `.env` works out of the box if the backend runs on port 3000:

```env
VITE_API_URL=/v1
```

## Development

```bash
# Start the backend first
cd ../elyzor && docker compose up -d && npm run dev

# Then start the frontend
cd ../elyzor-web && npm run dev
```

Open `http://localhost:5174`.

> No CORS issues — Vite proxies all `/v1/*` requests to `localhost:3000` automatically.

## Build

```bash
npm run build    # TypeScript check + production build → dist/
npm run preview  # Preview the production build locally
```

## Project Structure

```
src/
├── api/                 # Axios client and endpoint functions
│   ├── client.ts        # Axios instance, JWT interceptor, _id→id normalization
│   ├── auth.ts          # register / login / logout / me
│   ├── projects.ts      # projects CRUD
│   └── keys.ts          # API keys, services, stats
├── components/
│   ├── layout/          # AppLayout, Sidebar, ProtectedRoute, ProjectDetailLayout
│   └── ui/              # Button, Input, Label, Card, Badge, Dialog, Separator
├── pages/
│   ├── auth/            # LoginPage, RegisterPage
│   ├── dashboard/       # DashboardPage (usage stats)
│   ├── projects/        # ProjectsPage, ProjectDetailLayout
│   └── keys/            # KeysPage (sk_live_), ServicesPage (svc_live_)
├── store/
│   └── auth.ts          # Zustand auth store (persisted to localStorage)
└── types/
    └── index.ts         # All TypeScript types
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + Radix UI |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| HTTP | Axios |
| Global state | Zustand |

## Screens

| Route | Screen |
|---|---|
| `/login` | Sign in |
| `/register` | Create account |
| `/dashboard` | Usage statistics (1d / 7d / 30d) |
| `/projects` | Project list |
| `/projects/:id/keys` | API key management |
| `/projects/:id/services` | Service key management |

## Auth Flow

- **Access token** (15 min) — stored in `localStorage`, injected into every request as `Authorization: Bearer`
- **Refresh token** (7 days) — HTTP-only cookie set by the backend
- On 401, Axios interceptor automatically refreshes the token and retries the failed request
- If refresh fails, the user is redirected to `/login`
