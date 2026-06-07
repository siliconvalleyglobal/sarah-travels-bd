# Travel OTA Platform

Bangladesh-focused Online Travel Agency — Phase 1 MVP.

## Phase 1 Features

- **Flight Booking** — Search, book, pay, PNR/e-ticket (customer + agent)
- **Hotel Booking** — Search, book, pay, confirmation (DB-backed)
- **Visa Services** — Country info, apply, pay, status tracking
- **Umrah Packages** — Package catalog, book, installment down-payment
- **Agent Portal** — B2B booking, credit wallet, commissions
- **Payments** — bKash, Nagad, Rocket, SSLCommerz
- **Admin Accounting** — Ledger, P&L, supplier management

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS |
| Backend | NestJS 11, TypeScript |
| Database | PostgreSQL, Prisma |
| Cache | Redis |
| Monorepo | pnpm + Turborepo |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- Docker (for PostgreSQL & Redis)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start local database (no Docker required)
pnpm db:dev

# Sync schema & seed demo data
pnpm db:push
pnpm db:seed

# Start development servers
pnpm dev
```

Or run everything in one step after copying `.env`:

```bash
pnpm setup && pnpm dev
```

> **Note:** If Docker is installed, you can alternatively use `pnpm docker:up` and set `DATABASE_URL` to `postgresql://travel:travel@localhost:5432/travel?schema=public`.

### URLs

| Service | URL |
|---------|-----|
| Web (Customer) | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| API Health | http://localhost:4000/api/v1/health |
| Prisma Studio | `pnpm db:studio` |

### Demo Accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@travel.com | password123 |
| Agent | agent@travel.com | password123 |
| Customer | customer@travel.com | password123 |

## Project Structure

```
travel/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   └── database/     # Prisma schema & client
├── docker-compose.yml
└── turbo.json
```

## API Modules

| Module | Endpoints | Auth |
|--------|-----------|------|
| Auth | `/auth/register`, `/auth/login` | Public |
| Flights | `/flights/search`, `/flights/book` | Mixed |
| Visa | `/visa/countries`, `/visa/applications` | Mixed |
| Umrah | `/umrah/packages`, `/umrah/bookings` | Mixed |
| Agents | `/agents/dashboard`, `/agents/profile` | Agent |
| Bookings | `/bookings`, `/bookings/:ref` | JWT |
| Payments | `/payments/methods`, `/payments/initiate` | Mixed |
| Accounting | `/accounting/ledger`, `/accounting/profit-loss` | Admin |

## Environment Variables

See `.env.example` for all required variables. Key ones:

- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Auth token signing key
- `AMADEUS_CLIENT_ID/SECRET` — Flight API (optional for dev, uses mock data)
- `SSLCOMMERZ_*`, `BKASH_*`, `NAGAD_*` — Payment gateways

## Development Phases

- **Phase 1** (current): Flights, Visa, Umrah, Agent Portal, BD Payments, Admin Accounting
- **Phase 2**: Hotels, Tours, Wallet, Mobile App
- **Phase 3**: AI Assistant, Dynamic Packaging, Loyalty, White-label B2B
