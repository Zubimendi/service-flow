# ServiceFlow

Multi-tenant booking & CRM platform for local service businesses (salons, gyms, tutors, repair shops, consultants).

## Tech Stack

- **Next.js 14** (App Router) + TypeScript (strict)
- **Tailwind CSS** + shadcn/ui design system
- **Prisma** + PostgreSQL with Row-Level Security (RLS)
- **NextAuth.js** — roles: `PLATFORM_ADMIN`, `TENANT_OWNER`, `STAFF`, `CUSTOMER`
- **Stripe Connect** (tenant payouts) + **Stripe Billing** (SaaS subscriptions)
- **Resend** (transactional emails)
- **TanStack Query** (server state) + **Zustand** (UI state)

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (with `btree_gist` extension support)

## Setup

### 1. Clone and install

```bash
cd service-flow
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (pooled for app) |
| `DIRECT_URL` | Direct PostgreSQL URL for migrations |
| `NEXTAUTH_SECRET` | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3000` for local dev |
| `STRIPE_SECRET_KEY` | Stripe test secret key (`sk_test_...`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe test publishable key |
| `STRIPE_WEBHOOK_SECRET` | From Stripe CLI or dashboard |
| `STRIPE_PRICE_STARTER` | Stripe Price ID for Starter plan |
| `STRIPE_PRICE_PRO` | Stripe Price ID for Pro plan |
| `RESEND_API_KEY` | Resend API key |
| `EMAIL_FROM` | Sender email address |
| `CRON_SECRET` | Secret to protect `/api/cron/*` routes |

### 3. Start PostgreSQL

**Option A — Docker (recommended):**
```bash
docker compose up -d
# If permission denied, run: sudo usermod -aG docker $USER && re-login
```

**Option B — Local PostgreSQL:**
Install Postgres 14+ and create a database:
```sql
CREATE DATABASE serviceflow;
```

Update `DATABASE_URL` and `DIRECT_URL` in `.env.local` with your credentials.

### 4. Database setup

```bash
# Verify database connection
curl http://localhost:3000/api/health

# Run migrations (includes RLS policies + double-booking constraint)
npm run db:migrate

# Seed demo data
npm run db:seed
```

> **Login won't work until the database is running and seeded.** Use demo credentials after seeding:
> `owner@glow-salon.com` / `password123`

### 5. Start development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Accounts

After seeding:

| Role | Email | Password |
|---|---|---|
| Platform Admin | admin@serviceflow.app | password123 |
| Glow Salon Owner | owner@glow-salon.com | password123 |
| Fit Studio Owner | owner@fit-studio.com | password123 |

## Multi-Tenant Routing (Local)

### Option A: Path-based (recommended for localhost)

```
http://localhost:3000/t/glow-salon          → Public booking page
http://localhost:3000/t/glow-salon/book     → Booking flow
http://localhost:3000/t/glow-salon/dashboard → Tenant dashboard
http://localhost:3000/t/fit-studio          → Second demo tenant
```

### Option B: Subdomain simulation

Add to `/etc/hosts`:

```
127.0.0.1 glow-salon.localhost
127.0.0.1 fit-studio.localhost
```

Then visit:

```
http://glow-salon.localhost:3000            → Public booking (subdomain rewrite)
http://glow-salon.localhost:3000/dashboard  → Dashboard
```

## Key Routes

| Route | Description |
|---|---|
| `/` | Marketing landing page |
| `/signup` | Tenant registration |
| `/login` | Authentication |
| `/t/[slug]` | Public booking page |
| `/t/[slug]/book` | Multi-step booking flow |
| `/t/[slug]/dashboard` | Tenant dashboard (Today view) |
| `/admin` | Platform admin panel |

## Row-Level Security

RLS policies are in `prisma/migrations/20240612000001_rls/migration.sql`.

Every tenant-scoped query runs through `withTenantContext()` which sets:

```sql
SELECT set_config('app.current_tenant_id', '<tenant-uuid>', true);
```

Platform admin queries use `withBypassRls()` which sets `app.bypass_rls = true`.

## Stripe Webhooks (Local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`.

## Reminder Cron

Vercel Cron runs `/api/cron/reminders` hourly (see `vercel.json`).

Test locally:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" http://localhost:3000/api/cron/reminders
```

## Project Structure

```
src/
├── app/              # Next.js App Router (route groups)
├── components/ui/    # Shared design system primitives
├── features/         # Feature modules (booking, scheduling, clients, etc.)
├── hooks/            # React Query hooks
├── lib/              # API client, auth, db, stripe, validations
├── stores/           # Zustand UI state
└── types/            # Domain types
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Seed demo data |
| `npm run db:setup` | Migrate + seed |
