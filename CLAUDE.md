# CLAUDE.md — Summary

**Project:** Full-stack e-commerce platform matching WooCommerce features.

**Stack:** 
- Flutter (mobile)
- Express.js + TypeScript (backend)
- Next.js (admin panel)
- Supabase (database, auth, storage)
- Prisma (ORM)
- Redis/Upstash (queue)

**Architecture:** SOLID principles, layered design (Controller → Service → Repository → Supabase)

**Key Features:** Products (simple/variable), cart/checkout, orders, Stripe payments, shipping zones, coupons, inventory, reviews, wishlist, admin dashboard, mobile app

**Auth:** Supabase Auth + JWT + custom RBAC (roles: super_admin, admin, manager, customer)

**Security:** OWASP Top 10 compliance — injection prevention, XSS sanitization, rate limiting, encryption, CSRF, audit logs

**API:** REST, versioned (`/api/v1/`), consistent JSON responses, proper HTTP status codes

**Testing:** ≥80% unit coverage, integration tests, E2E flows (Jest, Vitest, Playwright, Flutter tests)

**Performance:** 
- Response targets: <200ms for listings
- Redis caching
- CDN for images
- Database indexes
- Connection pooling

**Code Quality:** TypeScript strict mode, ESLint, Prettier, conventional commits, Result pattern for errors

**Deployment:** Docker Compose, Supabase CLI for local dev, health checks, structured logging (Winston), Sentry for errors

**Critical Rules:**
- Never expose Supabase service role key to clients
- Use Prisma pooler URL at runtime (not direct URL)
- Queue all external calls (email, webhooks)
- Store money in cents (integers)
- Validate all inputs with Zod
- Keep controllers thin

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
