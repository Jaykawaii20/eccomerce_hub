# CLAUDE.md — E-Commerce Platform (WooCommerce-Parity)

## Project Overview

A full-stack, production-grade e-commerce platform built to match the feature depth of WordPress + WooCommerce. Designed for distribution to clients with enterprise-grade security, performance, testability, and international standards compliance.

### Stack

| Layer | Technology |
|---|---|
| Mobile App | Flutter (Dart) — already bootstrapped in `app/` |
| Backend API | Express.js (Node.js + TypeScript) — `admin/backend/` |
| Admin Frontend | Next.js 14+ (App Router, TypeScript) — `admin/frontend/` |
| Database | Supabase (managed PostgreSQL + Auth + Storage + Realtime) |
| ORM | Prisma (connects via Supabase connection pooler) |
| Auth | Supabase Auth (JWT, OAuth, email OTP) + custom RBAC on top |
| File Storage | Supabase Storage (buckets with RLS policies) |
| Email | Nodemailer + SMTP / SendGrid |
| Payments | Stripe (primary), extensible for others |
| Search | PostgreSQL full-text search via Supabase (upgrade to Meilisearch later) |
| Queue | BullMQ + Upstash Redis (serverless Redis — pairs with Supabase) |
| Containerization | Docker + Docker Compose (app containers only — DB is Supabase-managed) |

---

## Repository Structure

```
dev/
├── app/                    # Flutter mobile app
│   ├── lib/
│   │   ├── constants.dart
│   │   ├── main.dart
│   │   ├── entry_point.dart
│   │   ├── components/
│   │   ├── models/
│   │   ├── route/
│   │   ├── screens/
│   │   └── theme/
│   └── pubspec.yaml
│
├── admin/
│   ├── backend/            # Express.js REST API (TypeScript)
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── models/        # Prisma schema & types
│   │   │   ├── repositories/  # Data access layer
│   │   │   ├── services/      # Business logic
│   │   │   ├── routes/
│   │   │   ├── utils/
│   │   │   ├── validators/    # Zod schemas
│   │   │   ├── jobs/          # BullMQ workers
│   │   │   └── app.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── frontend/           # Next.js Admin Panel (TypeScript)
│       ├── app/
│       │   ├── (auth)/
│       │   ├── (dashboard)/
│       │   └── api/           # Next.js API routes (thin proxy only)
│       ├── components/
│       │   ├── ui/            # Shadcn/ui base components
│       │   ├── forms/
│       │   ├── tables/
│       │   └── charts/
│       ├── lib/
│       │   ├── api-client.ts
│       │   ├── auth.ts
│       │   └── utils.ts
│       ├── hooks/
│       ├── stores/            # Zustand stores
│       ├── tests/
│       └── package.json
│
├── docker-compose.yml
├── docker-compose.dev.yml
└── CLAUDE.md
```

---

## Architecture Principles

### SOLID

- **Single Responsibility:** Every class/module has one reason to change. Controllers handle HTTP only. Services contain business logic only. Repositories handle database only.
- **Open/Closed:** New payment gateways, shipping providers, or discount types must be added by extension (strategy pattern), never by modifying existing core logic.
- **Liskov Substitution:** Repository interfaces must be substitutable. `IProductRepository` can be backed by Prisma/PostgreSQL or an in-memory mock — callers must not know the difference.
- **Interface Segregation:** Do not force consumers to depend on interfaces they don't use. Split fat interfaces (e.g., `IOrderService` vs `IOrderReportService`).
- **Dependency Inversion:** High-level modules (services) depend on abstractions (repository interfaces), not concrete implementations. Wire dependencies via a DI container (use `tsyringe` or manual factory functions).

### Layered Architecture (Backend)

```
HTTP Request
    │
    ▼
Middleware (auth, rate-limit, validation)
    │
    ▼
Controller (parse request, call service, return response)
    │
    ▼
Service (business rules, orchestration, domain events)
    │
    ▼
Repository (data access — Prisma calls only here)
    │
    ▼
Supabase (PostgreSQL via connection pooler)
```

Rules:
- Controllers NEVER import Prisma directly.
- Services NEVER import Express `Request`/`Response`.
- Repositories NEVER contain business logic.
- Cross-cutting concerns (logging, caching) go in middleware or service decorators.

---

## WooCommerce Feature Parity

### Product Catalog
- [ ] Products (simple, variable, grouped, virtual, downloadable)
- [ ] Product variations (color, size, material — unlimited attributes)
- [ ] Product categories (hierarchical, unlimited depth)
- [ ] Product tags
- [ ] Product images (gallery, featured image)
- [ ] Product reviews & ratings (with moderation)
- [ ] Product SKU & inventory management (stock level, backorders, low-stock alerts)
- [ ] Product dimensions & weight (for shipping calculation)
- [ ] Product visibility (public, private, hidden, password-protected)
- [ ] Related products, upsells, cross-sells
- [ ] Short description + rich HTML description
- [ ] Virtual & downloadable products with secure file delivery
- [ ] Product bundles (extension)
- [ ] Product import/export (CSV)

### Pricing & Discounts
- [ ] Regular price + sale price with scheduled date range
- [ ] Coupon system: percentage, fixed cart, fixed product
- [ ] Coupon restrictions: min/max spend, product/category exclusions, usage limits per user/total
- [ ] Bulk pricing rules
- [ ] Tax rates by region (configurable rate tables)
- [ ] Tax classes (standard, reduced, zero)
- [ ] Price display inclusive/exclusive of tax

### Cart & Checkout
- [ ] Persistent cart (saved to DB for logged-in users)
- [ ] Guest checkout
- [ ] Multi-step checkout (address → shipping → payment → review)
- [ ] Order notes field
- [ ] Coupon application at checkout
- [ ] Real-time cart totals (subtotal, tax, shipping, discount, total)
- [ ] Address autocomplete (Google Places or OpenStreetMap)
- [ ] Shipping calculator in cart

### Orders
- [ ] Full order lifecycle: Pending → Processing → On Hold → Completed → Cancelled → Refunded → Failed
- [ ] Partial refunds
- [ ] Order notes (internal + customer-visible)
- [ ] Order editing by admin
- [ ] Automatic order confirmation email with PDF invoice
- [ ] Order tracking page
- [ ] Re-order functionality
- [ ] Bulk order actions (admin)

### Shipping
- [ ] Multiple shipping zones (by country, state, postcode)
- [ ] Shipping methods per zone: flat rate, free shipping, local pickup
- [ ] Shipping classes (for different rate rules per product type)
- [ ] Real-time carrier rates (extensible: FedEx, UPS, DHL)
- [ ] Table rate shipping

### Payments
- [ ] Stripe (cards, Apple Pay, Google Pay)
- [ ] Cash on delivery
- [ ] Bank transfer
- [ ] Payment gateway interface for adding new providers
- [ ] Webhook handling for async payment confirmation
- [ ] Idempotency keys on all payment operations

### Users & Accounts
- [ ] Customer registration & login
- [ ] Social login (Google, Facebook via OAuth 2.0)
- [ ] Customer dashboard: orders, downloads, addresses, account details
- [ ] Multiple saved addresses (billing + shipping)
- [ ] Saved payment methods (Stripe SetupIntent — never store raw card data)
- [ ] Wishlist / bookmarks
- [ ] Recently viewed products

### Inventory
- [ ] Stock management per product/variation
- [ ] Low-stock threshold alerts
- [ ] Out-of-stock handling (hide vs show)
- [ ] Backorder support
- [ ] Stock history log

### Notifications & Email
- [ ] Transactional emails: order confirmation, shipping, cancellation, refund, account creation, password reset
- [ ] Admin emails: new order, low stock, failed order
- [ ] HTML email templates (customizable per client)
- [ ] Email queue (BullMQ) — never block HTTP response on email send

### Search & Discovery
- [ ] Full-text product search (title, description, SKU, tags)
- [ ] Faceted filtering (category, price range, attributes, rating)
- [ ] Sorting (price asc/desc, newest, best selling, rating)
- [ ] Pagination + infinite scroll (cursor-based for API)

### Admin Panel (Next.js)
- [ ] Dashboard with KPI widgets (revenue, orders, customers, conversion rate)
- [ ] Sales reports (by date range, product, category, coupon)
- [ ] Product management (full CRUD with rich text editor)
- [ ] Order management with status pipeline
- [ ] Customer management
- [ ] Coupon management
- [ ] Tax & shipping configuration
- [ ] Settings: store info, currency, units, timezone, payment gateways
- [ ] User & role management
- [ ] Media library
- [ ] Activity log / audit trail

### Mobile App (Flutter — `app/`)
- All customer-facing flows already have UI screens
- Must connect to backend via versioned REST API (`/api/v1/...`)
- Use Riverpod for state management
- Use Dio + Retrofit for type-safe HTTP client
- Secure storage (flutter_secure_storage) for tokens

---

## Authentication & Authorization

### Authentication Flow

Supabase Auth handles the token lifecycle (JWT issuance, refresh, email OTP, OAuth). Our Express API verifies tokens using the Supabase JWT secret — **never re-implement what Supabase Auth already does**.

1. **Registration:** `POST /api/v1/auth/register` — call `supabase.auth.signUp()` server-side (service role), then create a matching row in our `users` table with default `customer` role. Supabase sends the verification email automatically.
2. **Login:** `POST /api/v1/auth/login` — call `supabase.auth.signInWithPassword()`, return the Supabase access token (1hr) + refresh token to client. Store refresh token in httpOnly cookie.
3. **Refresh:** `POST /api/v1/auth/refresh` — call `supabase.auth.refreshSession()`. Supabase rotates the refresh token automatically.
4. **Logout:** `POST /api/v1/auth/logout` — call `supabase.auth.signOut()` server-side (invalidates session in Supabase).
5. **Password reset:** `POST /api/v1/auth/forgot-password` — call `supabase.auth.resetPasswordForEmail()`. Supabase sends OTP email. Client posts new password to `POST /api/v1/auth/reset-password` which calls `supabase.auth.updateUser()`.
6. **Email verification:** Handled entirely by Supabase — configure redirect URL in Supabase dashboard.
7. **OAuth:** `GET /api/v1/auth/google` — redirect to Supabase OAuth URL. Callback handled by Supabase; our API receives the session via callback hook.

**Token verification in Express middleware:**
```ts
// Verify every request using the Supabase JWT secret (RS256)
const { data: { user }, error } = await supabase.auth.getUser(bearerToken);
if (error || !user) return res.status(401).json({ ... });
// Then load our custom role/permissions from the users table
```

### Roles & Permissions (RBAC)

| Role | Description |
|---|---|
| `super_admin` | Full system access |
| `admin` | Store management, no system settings |
| `manager` | Orders, products, customers (no settings/users) |
| `support` | Read orders, write order notes |
| `vendor` | Manage own products and orders (multi-vendor ready) |
| `customer` | Shop access, own account only |
| `guest` | Browse catalog, no checkout without registration (configurable) |

Permissions are defined as a flat string enum (`orders:read`, `orders:write`, `products:delete`, etc.) and assigned per role. Roles are checked by middleware, not controllers.

### Security Requirements

**OWASP Top 10 — all must be mitigated:**

- **Injection:** Use Prisma parameterized queries exclusively. Never build raw SQL strings from user input.
- **Broken Auth:** Supabase Auth enforces token expiry and rotation. Rate-limit login endpoint (5 attempts/15min per IP via Upstash Redis). Supabase's built-in brute-force protection also applies.
- **Sensitive Data Exposure:** Never log passwords, tokens, or full card numbers. Use TLS everywhere. Encrypt PII at rest (email, phone, addresses).
- **XML/Entity Injection:** Not applicable (JSON only), but sanitize all HTML in product descriptions with `sanitize-html` or `DOMPurify` (server-side).
- **Broken Access Control:** Every route verifies role and ownership. Customers can only access their own orders/addresses/data.
- **Security Misconfiguration:** Helmet.js on all Express responses. CORS whitelist only. Disable X-Powered-By. CSP headers on Next.js.
- **XSS:** Sanitize all rich text inputs server-side. React/Next.js escapes by default — never use `dangerouslySetInnerHTML` without explicit sanitization.
- **Insecure Deserialization:** Validate all incoming payloads with Zod before touching them. Never use `eval` or `Function()`.
- **Vulnerable Dependencies:** Run `npm audit` in CI. Dependabot alerts required.
- **Insufficient Logging:** Log all auth events, admin actions, payment events, and errors with structured JSON logs (Winston + correlation IDs).

**Additional Security:**

- All file uploads: validate MIME type server-side (not just extension), scan with ClamAV or equivalent, serve from separate domain/CDN (never same origin as API).
- Payment data: never pass raw card numbers through your backend — use Stripe.js / Payment Element on client, only receive PaymentIntent IDs server-side.
- Idempotency keys on all mutation endpoints that could be retried (orders, payments).
- CSRF protection: SameSite=Strict cookies + CSRF token for web admin; not required for mobile (Authorization header).
- SQL injection prevention: Prisma only. If raw queries are ever needed, use `$queryRaw` with tagged template literals.
- Secrets: all secrets in environment variables. Never commit `.env` files. Use `.env.example` with placeholder values.

---

## API Design Standards

### Versioning
All routes prefixed with `/api/v1/`. Breaking changes increment to `/api/v2/` — old version stays live for 6 months minimum.

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product with ID 123 does not exist.",
    "details": []
  }
}
```

### HTTP Status Codes
- `200 OK` — successful read or update
- `201 Created` — successful resource creation
- `204 No Content` — successful deletion
- `400 Bad Request` — validation failure (include Zod error details)
- `401 Unauthorized` — missing or invalid token
- `403 Forbidden` — authenticated but insufficient role/permission
- `404 Not Found` — resource does not exist
- `409 Conflict` — duplicate (e.g., email already registered, SKU already exists)
- `422 Unprocessable Entity` — business rule violation (e.g., insufficient stock)
- `429 Too Many Requests` — rate limit hit
- `500 Internal Server Error` — never expose stack trace to client

### Pagination
Use cursor-based pagination for lists with high churn (orders, activity logs). Use offset-based for stable data (product catalog with admin filtering). Always include `meta.total`, `meta.page`, `meta.pageSize`, `meta.totalPages`.

### Filtering & Sorting
```
GET /api/v1/products?category=shoes&minPrice=10&maxPrice=200&sort=price:asc&page=1&pageSize=20
GET /api/v1/orders?status=processing&from=2024-01-01&to=2024-12-31&sort=createdAt:desc
```

---

## Database Schema (Key Entities)

Design with Prisma. All tables include `id` (UUID), `createdAt`, `updatedAt`. Soft deletes via `deletedAt` (nullable) on all major entities.

**Core tables:**
- `users` — auth + profile, polymorphic (customer/admin)
- `roles`, `permissions`, `role_permissions`, `user_roles`
- `products`, `product_variants`, `product_attributes`, `product_attribute_values`
- `product_images`, `product_reviews`
- `categories` (self-referential for hierarchy), `product_categories`
- `tags`, `product_tags`
- `inventory` — one row per variant with stock quantity, reserved, backorder flag
- `orders`, `order_items`, `order_status_history`, `order_notes`
- `addresses` (polymorphic: user billing/shipping, or order snapshot)
- `coupons`, `coupon_usages`
- `tax_rates`, `tax_classes`
- `shipping_zones`, `shipping_zone_regions`, `shipping_methods`, `shipping_classes`
- `payments` — linked to order, stores gateway, intent ID, status
- `refunds`, `refund_items`
- `media` — file uploads with Supabase Storage bucket + path, MIME type, size, alt text, public URL
- `settings` — key/value store for configurable values per store
- `notifications`, `email_logs`
- `activity_logs` — audit trail for admin actions
- `sessions` / `refresh_tokens` — managed by Supabase Auth (`auth.sessions` table). Do not duplicate this — call `supabase.auth.signOut()` for revocation.

All monetary values stored as `INTEGER` (cents) to avoid floating point. Currency stored as ISO 4217 string.

---

## Testing Requirements

### Coverage Targets

| Layer | Target |
|---|---|
| Unit (services, validators, utils) | ≥ 80% line coverage |
| Integration (routes + DB) | All happy paths + top error paths |
| E2E (critical user flows) | ≥ 10 flows covering purchase funnel |

### Backend Tests (Jest + Supertest)

- **Unit tests:** Pure functions, service methods with mocked repositories
- **Integration tests:** Full HTTP request → real PostgreSQL (test DB) → response. Use the **Supabase CLI** (`supabase start`) to spin up a local Supabase instance for CI. Configure `SUPABASE_URL=http://localhost:54321` and `DATABASE_URL` pointing to the local instance in test environment.
- **Contract:** Every endpoint has at minimum: success case, unauthorized case, invalid input case

File convention: `*.spec.ts` next to source, `tests/integration/*.test.ts` for route tests.

### Frontend Tests (Vitest + React Testing Library + Playwright)

- **Unit:** Component rendering, hook behavior
- **Integration:** Form submissions, API mocking with MSW
- **E2E (Playwright):** Full checkout flow, admin order management, login/logout

### Flutter Tests (built-in flutter_test + integration_test)

- **Widget tests:** All screen widgets render without error
- **Integration tests:** Auth flow, add-to-cart, checkout flow against a local test server

### CI Rules
- No PR merges if any test fails
- Coverage report comment on every PR
- Tests must pass in < 5 minutes (parallelize in CI)

---

## Performance Standards

### API Response Time Targets (p99)

| Endpoint Type | Target |
|---|---|
| Product listing (paginated) | < 200ms |
| Single product detail | < 100ms |
| Cart operations | < 150ms |
| Order creation | < 500ms |
| Admin dashboard stats | < 1000ms |

### Caching Strategy

- **Upstash Redis cache:** Product listings (TTL 5min), category tree (TTL 1hr), settings (TTL 1hr), rate limiting. Upstash is serverless and HTTP-based — use the `@upstash/redis` SDK, not `ioredis`.
- **HTTP cache headers:** `Cache-Control: public, max-age=300` on product endpoints
- **CDN:** Supabase Storage serves files via a built-in CDN. Configure the `product-images` bucket as public with CDN enabled. All other static assets via Cloudflare or Vercel Edge.
- **Database:** Use Supabase's built-in **connection pooler** (PgBouncer in Transaction mode) for all Prisma queries — use the pooler URL, not the direct connection URL. Use the direct URL only for `prisma migrate`. Add indexes on all foreign keys and commonly filtered columns (e.g., `status`, `createdAt`, `slug`).

### Database Indexes (required)

Every column used in `WHERE`, `JOIN`, `ORDER BY`, or foreign key must have an index. Composite indexes for common query patterns (e.g., `(status, createdAt)` on orders).

### Query Rules
- Never use `SELECT *` — always specify columns
- Never run N+1 queries — use Prisma `include` or `DataLoader` batching
- Log slow queries (> 100ms) with the full query and parameters
- Use `EXPLAIN ANALYZE` on any new complex query before shipping

---

## Code Quality Standards

### TypeScript (Backend & Frontend)
- Strict mode: `"strict": true` in tsconfig
- No `any` — use `unknown` and narrow with type guards or Zod
- No non-null assertions (`!`) except when genuinely provably safe
- All async functions must have proper error handling (try/catch or Result type)
- Use `Result<T, E>` pattern (or neverthrow library) in service layer — don't throw for expected domain errors

### Linting & Formatting
- ESLint with `@typescript-eslint` + `eslint-plugin-security`
- Prettier with consistent config shared across all packages
- Husky pre-commit: lint + format check + type-check
- Commitlint: enforce conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`)

### Naming Conventions

| Artifact | Convention |
|---|---|
| Files (TS) | `kebab-case.ts` |
| Classes/Interfaces | `PascalCase` |
| Functions/variables | `camelCase` |
| Constants | `UPPER_SNAKE_CASE` |
| DB tables | `snake_case` (Prisma maps to camelCase) |
| API routes | `kebab-case`, plural nouns (`/products`, `/order-items`) |
| Dart/Flutter files | `snake_case.dart` |
| Dart classes | `PascalCase` |

### Error Handling
- Never let unhandled promise rejections reach the event loop — attach global handler and log them
- All Express route handlers wrapped with `asyncHandler` utility to catch async errors
- Distinguish between operational errors (user's fault, return 4xx) and programmer errors (our fault, return 500 + alert)
- Use a central error-handling middleware as the last `app.use()`

---

## Environment & Configuration

### Environment Variables (Backend)

```env
# App
NODE_ENV=production
PORT=4000
API_VERSION=v1

# Supabase — get these from your Supabase project dashboard (Settings → API)
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_ANON_KEY=                        # safe to expose to clients
SUPABASE_SERVICE_ROLE_KEY=                # server-side ONLY — never expose to clients

# Database — from Supabase dashboard (Settings → Database → Connection string)
# Use the POOLER (Transaction mode) URL for Prisma queries at runtime
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
# Use the DIRECT connection URL for Prisma migrations only
DIRECT_URL=postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres

# Upstash Redis — get from upstash.com console
UPSTASH_REDIS_REST_URL=https://<id>.upstash.io
UPSTASH_REDIS_REST_TOKEN=

# Auth — Supabase handles JWT issuance; we only need this to verify tokens locally
# Get from Supabase dashboard (Settings → API → JWT Secret)
SUPABASE_JWT_SECRET=

# Supabase Storage
SUPABASE_STORAGE_BUCKET_PRODUCTS=product-images
SUPABASE_STORAGE_BUCKET_DOWNLOADS=secure-downloads

# Email
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM="Store Name <noreply@store.com>"

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# OAuth — configured in Supabase Auth dashboard, not directly in app
# Set redirect URLs in Supabase Auth → Providers → Google/Facebook
OAUTH_CALLBACK_BASE_URL=https://api.yourstore.com

# App URLs
FRONTEND_URL=https://admin.yourstore.com
MOBILE_APP_DEEP_LINK_SCHEME=shop

# Monitoring
SENTRY_DSN=
LOG_LEVEL=info
```

**Prisma datasource with Supabase (required config):**
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")   // pooler URL — used at runtime
  directUrl = env("DIRECT_URL")     // direct URL — used by prisma migrate only
}
```

Never commit `.env`. Only commit `.env.example` with all keys present but empty values.

---

## Supabase Usage Rules

### What Supabase Owns
- PostgreSQL database (accessed via Prisma through the connection pooler)
- Auth (JWT issuance, refresh, email verification, password reset, OAuth providers)
- File Storage (product images, downloadable files, media library)
- Realtime (optional — use for live order status updates, admin notifications)

### What We Own on Top
- Custom RBAC: roles and permissions live in our own `users`, `roles`, `permissions` tables. Supabase Auth gives us the user identity (`auth.uid()`); our code maps that to a role.
- Business logic: entirely in Express.js services. Never use Supabase Edge Functions for core business logic — keep it in the Express app for testability and portability.
- All mutations go through the Express API. The client (Flutter app, Next.js admin) never writes directly to Supabase — only reads public data via the anon key where appropriate.

### Supabase Client Usage
```ts
import { createClient } from '@supabase/supabase-js';

// Admin client — server-side only, bypasses RLS
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // NEVER expose this to clients
);

// Verify a user token (in auth middleware)
const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
```

### Storage Rules
- **`product-images` bucket:** Public, CDN-enabled. Files addressed as `/{productId}/{filename}`. Upload only via server (service role).
- **`secure-downloads` bucket:** Private. Always serve via short-lived signed URLs (`createSignedUrl`, max 1hr). Verify order ownership before generating URL.
- **`media` bucket:** Private (admin uploads). Serve via signed URLs in admin panel.
- Validate MIME type and file size server-side before calling Supabase Storage upload.

### Supabase Migrations
- Manage schema changes with **Prisma migrations** (not Supabase migrations) — single source of truth.
- Run `npx prisma migrate dev` locally (uses `DIRECT_URL`).
- Run `npx prisma migrate deploy` in CI/CD against production (uses `DIRECT_URL`).
- Never use the Supabase dashboard SQL editor to make schema changes that are not tracked in `prisma/migrations/`.

### Row Level Security (RLS)
Enable RLS on tables if any Supabase client (anon key) ever reads them directly. For tables accessed only through the Express API (service role key), RLS is optional but recommended as a defense-in-depth layer.

Minimum required RLS policies:
```sql
-- Example: customers can only read their own orders
CREATE POLICY "customers_own_orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);
```

---

## Docker & Deployment

### `docker-compose.yml` (production-like)
Services (DB is Supabase-managed — no postgres/redis containers needed):
- `api` — Express.js (Node 20 alpine)
- `web` — Next.js (standalone build)
- `nginx` — Reverse proxy with SSL termination

### `docker-compose.dev.yml`
- Adds volume mounts for hot reload
- Exposes ports directly

### Local Development with Supabase CLI
Run `supabase start` to spin up a full local Supabase stack (PostgreSQL, Auth, Storage, Studio) at `http://localhost:54321`. This is the only local database needed — no separate Docker postgres container.

```bash
# Install Supabase CLI
npm install -g supabase

# Start local Supabase (runs postgres, auth, storage, studio)
supabase start

# Apply migrations
npx prisma migrate dev

# Stop
supabase stop
```

Set `.env.local` for development:
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=<local anon key from supabase start output>
SUPABASE_SERVICE_ROLE_KEY=<local service role key from supabase start output>
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres:postgres@localhost:54322/postgres
UPSTASH_REDIS_REST_URL=<from upstash.com — same for dev/prod or use a dev instance>
UPSTASH_REDIS_REST_TOKEN=
```

### Health Checks
- `GET /api/v1/health` — returns `{ status: "ok", db: "ok", redis: "ok", storage: "ok" }`
- Checks: Prisma `$queryRaw SELECT 1`, Upstash Redis ping, Supabase Storage bucket list
- Docker health checks on `api` and `web` containers
- Graceful shutdown: drain in-flight requests before killing Node process

---

## Logging & Observability

- Structured JSON logging with Winston
- Log fields: `timestamp`, `level`, `correlationId`, `userId`, `method`, `path`, `statusCode`, `durationMs`, `message`
- Correlation ID generated at edge (middleware), propagated through all layers and across service calls
- Never log passwords, tokens, PII, or raw payment data
- Error events must include stack trace in `development` only — sanitize in `production`
- Integrate with Sentry for error tracking (backend + frontend + Flutter)
- Track key business metrics: order created, payment succeeded, payment failed, coupon applied, product out of stock

---

## Internationalization (i18n)

- All user-facing strings in backend responses are keys — never hardcode English in API responses that go to end users
- Next.js admin: `next-intl` for admin panel (minimum: EN + local language)
- Flutter: use Flutter's built-in `intl` + ARB files
- Currency: format all amounts using `Intl.NumberFormat` with locale and currency code
- Dates: store as UTC, format for display using locale
- RTL layout support considered in Flutter theme (TextDirection)

---

## Client Distribution Checklist

Before handing to a client:

- [ ] All secrets in environment variables, no hardcoded values
- [ ] `.env.example` documents every required variable
- [ ] `README.md` in each package with setup instructions
- [ ] Database migrations in `prisma/migrations/` (never delete migration history)
- [ ] Docker Compose working end-to-end from cold start
- [ ] SSL certificates configured (or documented how to configure)
- [ ] All default admin credentials changed
- [ ] Rate limiting configured appropriately for expected traffic
- [ ] Supabase Storage bucket policies configured: `product-images` public (CDN), `secure-downloads` private (signed URLs only)
- [ ] Supabase Auth redirect URLs whitelisted (no wildcard in production)
- [ ] Supabase Row Level Security (RLS) enabled on all tables that Supabase client touches directly
- [ ] Supabase service role key confirmed NOT exposed to any client-side code
- [ ] Stripe webhooks registered with correct endpoint
- [ ] Email sending verified and tested
- [ ] Sentry project created and DSN configured
- [ ] Backup strategy documented (Supabase provides automated daily backups on Pro plan; verify retention period with client)
- [ ] GDPR/privacy: data deletion flow implemented for customer accounts

---

## Development Workflow

1. Create feature branch from `main`: `feat/product-variants`
2. Write failing tests first (TDD where practical, especially for services)
3. Implement feature
4. `npm run lint && npm run type-check && npm test` must all pass
5. Open PR — required: test coverage, no linting errors, description of changes
6. At least one reviewer approval required
7. Squash merge to `main`

---

## Key Conventions (DO / DON'T)

### DO
- Use Zod for ALL request validation at the controller boundary — validate before the service ever sees the data
- Return `Result<T, DomainError>` from service methods — let the controller map errors to HTTP responses
- Keep controllers thin: parse → validate → call service → format response
- Use database transactions for operations that touch multiple tables (orders, inventory)
- Add `correlationId` to every log entry
- Write migration scripts that are reversible (always implement `down()`)

### DON'T
- Don't use `any` in TypeScript
- Don't put business logic in controllers or repositories
- Don't bypass authentication middleware "just for testing"
- Don't use floating point for money — always integers (cents)
- Don't store plain-text passwords or tokens
- Don't expose internal error messages or stack traces to API consumers
- Don't make synchronous calls to external services (email, SMS, webhooks) inside the HTTP request lifecycle — always queue them
- Don't skip input sanitization for HTML/rich text fields
- Don't use `npm install --save-dev` on production dependencies or vice versa
- Don't hard-code client-specific configuration — everything configurable must live in the `settings` table or environment variables
- Don't expose `SUPABASE_SERVICE_ROLE_KEY` to any client — it bypasses RLS and has full database access
- Don't use Supabase Edge Functions for business logic — keep all logic in the Express API
- Don't call Supabase Storage directly from the Flutter app for uploads — always proxy through the Express API so server-side validation runs first
- Don't use `ioredis` or `redis` npm package — use `@upstash/redis` (HTTP-based, works in serverless and standard Node.js)
- Don't use Prisma's direct connection URL (`DIRECT_URL`) at runtime — it's for migrations only; use the pooler URL for all queries
