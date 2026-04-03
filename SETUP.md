# Setup Guide — Keys, Credentials & First Run

Everything you need to get the platform running locally and in production.

---

## 1. Supabase (Database + Auth + Storage)

**Sign up / log in:** https://supabase.com

### 1.1 Create a Project
1. Click **New Project**
2. Choose your organization, set a project name (e.g. `ecommerce-dev`), and pick a region closest to your users
3. Set a strong **Database Password** — save it, you'll need it for the connection strings
4. Wait ~2 minutes for provisioning

### 1.2 Collect Your Keys
Go to **Settings → API**:

| Key | Where | Used In |
|---|---|---|
| `SUPABASE_URL` | Settings → API → Project URL | Backend + Frontend |
| `SUPABASE_ANON_KEY` | Settings → API → Project API keys → `anon public` | Frontend only |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → Project API keys → `service_role` | Backend ONLY — never expose |
| `SUPABASE_JWT_SECRET` | Settings → API → JWT Settings → JWT Secret | Backend (token verification) |

### 1.3 Database Connection Strings
Go to **Settings → Database → Connection string**:

- **Transaction Pooler (for runtime):** click `Transaction` tab → copy URI  
  Use as `DATABASE_URL` in backend `.env`  
  Append `?pgbouncer=true&connection_limit=1` to the URL

- **Direct Connection (for migrations):** click `URI` tab → copy  
  Use as `DIRECT_URL` in backend `.env`

### 1.4 Configure Auth
Go to **Authentication → Settings**:

- **Site URL:** `http://localhost:3000` (dev) / `https://yourdomain.com` (prod)
- **Redirect URLs:** Add `http://localhost:3000/**` and your production URL
- **Email confirmations:** Enable (recommended)
- **SMTP:** Either use Supabase's built-in (free tier: 3 emails/hr) or add your own under **Authentication → Settings → SMTP Settings**

### 1.5 Configure OAuth (Optional)
Go to **Authentication → Providers**:

- **Google:** Enable, add Client ID + Secret from [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials
- **Facebook:** Enable, add App ID + Secret from [Meta for Developers](https://developers.facebook.com)

### 1.6 Create Storage Buckets
Go to **Storage → New bucket**:

| Bucket Name | Public? | Purpose |
|---|---|---|
| `product-images` | ✅ Yes | Product photos, served via CDN |
| `secure-downloads` | ❌ No | Downloadable product files (signed URLs only) |
| `media` | ❌ No | Admin-uploaded media library |

For `product-images`, after creating: click the bucket → **Policies** → Add a policy to allow authenticated uploads via service role.

---

## 2. Upstash Redis (Cache + Rate Limiting + Queue)

**Sign up / log in:** https://console.upstash.com

1. Click **Create Database**
2. Name it `ecommerce-cache`, choose the same region as your Supabase project
3. Select **Regional** (not Global) for lowest latency
4. After creation, go to the database → **REST API** tab

Collect:

| Key | Where |
|---|---|
| `UPSTASH_REDIS_REST_URL` | REST API → UPSTASH_REDIS_REST_URL |
| `UPSTASH_REDIS_REST_TOKEN` | REST API → UPSTASH_REDIS_REST_TOKEN |

---

## 3. Stripe (Payments)

**Sign up / log in:** https://dashboard.stripe.com

### 3.1 API Keys
Go to **Developers → API keys**:

| Key | Where | Notes |
|---|---|---|
| `STRIPE_SECRET_KEY` | Secret key | Start with `sk_test_` in development |

> Use `sk_test_` keys for development — no real charges. Switch to `sk_live_` in production.

### 3.2 Webhook Secret
Go to **Developers → Webhooks → Add endpoint**:

- **Endpoint URL:** `https://yourapi.com/api/v1/payments/webhook`
- **Events to listen for:**
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `checkout.session.completed`
  - `customer.subscription.deleted` (if you add subscriptions later)

After creating, reveal the **Signing secret** → use as `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)

**For local testing:** Install [Stripe CLI](https://stripe.com/docs/stripe-cli) and run:
```bash
stripe listen --forward-to localhost:4000/api/v1/payments/webhook
```
This gives you a local `whsec_` for development.

---

## 4. Email / SMTP

Choose one:

### Option A: Supabase Built-in SMTP (Development only)
- Free tier: 3 emails/hour — fine for testing
- No configuration needed, Supabase handles it for auth emails
- For transactional emails from Express (order confirmations etc.), you still need an SMTP provider

### Option B: SendGrid (Recommended for production)
1. Sign up at https://sendgrid.com (free tier: 100 emails/day)
2. Go to **Settings → API Keys → Create API Key** (Full Access)
3. Set in `.env`:
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=SG.xxxxxxxxxxxx   ← your API key
   ```

### Option C: Brevo (formerly Sendinblue) — free 300/day
1. Sign up at https://brevo.com
2. Go to **SMTP & API → SMTP tab**
3. Use the provided SMTP credentials

### Option D: Your own SMTP server
Just fill in `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` with your provider's details.

---

## 5. Sentry (Error Monitoring — Optional but Recommended)

**Sign up:** https://sentry.io

1. Create a new project: **Create Project → Node.js** (for backend) and **Next.js** (for frontend)
2. Copy the **DSN** from each project's settings
3. Set `SENTRY_DSN` in both backend and frontend `.env` files

---

## 6. Fill in Your .env Files

### Backend (`admin/backend/.env`)
Copy `.env.example` → `.env` and fill in:

```bash
cp admin/backend/.env.example admin/backend/.env
```

Minimum required to start:
```env
NODE_ENV=development
PORT=4000
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret
DATABASE_URL=postgresql://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:password@db.xxxx.supabase.co:5432/postgres
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=SG.xxxx
EMAIL_FROM="My Store <noreply@mystore.com>"
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=debug
```

### Frontend (`admin/frontend/.env.local`)
```bash
cp admin/frontend/.env.example admin/frontend/.env.local
```

Fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXTAUTH_SECRET=any-random-32-char-string
NEXTAUTH_URL=http://localhost:3000
```

---

## 7. First Run — Local Development

### Prerequisites
- Node.js 20+
- npm 10+
- Supabase CLI: `npm install -g supabase`

### Step 1: Start local Supabase
```bash
cd admin/backend
supabase init          # first time only
supabase start         # starts local postgres + auth + storage at localhost:54321
```

After `supabase start`, it prints local keys. Update your `.env`:
```
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<printed anon key>
SUPABASE_SERVICE_ROLE_KEY=<printed service role key>
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres:postgres@localhost:54322/postgres
SUPABASE_JWT_SECRET=super-secret-jwt-token-with-at-least-32-characters-long
```

### Step 2: Install dependencies & run migrations
```bash
# Backend
cd admin/backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed          # seeds default settings + shipping zone

# Frontend
cd ../frontend
npm install
```

### Step 3: Start both servers
```bash
# Terminal 1 — Backend
cd admin/backend
npm run dev
# → API running at http://localhost:4000/api/v1

# Terminal 2 — Frontend
cd admin/frontend
npm run dev
# → Admin panel at http://localhost:3000
```

### Step 4: Verify everything works
```bash
curl http://localhost:4000/api/v1/health
# Expected: {"status":"ok","db":"ok","redis":"ok","storage":"ok"}
```

Open http://localhost:3000 — you should see the login page.

---

## 8. Running Tests

```bash
# Backend tests
cd admin/backend
npm test                 # run all tests
npm run test:coverage    # with coverage report

# Frontend tests
cd admin/frontend
npm test                 # Vitest
npm run test:e2e         # Playwright (requires npm run build first)
```

---

## 9. Flutter App Integration

Once the backend is running, update `app/lib/constants.dart` to point to your API:

```dart
const String kApiBaseUrl = 'http://localhost:4000/api/v1';   // dev
// const String kApiBaseUrl = 'https://api.yourstore.com/api/v1'; // prod
```

Add these to `app/pubspec.yaml` dependencies:
```yaml
flutter_riverpod: ^2.6.1
riverpod_annotation: ^2.6.1
dio: ^5.7.0
retrofit: ^4.4.1
flutter_secure_storage: ^9.2.2
```

---

## 10. Environment Security Checklist

Before going to production:

- [ ] All `sk_test_` Stripe keys replaced with `sk_live_` keys
- [ ] `SUPABASE_SERVICE_ROLE_KEY` confirmed absent from all frontend code and git history
- [ ] `NODE_ENV=production` set in production backend
- [ ] `LOG_LEVEL=warn` or `error` in production (not `debug`)
- [ ] `CORS_ORIGINS` contains only your actual domain(s), no wildcards
- [ ] All `.env` files are in `.gitignore` and not committed
- [ ] Supabase Auth redirect URLs whitelist updated for production domain
- [ ] Stripe webhooks pointing to production API URL
- [ ] Sentry DSN configured for both backend and frontend

---

## Quick Reference: Where Each Key Comes From

| Variable | Source | Dashboard Path |
|---|---|---|
| `SUPABASE_URL` | Supabase | Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase | Settings → API → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Settings → API → service_role |
| `SUPABASE_JWT_SECRET` | Supabase | Settings → API → JWT Secret |
| `DATABASE_URL` (pooler) | Supabase | Settings → Database → Transaction pooler |
| `DIRECT_URL` | Supabase | Settings → Database → URI |
| `UPSTASH_REDIS_REST_URL` | Upstash | Database → REST API |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash | Database → REST API |
| `STRIPE_SECRET_KEY` | Stripe | Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe | Developers → Webhooks → endpoint |
| `SMTP_HOST/USER/PASS` | SendGrid/Brevo/SMTP | Provider dashboard → SMTP settings |
| `SENTRY_DSN` | Sentry | Project Settings → Client Keys (DSN) |
