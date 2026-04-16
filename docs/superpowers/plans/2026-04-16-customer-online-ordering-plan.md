# Customer Online Ordering — Implementation Plan

**Paired spec:** `docs/superpowers/specs/2026-04-16-customer-online-ordering-design.md`
**Date:** 2026-04-16

This plan breaks the spec into 11 milestones ordered by dependency. Each milestone is a discrete, shippable unit with explicit acceptance criteria. Milestones 1–9 land on a staging copy of SMA before any customer sees the feature; milestones 10–11 gate the public launch.

**Legend**
- **SMA** = existing CodeIgniter 3 codebase (PHP/MySQL). Most backend work lives here.
- **Web** = existing React app at `apps/web`.
- **Parallelizable** milestones in the same row can be worked concurrently by different developers.

---

## Milestone map (high level)

```
M0  Local dev environment setup
M1  DB migrations + seeds
M2  API module skeleton (routing, JWT, rate limit, error envelope)
M3  Auth endpoints + emails              │
M4  Menu endpoints + public settings     │ parallelizable after M2
M5  Orders pipeline + cancel semantics   │
M6  Reviews endpoints                    │
M7  SMA staff UI additions               │ parallelizable after M1
M8  React customer app wire-up + UI      │ parallelizable after M3/M4/M5/M6 (mocking allowed)
M9  Transactional emails + deliverability
M10 Staging end-to-end QA
M11 Production rollout P0 → P3
```

---

## M0 — Local dev environment setup

**Goal:** reproducible local env where both SMA and the React app run against a copy of production schema.

**Tasks:**
1. Clone SMA codebase to `apps/sma/` inside the monorepo (new folder; keep the React app at `apps/web`).
2. Docker Compose additions: `php-fpm` (PHP 7.4 or matching SMA's version), `mysql:5.7`, `nginx`, plus the existing `web` dev server in `apps/web`.
3. Import a sanitized copy of the production `bistro.sql` dump into the local MySQL.
4. Verify: can log into SMA staff UI locally, can see existing products and sales.
5. Add `.env` entries for the API module (JWT secret, bcrypt cost, rate-limit Redis URL if used, SMTP config for local MailHog).
6. Add MailHog (or equivalent) to Docker Compose so local emails land in a browser inbox.

**Acceptance:**
- `docker compose up` brings the whole stack online.
- Staff login to SMA works locally.
- React app builds and runs against a mock `api.ts`.
- Emails fired from SMA's existing mailer land in MailHog.

---

## M1 — DB migrations + seeds

**Goal:** schema changes applied via SMA's CI3 migration system; staging DB can be rolled forward and backward cleanly.

**Tasks:**
1. Create migration `316_create_sma_online_customers.php` per spec §3.1.
2. Create migration `317_create_sma_online_settings.php` — create table + insert single row with `enabled=0`, hours defaulted to M–Sun 11:00–22:00 closed=false, `min_prep_minutes=20`, `max_scheduled_days_ahead=2`, `customer_cancel_window_minutes=5`, placeholder `from_email`/`from_name`.
3. Create migration `318_create_sma_online_reviews.php` per spec §3.1 incl. unique + composite indexes.
4. Create migration `319_create_sma_online_status_log.php` per spec §3.1.
5. Create migration `320_alter_sma_sales_add_online_columns.php` — adds 8 columns per spec §3.2 + index on `online_status`.
6. Create migration `321_alter_sma_permissions_add_reviews.php` — adds `reviews-index` and `reviews-moderate` boolean columns; sets to 1 for admin + manager rows.
7. Create migration `322_seed_online_ordering.php` — inserts:
   - `sma_companies` row `group_name='biller'`, `name='Bistro Online'`
   - `sma_customer_groups` row `name='Online Customer'`, `percent=0`
   - `sma_order_ref` row with ref prefix `on`
8. Write paired **down-migrations** for every up-migration. Each down must be testable in isolation.
9. Test sequence on local:
   - Apply all 7 up-migrations, verify schema.
   - Apply all 7 down-migrations in reverse, verify clean state.
   - Re-apply to confirm idempotency.

**Acceptance:**
- `sma_migrations.version = 322` after up.
- Rollback returns DB to exactly pre-migration state (schema diff = empty).
- Seed rows present with correct IDs captured into a config note for M2.

---

## M2 — API module skeleton

**Goal:** `/api/v1/*` serves requests, returns standardized JSON errors, enforces JWT on protected routes, applies rate limiting.

**Tasks:**
1. Create `application/controllers/api/v1/` directory + base controller `MY_ApiController.php`:
   - Parses JSON request body.
   - Returns standardized error envelope: `{error: {code, message, fields?}}`.
   - Handles uncaught exceptions → 500 with safe error body.
   - Sets `Content-Type: application/json`.
2. Create `application/libraries/Jwt.php` — issue/verify access + refresh tokens. Use the `firebase/php-jwt` library (vendored via composer.json addition or copied into `application/third_party/`).
3. Create `application/libraries/RateLimit.php` — fixed-window counter backed by a new `sma_api_rate_limits` table (or memcached if SMA already uses one). Keys: `(ip, endpoint)` and `(identifier, endpoint)` for per-email/customer limits.
4. Create `application/libraries/OnlineAuth.php` — authenticate incoming request, load `sma_online_customers` row, expose `$this->online_auth->user_id()` helper.
5. Add a `MY_Router` extension (if not already) or route entries so `/api/v1/*` reaches the new controllers.
6. Add a `/api/v1/health` endpoint returning `{status:"ok", version}`.

**Acceptance:**
- GET `/api/v1/health` returns 200.
- Missing JWT on a protected route returns 401 with standardized envelope.
- Valid JWT populates `OnlineAuth::user_id()`.
- Hitting a rate-limited endpoint beyond threshold returns 429.

---

## M3 — Auth endpoints + emails

**Goal:** customer signup, verification, login, password reset, session refresh all functional end-to-end.

**Tasks (endpoints per spec §4.1 + §4.2):**
1. `POST /api/v1/auth/signup` — validates input (`form_validation`), hashes password with bcrypt (cost 12), inserts into `sma_online_customers`, generates verification token, sends verification email via SMA's `email` library using the `verify-email` template, returns 202.
2. `GET /api/v1/auth/verify?token=…` — looks up token, sets `email_verified_at`, clears token.
3. `POST /api/v1/auth/resend-verification` — rate-limited (1/min/email).
4. `POST /api/v1/auth/login` — checks password, blocks unverified (403), blocks locked (429), issues JWT pair on success.
5. `POST /api/v1/auth/forgot-password` — always 200; sends `reset-password` email only if account exists.
6. `POST /api/v1/auth/reset-password` — validates token + expiry; updates password; revokes all refresh tokens for this user.
7. `POST /api/v1/auth/refresh` — swaps refresh token for new pair (rotates refresh token, blacklists old one).
8. `POST /api/v1/auth/logout` — revokes current refresh token.
9. `POST /api/v1/profile/change-password` — validates old, updates, revokes other sessions.
10. Refresh-token store: new table `sma_online_refresh_tokens` (id, customer_id, token_hash, expires_at, revoked_at) + migration `323_create_refresh_tokens.php` (add to M1 if done now, else new migration here).
11. Implement 3 email templates: `verify-email`, `reset-password` — subjects + HTML + plain-text versions under `application/views/email/online/`.

**Acceptance:**
- Signup → email in MailHog → verify link → login succeeds.
- Forgot-password → email in MailHog → reset link → new password works, old refresh tokens rejected.
- Unverified login returns 403 with `resend-verification` action.
- Rate limits per spec §4.4 trigger on repeated failures.

---

## M4 — Menu endpoints + public settings

**Goal:** React app can fetch the full menu and open/closed state without auth.

**Tasks:**
1. `GET /api/v1/menu/categories` — returns categories that have at least one product with `hide=0`. Sorted per SMA's default.
2. `GET /api/v1/menu/products` — supports `?category_id=&search=&featured=1&page=&page_size=`. Returns only `hide=0` products. Includes: id, code, name, name2 (Bangla), image URL, price (per selected price group = online settings), stock at pickup warehouse, `avg_rating`, `review_count`.
3. `GET /api/v1/menu/products/:id` — full product incl. `product_details` HTML (sanitized on output), gallery from `sma_product_photos`, variants, combo items, aggregates, and `my_review` if Authorization header present.
4. `GET /api/v1/menu/products/:id/reviews` — paginated approved reviews only. Masks customer name to first name + last initial.
5. `GET /api/v1/settings/public` — returns `enabled`, `is_open_now`, `next_open_at`, pickup outlet name + address, `min_prep_minutes`, `max_scheduled_days_ahead`, `customer_cancel_window_minutes`.
6. **Menu cache** — 5-minute TTL, keyed by query. Invalidate on any product save inside SMA (hook into the existing products controller's save path — add one line that deletes the cache bucket).
7. Output HTML sanitizer — vendor `ezyang/htmlpurifier` or implement an allow-list `strip_tags` pass on `product_details`.

**Acceptance:**
- Fetch returns only visible products.
- Toggling `products.hide` in SMA admin reflects in menu within 5 minutes (or immediately if cache invalidated).
- `/settings/public` correctly reports `is_open_now` across schedule edges.
- Unauthenticated access works.

---

## M5 — Orders pipeline

**Goal:** customer can place, cancel, and track pickup orders. Sales appear correctly in SMA reports.

**Tasks:**
1. `POST /api/v1/orders` — implements validation rules from spec §4.3:
   - Reads `sma_online_settings`.
   - Validates hours / ASAP vs scheduled / lead time.
   - Validates every product is `hide=0` and stock sufficient at pickup outlet (**strict**, overriding SMA's `overselling=1`).
   - Server-computes subtotal, tax, service charge, grand total.
   - Lazy-creates `sma_companies` row for customer on first order, sets `online_customer_id.company_id` FK.
   - Calls `Sales_model::addSale()` with the payload — reusing SMA's existing sale-creation logic so FIFO costing, tax, service charge, inventory, reference number all fire.
   - Sets `online_status='placed'`, `online_customer_id`, `online_pickup_time`, `online_pickup_is_asap`.
   - Appends `sma_online_status_log` entry.
   - Fires `order-placed` email.
   - Returns 201 `{sale_id, reference_no, online_status, online_pickup_time, total}`.
2. `POST /api/v1/orders/:id/cancel` — customer-cancel within window:
   - Validates ownership, status = `placed`, age ≤ `customer_cancel_window_minutes`.
   - Implements new `Sales_model::cancelOnlineSale($sale_id)` that:
     - Reverses `sma_costing` rows (delete + restore warehouse stock).
     - Updates `sma_sales.sale_status='cancelled'`, `online_status='cancelled'`.
     - Logs + emails customer (`order-cancelled-by-customer`) and staff.
3. `POST /api/v1/orders/:id/request-cancellation` — outside window:
   - Sets `online_cancellation_requested_at` = now.
   - Emails staff (`cancellation-requested`).
   - No state change.
4. `GET /api/v1/orders` — list my orders, newest first, paginated. Each item includes status, reference, total, pickup time, item count.
5. `GET /api/v1/orders/:id` — detail incl. line items, status history from log, timestamps.
6. `GET /api/v1/orders/:id/reviewable` — line items where the customer has no review yet (used by the Rate Your Order UI).

**Acceptance:**
- Placing an order creates a complete `sma_sales` + `sma_sale_items` + `sma_costing` chain identical to a POS sale.
- Staff see the new sale in SMA's Sales list with correct reference (`ON/2026/04/…`).
- Stock at pickup outlet decrements correctly on place, restores on customer-cancel.
- `sma_payments` is NOT inserted on place (only on staff `completed` later).
- `/orders` returns only the caller's orders; 403 on attempting to access another customer's.

---

## M6 — Reviews endpoints

**Goal:** customer can submit, edit, delete their reviews; approved reviews show on product detail.

**Tasks:**
1. `POST /api/v1/reviews` — validates: order is `completed`, product is in that order's items, no existing review by this customer for this product, rating 1–5.
2. `PATCH /api/v1/reviews/:id` — owner only, only if `created_at ≤ now - 7 days` (reject), sets `edited_at = now`, resets `status='pending'`.
3. `DELETE /api/v1/reviews/:id` — owner only, any time.
4. `GET /api/v1/reviews/mine` — list + pagination.
5. Aggregate recomputation — after any review transitions status to/from `approved`, recompute `avg_rating` and `review_count` cache for the product (store on `sma_products` as new columns `online_avg_rating DECIMAL(3,2)`, `online_review_count INT`) — migration `324_add_product_review_aggregates.php`.

**Acceptance:**
- Customer with a `completed` order can review a purchased product.
- Cannot review a non-purchased product (403).
- Cannot review same product twice (409).
- Edit after 7 days rejected (410).
- Aggregates update correctly on approve/reject/delete.

---

## M7 — SMA staff UI additions

**Goal:** staff can manage online orders and reviews from SMA without learning anything new; no staff retraining required.

**Tasks:**
1. **Sales list filter** — modify `application/controllers/Sales.php::index()` and its view to include an `online_status` filter dropdown in the existing filter bar. Add a column or badge showing `online_status` and a red "Cancel requested" badge when `online_cancellation_requested_at IS NOT NULL`.
2. **Sale edit page** — modify `application/controllers/Sales.php::edit()` + view:
   - If `online_status IS NOT NULL`: render an "Online order status" panel with:
     - Status dropdown (current + allowed transitions per spec §6 item 2)
     - Cancel reason field (required for `cancelled`/`rejected`)
     - "Send email notification" checkbox (default checked)
   - On save: update `online_*` columns, append `sma_online_status_log`, conditionally fire matching email, and for `cancelled`/`rejected` call `Sales_model::cancelOnlineSale()`.
3. **Online Ordering settings page** — new controller `application/controllers/Online_settings.php` + view:
   - Sidebar entry under Settings, admin only.
   - Form to edit the single `sma_online_settings` row.
   - Hours editor: 7 rows (Sun–Sat), each with closed checkbox + open/close time pickers.
   - Force-close toggle (`enabled`).
4. **Reviews moderation page** — new controller `application/controllers/Reviews.php` + views:
   - Sidebar entry.
   - Tabs: Pending / Approved / Rejected / All.
   - Row actions: Approve, Reject (with reason modal), View product.
   - Permission gate: `reviews-index` to view, `reviews-moderate` to act.
5. **Permission UI** — update the existing Groups edit view so the two new columns (`reviews-index`, `reviews-moderate`) render as checkboxes.

**Acceptance:**
- Admin can end-to-end manage an online order and emails fire correctly.
- Non-admin roles see only what their permissions allow.
- Existing Sales / Sale Edit workflows for non-online sales continue to work untouched.

---

## M8 — React customer app wire-up

**Goal:** the existing React customer app runs against the real API, not mocks, and implements every flow in spec §5.

**Tasks:**
1. Replace `apps/web/src/data/api.ts` mock functions with real `fetch` wrappers. Add an `axios`-style interceptor for JWT attachment + 401-triggered refresh.
2. Add a `useApi` hook + typed endpoints matching spec §4.
3. Auth screens (spec §5.1):
   - Rework `CustomerAuth.tsx` from phone-OTP to email/password.
   - New `Signup`, `VerifyEmail`, `ForgotPassword`, `ResetPassword` screens.
   - Remove Firebase phone-OTP code path (keep `firebase.ts` for potential future reuse; no active imports).
4. Menu page (§5.2):
   - Status banner driven by `/settings/public`.
   - Featured carousel.
   - Star rating + count on card.
   - Delivery toggle disabled with "Coming soon".
   - Out-of-stock disabled state.
5. Product detail drawer: gallery, `product_details` HTML render (via `dangerouslySetInnerHTML` on server-sanitized content), variants, reviews list with pagination.
6. Cart + checkout (§5.3): ASAP / scheduled toggle with constrained date-time picker, pickup outlet card, cash-on-pickup info, place order.
7. Order confirmation, orders list, order detail (§5.4–§5.5):
   - Polling every 15s on detail page.
   - Timeline visualization.
   - Cancel / Request cancellation buttons per window logic.
   - Reorder button — uses `/orders/:id` data + current product availability to decide which items can enter the cart.
   - "Rate your order" section on `completed` orders via `/orders/:id/reviewable` + `POST /reviews`.
8. Profile (§5.6): edit fields, change password, my reviews (list/edit/delete), sign out.
9. Error and empty states (§5.7).
10. Remove the unused staff/kitchen pages from the React app build (the existing `pages/staff/*` and `pages/kitchen/*` are not in Option X scope). Either delete or gate behind a build flag — decide by reading `App.tsx` and trimming routes.

**Acceptance:**
- Full customer flow runs against staging API with no mocks.
- All error states handled with user-friendly messages.
- No Firebase calls active in the build.
- Staff + Kitchen routes removed from the customer bundle.

---

## M9 — Transactional emails

**Goal:** every state transition and auth event delivers a reliable email.

**Tasks:**
1. Implement remaining 10 templates (3 done in M3): `order-placed`, `order-ready`, `order-completed`, `order-cancelled-by-customer`, `order-cancelled-by-staff`, `order-rejected`, `cancellation-requested`, `review-approved`, `review-rejected`. HTML + plain-text versions.
2. Standard layout header/footer with Bistro Central branding + physical pickup address.
3. Locale: English subject lines, Asia/Dhaka times, BDT-formatted totals. (Bangla variants: not in v1.)
4. Wiring:
   - `order-placed` fires from M5 place endpoint.
   - `order-ready` / `order-completed` / `order-cancelled-by-staff` / `order-rejected` fire from M7 sale-edit save (when notification checkbox is checked).
   - `order-cancelled-by-customer` fires from M5 cancel endpoint.
   - `cancellation-requested` fires from M5 request-cancellation endpoint, `To:` is a new `sma_online_settings.staff_notify_email` field — add migration `325_add_staff_notify_email.php`.
   - `review-approved` / `review-rejected` fire from M7 reviews moderation save.
5. Deliverability audit:
   - Verify SPF, DKIM, DMARC records on the sending domain.
   - Send test emails to Gmail, Yahoo, Outlook, ProtonMail from the VPS SMTP; verify inbox placement (not spam).
   - If deliverability poor: document a phase-2 switch to a relay (Mailgun / SES / BulkSMSBD's email product) — a single-config change in `config/email.php`.

**Acceptance:**
- Every event produces the correct email to the right recipient.
- Inbox placement > 90% on the top 3 BD consumer providers.
- Email bodies render correctly in Gmail web, Outlook.com, Apple Mail.

---

## M10 — Staging end-to-end QA

**Goal:** prove the full flow works on a staging copy of production before any customer touches it.

**Test script (run as a checklist; fail any box = block rollout):**

1. **Auth happy path**
   - [ ] Signup → verification email arrives within 60s
   - [ ] Click verify link → success screen
   - [ ] Log in → redirected to menu
   - [ ] Log out → back to login
2. **Auth edge cases**
   - [ ] Signup with existing email → clear error
   - [ ] Login before verification → 403 with resend action
   - [ ] Forgot password → reset link works, old password fails, old refresh token rejected
   - [ ] 11 failed logins in 1 min → 429 lockout
3. **Menu**
   - [ ] Admin hides a product → it disappears from menu within 5 min (or immediately after cache bust)
   - [ ] Admin features a product → it appears in Featured carousel
   - [ ] Closed hours → menu shows closed banner, checkout disabled
   - [ ] Force-close toggle → same
4. **Ordering happy path**
   - [ ] Add items, checkout ASAP, place order
   - [ ] `sma_sales` row created correctly with `online_status='placed'`, reference `ON/...`
   - [ ] `sma_sale_items` matches cart exactly
   - [ ] `sma_costing` rows created (FIFO debit)
   - [ ] `sma_payments` NOT inserted
   - [ ] Customer receives `order-placed` email
   - [ ] Staff sees order in SMA Sales list with badge
   - [ ] Staff marks `ready` → customer gets email, UI updates within 15s poll
   - [ ] Staff marks `completed` → payment row inserted, customer gets email
5. **Ordering edge cases**
   - [ ] Schedule a future pickup → order shows correct `online_pickup_time`
   - [ ] Place with out-of-stock item → 400 with clear error
   - [ ] Place outside hours → 400
   - [ ] Place with tampered total → server total used; no error leaked
6. **Cancellation**
   - [ ] Customer cancels within 5 min → inventory reversed, emails fire, sale status cancelled
   - [ ] Customer attempts cancel after 5 min → button shows "Request cancellation", email to staff, no state change
   - [ ] Staff cancels → inventory reversed, customer emailed
   - [ ] Staff rejects → inventory reversed, customer emailed
7. **Reviews**
   - [ ] After completed order, customer can rate purchased items
   - [ ] Submitted review is `pending` — not visible on product page
   - [ ] Staff approves → visible, aggregate updates
   - [ ] Customer edits within 7d → status back to pending, aggregate excludes it until re-approval
   - [ ] Customer attempts review on non-purchased product → 403
8. **Reorder**
   - [ ] Reorder with all items available → cart populated
   - [ ] Reorder where one item is hidden → skipped with toast
   - [ ] Reorder where one item is out-of-stock → skipped and blocked with toast
9. **Accounting spot-check**
   - [ ] Run SMA daily sales report — online sales appear correctly attributed to Bistro Online biller
   - [ ] Run profit report — FIFO cost basis matches cost of goods for online items
   - [ ] Run outstanding AR — online orders in `placed`/`ready` appear as receivables
   - [ ] After `completed`, AR clears and cash is recorded

**Acceptance:** every checkbox passes on staging. Document any known deviations.

---

## M11 — Production rollout (P0 → P3 per spec §8.2)

**Tasks:**
1. **Pre-flight:**
   - Full DB snapshot (`mysqldump --single-transaction`), retained 90 days.
   - Staging ran for at least 5 days with no regressions reported.
   - Email deliverability passing (M9).
2. **P0 — code deploy, feature dark:**
   - Apply all migrations on production.
   - Deploy SMA changes, React app to Nginx.
   - `sma_online_settings.enabled = 0`.
   - Admin logs in, configures outlet / biller / customer group / hours / sender email.
   - Smoke-test with a single staff account: place a test order with `enabled=1` briefly, then set `enabled=0`.
3. **P1 — internal testing (2–3 days):**
   - `enabled=1`, announced only to staff.
   - Staff each place at least one real order from their phone, walk through the full cycle, report friction.
4. **P2 — soft launch (1 week):**
   - Restrict hours to 2–4 hrs/day in the schedule.
   - Share link with a small customer cohort (e.g., regulars via in-store flyer).
   - Monitor: error logs, email bounce rate, kitchen capacity, FIFO accuracy.
   - Daily reconciliation: online sales total vs cash collected on pickups.
5. **P3 — full launch:**
   - Open full hours.
   - Marketing push.
6. **P4 — post-launch polish (backlog):**
   - Analytics funnels.
   - Service worker / push notifications.
   - bKash/Nagad online payment (if warranted).
   - Loyalty points on online orders.
   - Bangla email variants.

**Rollback:**
- Any P0–P2 incident: flip `enabled=0`. Customer app shows "Coming soon".
- Data-level incident: restore from pre-migration snapshot (last resort — loses any orders placed in the meantime).

---

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Email deliverability low from VPS | Medium | High (customers never see verify/status) | M9 audit; plan relay swap |
| SMA's `Sales_model::addSale()` behaves differently when called from the API than from POS | Low | Very high (silent data corruption) | M5 integration tests that compare the resulting sale row byte-for-byte with a POS-produced equivalent |
| `cancelOnlineSale` leaves orphan costing rows | Medium | Medium (inventory drift) | Unit test covers full reversal; staging checklist item 4 catches it |
| SMA's CI3 session handling conflicts with the new JWT auth (shared cookies) | Low | Medium | Keep API endpoints at `/api/v1/*` with no session cookie dependence; no `$this->session` in API controllers |
| Rate limits tuned too aggressively, block real users | Medium | Low | Tune in P1; alert on 429 rates |
| Menu cache stale after product update | Low | Low | Invalidate on any product save; 5-min TTL as backstop |
| Customers confused by "Cash on pickup" expectation | Medium | Low | Explicit copy on checkout + confirmation + email |

---

## Estimated effort (rough, for one developer)

| Milestone | Days |
|---|---|
| M0 | 1 |
| M1 | 2 |
| M2 | 2 |
| M3 | 3 |
| M4 | 3 |
| M5 | 5 |
| M6 | 2 |
| M7 | 4 |
| M8 | 6 |
| M9 | 3 |
| M10 | 2 |
| M11 | buffer week |
| **Total** | **~33 days (6–7 weeks) for one developer; ~3–4 weeks for two working in parallel after M2** |

---

## Next step

Start on M0. Confirm production SMA PHP version + MySQL version so local Docker matches.
