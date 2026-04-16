# Customer Online Ordering — Design Spec

**Date:** 2026-04-16
**Status:** Approved (pending user review of written spec)
**Approach chosen:** Option X — keep existing SMA (Bistro Central) PHP/CodeIgniter 3 backend and MySQL schema untouched; add a customer-facing online ordering channel on top, with menu curation continuing to happen inside the existing SMA admin UI.

Companion reference: `BISTRO_FEATURE_STUDY.md` (root of this repo) — full feature and schema study of the existing SMA-based Bistro Central app.

---

## 1. Scope

**In scope (v1):**

- Customer-facing online ordering web app (React, already scaffolded at `apps/web`).
- Pickup-only fulfillment. Delivery UI present but disabled with a "Coming soon" label.
- Menu driven by existing `sma_products.hide` flag (no new "online visible" flag; reuses what admin already toggles).
- Single pickup outlet: **Bistro Central Mohakhali Branch**.
- Customer auth: email + password, email verification, forgot-password flow.
- Payment: cash on pickup only. No gateway integration.
- Pickup timing: ASAP and scheduled (bounded by opening hours + min prep time + max days ahead).
- Order lifecycle: `placed` → `ready` → `completed`, plus `cancelled` (customer) and `rejected` (staff). Transactional email on every transition.
- Customer cancel within 5 minutes of placing; after that, "Request cancellation" (badge-notifies staff in SMA).
- Schedule-driven open/close with manual force-close override by staff.
- Ratings and reviews on products (post-purchase only, one per customer per product, 7-day edit window, staff moderation).

**Not in scope (v1, deferred):**

- Delivery flow (UI stub only).
- Online payment gateways (bKash / Nagad / SSLCommerz / Stripe).
- Push notifications / service worker web push.
- Loyalty points on online orders (SMA has `award_point` fields — wire in phase 2).
- Staff UI redesign — SMA admin UI stays as it is; only targeted additions are made (see §3.4).
- Full data migration or schema normalization — the old schema stays.

---

## 2. System architecture

```
[Customer browser] ──HTTPS──▶ [Nginx] ──▶ /api/v1/*  ──▶ [SMA PHP (CI3)]
                                  │                        │
                                  └──▶ / (static)          └──▶ [MySQL 5.7+]
                                       │                        ▲
                                       └─ React customer app    │
                                                                │
[Staff browser] ──HTTPS──▶ [Nginx] ──▶ /staff ──▶ [SMA PHP] ────┘
                                                  (existing UI, mostly unchanged)
```

**Components:**

| Component | Role | Where it lives |
|---|---|---|
| React customer app | Menu, cart, checkout, orders, profile, reviews | `apps/web` (existing; repointed at new API) |
| PHP REST API | Customer-side endpoints | New CI3 module: `application/controllers/api/v1/*` |
| PHP staff UI additions | Online-orders filter, sale-edit status dropdown, online-settings page, reviews moderation | Targeted additions inside existing CI3 views/controllers |
| MySQL | Single DB — existing SMA tables + a few new ones + additive columns | Existing DB |
| Nginx | TLS termination, static file serving, reverse proxy | VPS |
| Email | Transactional mail (verification, state transitions, moderation) | SMA's existing PHP Mailer / SMTP config |

No new services. No new daemons. One codebase (SMA) gains a new module; the React app is built to static files and served by the same Nginx.

**Reference number:** online orders use a new prefix `ON` via `sma_order_ref` (e.g., `ON/2026/04/00042`), so they're visually distinguishable from `SO`, `POS`, etc.

---

## 3. Data model

### 3.1 New tables

#### `sma_online_customers`

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK auto | |
| `email` | VARCHAR(128) UNIQUE NOT NULL | login identity |
| `password_hash` | VARCHAR(255) NOT NULL | bcrypt, cost ≥ 12 |
| `email_verified_at` | DATETIME NULL | null until verified |
| `verification_token` | VARCHAR(64) NULL | emailed on signup; cleared on verify |
| `verification_sent_at` | DATETIME NULL | rate-limit resends (1/min) |
| `reset_token` | VARCHAR(64) NULL | emailed on forgot-password |
| `reset_token_expires_at` | DATETIME NULL | typically +1h |
| `full_name` | VARCHAR(100) NOT NULL | |
| `phone` | VARCHAR(20) NOT NULL | for staff contact on pickup |
| `company_id` | INT FK → `sma_companies.id` NULL | created lazily on first successful order |
| `last_login_at` | DATETIME NULL | |
| `created_at` | DATETIME NOT NULL | |
| `updated_at` | DATETIME NOT NULL | |

Indexes: `email` (unique), `verification_token`, `reset_token`, `company_id`.

#### `sma_online_settings` (single-row, id always 1)

| Column | Type | Notes |
|---|---|---|
| `id` | TINYINT PK | always `1` |
| `enabled` | TINYINT(1) DEFAULT 1 | manual force-close switch |
| `pickup_warehouse_id` | INT FK → `sma_warehouses.id` | Bistro Central Mohakhali Branch |
| `pickup_biller_id` | INT FK → `sma_companies.id` | new "Bistro Online" biller |
| `pickup_customer_group_id` | INT FK → `sma_customer_groups.id` | new "Online Customer" group (0% adjustment) |
| `pickup_price_group_id` | INT FK → `sma_price_groups.id` NULL | NULL = default pricing |
| `scheduled_hours` | JSON | `[{day:0..6, open:"HH:MM", close:"HH:MM", closed:bool}, ...]`, day 0 = Sunday |
| `min_prep_minutes` | INT DEFAULT 20 | minimum lead time |
| `max_scheduled_days_ahead` | INT DEFAULT 2 | farthest a customer can schedule |
| `customer_cancel_window_minutes` | INT DEFAULT 5 | |
| `from_email` | VARCHAR(128) NOT NULL | transactional email sender |
| `from_name` | VARCHAR(100) NOT NULL | |

#### `sma_online_reviews`

| Column | Type | Notes |
|---|---|---|
| `id` | INT PK auto | |
| `online_customer_id` | INT FK → `sma_online_customers.id` | |
| `product_id` | INT FK → `sma_products.id` | |
| `sale_id` | INT FK → `sma_sales.id` | proof-of-purchase |
| `rating` | TINYINT | 1–5 |
| `comment` | TEXT NULL | |
| `status` | ENUM('pending','approved','rejected') DEFAULT 'pending' | |
| `moderated_by` | INT NULL | SMA staff user id |
| `moderated_at` | DATETIME NULL | |
| `rejection_reason` | VARCHAR(255) NULL | |
| `edited_at` | DATETIME NULL | set when customer edits (also resets `status` to `pending`) |
| `created_at` | DATETIME NOT NULL | |
| `updated_at` | DATETIME NOT NULL | |

Unique index `(online_customer_id, product_id)` — enforces one review per customer per product.
Index `(product_id, status)` — fast lookup of approved reviews per product.

#### `sma_online_status_log` (append-only audit)

| Column | Type | Notes |
|---|---|---|
| `id` | BIGINT PK auto | |
| `sale_id` | INT FK → `sma_sales.id` | |
| `from_status` | VARCHAR(20) NULL | |
| `to_status` | VARCHAR(20) NOT NULL | |
| `actor_type` | ENUM('customer','staff','system') | |
| `actor_id` | INT NULL | customer id or SMA user id |
| `reason` | VARCHAR(255) NULL | |
| `created_at` | DATETIME NOT NULL | |

### 3.2 Additive columns on `sma_sales`

NULL on all existing rows (non-online sales). No backfill needed.

| Column | Type | Notes |
|---|---|---|
| `online_status` | ENUM('placed','ready','completed','cancelled','rejected') NULL | |
| `online_pickup_time` | DATETIME NULL | ASAP = `created_at + min_prep_minutes`; scheduled = explicit |
| `online_pickup_is_asap` | TINYINT(1) NULL | preserves "ASAP" label even after time passes |
| `online_cancel_reason` | VARCHAR(255) NULL | |
| `online_customer_id` | INT FK → `sma_online_customers.id` NULL | |
| `online_status_updated_at` | DATETIME NULL | |
| `online_status_updated_by` | INT NULL | SMA user id (staff) or customer id (customer cancel) |
| `online_cancellation_requested_at` | DATETIME NULL | set by POST `/orders/:id/request-cancellation` |

Index: `online_status` (fast filter on SMA's sales list).

### 3.3 How an online sale maps into existing SMA tables

When a customer places an order, the API calls SMA's existing `Sales_model::addSale()` so all downstream effects are identical to a POS sale:

- `sma_sales`: one row, `warehouse_id` = online pickup warehouse, `biller_id` = Bistro Online biller, `customer_id` = the customer's `sma_companies.id` (created lazily on first order), `sale_status='pending'`, `payment_status='pending'`, plus the new `online_*` columns populated.
- `sma_sale_items`: one row per cart line — identical shape to POS items, using the selected price group / tax / service charge.
- `sma_costing`: FIFO debits happen automatically via `Sales_model::addSale()`.
- `sma_payments`: **not** inserted at order time. Payment row is inserted when staff move the order to `completed` (`paid_by='cash'`, amount = total). Until then, the sale shows as an outstanding receivable — this is correct given cash-on-pickup.
- `sma_order_ref`: new `on` type entry provides `ON/YYYY/MM/NNNNN` references.

**Customer cancel reverses inventory** — calls a new thin wrapper `Sales_model::cancelOnlineSale($sale_id)` that (a) deletes the costing rows for this sale, (b) reverses warehouse stock, (c) sets `online_status='cancelled'`, `sale_status='cancelled'`, (d) preserves the sale row for reporting.

### 3.4 Seed data applied on launch

- `sma_companies`: new row `group_name='biller'`, `name='Bistro Online'`.
- `sma_customer_groups`: new row `name='Online Customer'`, `percent=0`.
- `sma_order_ref`: new row with `ref` prefix `on`.
- `sma_permissions`: 2 new boolean columns — `reviews-index`, `reviews-moderate` — defaulted to 1 for admin + manager groups only.
- `sma_online_settings`: one row with `enabled=0` initially; admin sets `enabled=1` at launch.

---

## 4. API surface

All endpoints under `/api/v1/`. JSON request/response. JWT in `Authorization: Bearer <token>` except the Public group. Rate-limited per IP and per email as noted.

### 4.1 Public (no auth)

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/signup` | `{email, password, full_name, phone}` → creates `sma_online_customers`, sends verification email, 202 |
| GET | `/auth/verify?token=…` | marks verified, 200 or 410 |
| POST | `/auth/resend-verification` | `{email}` → 200 (1/min/email) |
| POST | `/auth/login` | `{email, password}` → 200 `{access_token, refresh_token, customer}` / 401 / 403 (unverified) / 429 (locked) |
| POST | `/auth/forgot-password` | `{email}` → always 200 (avoid email enumeration) |
| POST | `/auth/reset-password` | `{token, new_password}` → 200 or 410 |
| POST | `/auth/refresh` | `{refresh_token}` → new access token |
| GET | `/menu/categories` | categories with at least one visible product |
| GET | `/menu/products` | `hide=0`; supports `?category_id=&search=&featured=1&page=` |
| GET | `/menu/products/:id` | incl. `product_details` HTML, gallery from `sma_product_photos`, variants, combo items, `avg_rating`, `review_count` |
| GET | `/menu/products/:id/reviews` | paginated approved reviews |
| GET | `/settings/public` | `{enabled, hours, is_open_now, next_open_at, pickup_address, min_prep_minutes, max_scheduled_days_ahead, customer_cancel_window_minutes}` |

### 4.2 Customer (auth required)

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/logout` | revokes refresh token |
| GET | `/profile` | current customer |
| PATCH | `/profile` | update name, phone, default address |
| POST | `/profile/change-password` | `{old, new}` |
| GET | `/orders` | list my orders, newest first, paginated |
| GET | `/orders/:id` | detail incl. items + status + timestamps |
| POST | `/orders` | **place order** — validates hours, stock, lead time, price group; creates sale via `Sales_model::addSale()`; emails customer; returns 201 |
| POST | `/orders/:id/cancel` | customer cancel within window → reverses inventory, emails customer + staff |
| POST | `/orders/:id/request-cancellation` | outside window → sets `online_cancellation_requested_at`, emails staff (no state change) |
| GET | `/orders/:id/reviewable` | items in this completed order the customer hasn't yet reviewed |
| POST | `/reviews` | `{product_id, sale_id, rating, comment?}` — validates purchase + one-per-customer-per-product |
| GET | `/reviews/mine` | list my reviews |
| PATCH | `/reviews/:id` | only owner, only within 7 days of creation, resets `status` to `pending` |
| DELETE | `/reviews/:id` | only owner, any time |

### 4.3 Order validation rules (POST `/orders`)

1. `online_settings.enabled = 1`
2. Either `is_asap=true` **and** `now` is within today's open window **and** today is not marked closed
   **or** `scheduled_at` is:
   - in the future
   - ≥ `now + min_prep_minutes`
   - ≤ `now + max_scheduled_days_ahead` days
   - falls within an open window on that day
3. Every `product_id` exists, is `hide=0`, and `stock_at_pickup_warehouse ≥ ordered_qty` (**strict** — overriding SMA's `overselling=1` for online only)
4. Every `quantity` is a positive integer
5. Server recomputes totals (subtotal, tax, service charge, grand total) — client-supplied total is ignored/used only for display validation

### 4.4 Auth, rate limits, security

- JWT: access 30 min, refresh 7 days. Refresh tokens stored hashed server-side; revoked on logout and password change.
- bcrypt cost ≥ 12.
- Rate limits: login 10/min/IP, signup 3/hr/IP, forgot-password 3/hr/email, resend-verification 1/min/email, place-order 30/hr/customer.
- Input validation via CI3 `form_validation`. SQL via CI3 query builder (no string concat).
- `product_details` HTML sanitized on output (allow-list tags) — defensive, even though it's admin-authored.
- CSRF not required for the API (JWT in header, not cookies). SMA's staff UI CSRF stays as-is.

---

## 5. Customer app UI

Existing React app in `apps/web` (routes: `/`, `/orders`, `/order-confirmed`, `/profile`, `/login`). Work is mostly repointing mock API calls at `/api/v1/*` and wiring the new flows.

### 5.1 Auth

- **Signup**: email, password, confirm, full name, phone → "Check your email" state with throttled Resend.
- **Email verification**: lands at `/verify?token=…` → success → login.
- **Login**: handles 401, 403 (unverified, with resend link), 429 (lockout).
- **Forgot password** + **reset password**: standard flow.

### 5.2 Menu (`/`)

- Header status strip:
  - Closed (schedule): red — "Closed — reopens at 11:00 AM tomorrow"
  - Force-closed: red — "Temporarily not accepting orders"
  - Open: green with pickup address
- Category tabs, search, product grid.
- Featured carousel at top (`featured=1`).
- Product card: name (English + Bangla fallback), BDT price, image (`products.image` or placeholder), star rating + review count, Add button (disabled "Out of stock" if 0 at pickup outlet).
- Product detail drawer: image gallery (`sma_product_photos`), `product_details` HTML, variants, quantity stepper, note, Add to cart. Reviews list below description (paginated).
- Cart drawer (right on desktop, bottom sheet on mobile): items, subtotal, tax, service charge, total.
- Delivery toggle disabled + "Coming soon" badge.

### 5.3 Checkout

- Cart summary.
- Pickup time: radio "ASAP (ready in ~20 min)" / "Schedule for later" (date-time picker constrained to open hours + lead time + max days).
- Pickup outlet: read-only card with Bistro Central Mohakhali Branch name + address + map link.
- Payment: "Pay with cash on pickup" (informational).
- Optional order note.
- Place order → POST `/orders` → `/order-confirmed?id=…`.

### 5.4 Order confirmation (`/order-confirmed`)

- Reference (`ON/2026/04/00042`), pickup time, outlet + map.
- Itemized summary + total.
- "View order status" → `/orders/:id`.
- "You will receive an email at each stage."

### 5.5 Orders

- **List**: newest first, status badge, reference, total, pickup time.
- **Detail**:
  - Live status (poll every 15s).
  - Timeline `Placed → Ready → Completed` with fill-in.
  - `cancelled` / `rejected` — show reason.
  - If within 5-min window and `placed`: Cancel order (confirmation dialog).
  - If past window and `placed` or `ready`: Request cancellation.
  - Reorder button — copies items into cart, skipping unavailable (hidden/deleted/out-of-stock at pickup outlet) with a toast. Out-of-stock items are **blocked** from entering the cart.
  - For `completed` orders: "Rate your order" section listing reviewable items with inline star picker + comment.

### 5.6 Profile

- Email (read-only), name, phone, default address (captured for future delivery).
- Change password.
- My reviews (list + edit within 7d + delete).
- Sign out.

### 5.7 Edge states

- Empty cart: illustration + "Browse menu".
- No orders yet: illustration + "Place your first order".
- Network error on order: toast + preserve cart.
- Stale product in cart (hidden/deleted/out-of-stock since added): warn on checkout, remove from cart.

---

## 6. Staff-side additions inside SMA

Minimal, targeted. Four touches:

1. **Sales list filter** — add an `online_status` filter dropdown to the existing Sales list. Orders with non-null `online_status` show a badge; orders with `online_cancellation_requested_at` set show a red "Cancel requested" badge.
2. **Sale edit page** — when editing a sale with non-null `online_status`, show:
   - Status dropdown (`placed` / `ready` / `completed` / `cancelled` / `rejected`)
   - Cancel reason text box (required for `cancelled` / `rejected`)
   - "Send email notification" checkbox (checked by default)
   - Save — updates `online_*` columns, appends to `sma_online_status_log`, fires matching email.
   - On `cancelled` or `rejected`: same inventory reversal as customer cancel — calls `Sales_model::cancelOnlineSale($sale_id)` so `sma_costing` is reversed and warehouse stock is restored. Forward and backward transitions between `placed` ↔ `ready` are allowed and leave inventory untouched. Moving back from `completed` is blocked (payment row already written).
3. **Online Ordering settings page** (new sidebar entry under Settings, admin only) — edits the single `sma_online_settings` row: enabled toggle, outlet, biller, customer group, price group, hours grid (day × open/close/closed), prep/lead/cancel windows, sender email/name.
4. **Reviews moderation page** (new sidebar entry, admin + manager by permission) — queue of pending reviews with Approve / Reject (with reason) actions, plus history filters.

Permission keys added: `reviews-index`, `reviews-moderate`. Online settings reuse `settings-index` / `settings-update` since SMA already has those.

---

## 7. Transactional emails

Fired via SMA's existing PHP Mailer. Templates:

| Trigger | Template | Recipient |
|---|---|---|
| Signup | `verify-email` | Customer |
| Resend verification | `verify-email` | Customer |
| Forgot password | `reset-password` | Customer |
| Order placed | `order-placed` | Customer |
| Order moved to `ready` | `order-ready` | Customer |
| Order moved to `completed` | `order-completed` | Customer |
| Customer cancels (within window) | `order-cancelled-by-customer` | Customer |
| Staff cancels | `order-cancelled-by-staff` | Customer |
| Staff rejects | `order-rejected` | Customer |
| Customer requests cancellation (outside window) | `cancellation-requested` | Staff (to `online_settings.from_email` or a configurable staff address) |
| Review approved | `review-approved` | Customer |
| Review rejected | `review-rejected` | Customer |

All emails idempotent at the event level — if staff re-sends by unchecking and re-checking the notification box, the template re-fires; no dedupe keys. Deliverability is out of scope for v1; assume SMA's current SMTP path works. If it doesn't, a post-launch switch to a relay (Mailgun / SES / local BD provider) is a small swap inside `config/email.php`.

---

## 8. Migration and rollout

### 8.1 Database migrations (run in order, after full backup)

1. Create `sma_online_customers`.
2. Create `sma_online_settings` + seed row with `enabled=0`.
3. Create `sma_online_reviews`.
4. Create `sma_online_status_log`.
5. Add columns to `sma_sales`: `online_status`, `online_pickup_time`, `online_pickup_is_asap`, `online_cancel_reason`, `online_customer_id`, `online_status_updated_at`, `online_status_updated_by`, `online_cancellation_requested_at`.
6. Add 2 columns to `sma_permissions`: `reviews-index`, `reviews-moderate`; default 1 for admin + manager rows, 0 for others.
7. Insert seed rows: `sma_companies` biller `Bistro Online`, `sma_customer_groups` `Online Customer`, `sma_order_ref` type `on`.

Track via SMA's CI3 migrations (`sma_migrations`) — increment past current version 315.

### 8.2 Rollout phases

| Phase | Deliverable | Visibility |
|---|---|---|
| **P0** | DB migrations + PHP API + SMA staff additions + React app deployed, static | `enabled=0`; customer app shows "Coming soon" |
| **P1** | Internal testing — admin flips `enabled=1` briefly, staff walks the full flow end-to-end (signup → order → state transitions → review → moderation) | Staff-only |
| **P2** | Soft launch — limited hours (e.g., 2 hrs/day for a week), watch logs, tune | Real traffic |
| **P3** | Full launch — full hours, marketing | Full |
| **P4** | Post-launch polish: email deliverability audit, review prompt timing, analytics | — |

### 8.3 Backups and rollback

- Pre-migration snapshot (`mysqldump --single-transaction`) retained 90 days.
- Each migration has a paired down-migration. Rollback plan: `enabled=0`, reverse migrations in reverse order. The React app stays up but refuses checkout.

---

## 9. Non-functional requirements

- **Performance:** menu endpoint cached server-side (5 min TTL) invalidated on any product update. Product detail no cache (reviews are dynamic).
- **Timezone:** Asia/Dhaka everywhere server-side. API returns ISO-8601 with offset. React renders in user's local time.
- **Logging:** every `online_status` transition appended to `sma_online_status_log` (sale id, from, to, actor type, actor id, timestamp, reason).
- **Observability:** reuse SMA's existing error logging; add pino-style structured logs for the API module.
- **Security:**
  - bcrypt cost ≥ 12.
  - JWT access 30 min / refresh 7 days; refresh hashed server-side; revoked on logout + password change.
  - Rate limits per §4.4.
  - Input validation via `form_validation`; query builder for all SQL.
  - HTML sanitize `product_details` on render.
- **Accessibility:** product cards keyboard-navigable; stars have `aria-label`; form errors announced via `aria-live`.

---

## 10. Open items (handled at implementation time, not design time)

1. Which SMA **user/email** receives the "cancellation requested" notification — a fixed address on `sma_online_settings`, or a role broadcast? Default: fixed address.
2. **SMTP deliverability audit** before P2 soft launch — verify that mail from the VPS lands in customer inboxes (not spam) from common BD providers (Gmail, Yahoo, Outlook).
3. **Menu pagination threshold** — v1 fetches all; if catalog exceeds ~500 products, add `?page=` pagination. Non-blocking.
4. **Analytics** — post-launch, we'll want conversion funnels (views → add-to-cart → checkout → placed). Out of scope for v1.
5. **CORS** — API same-origin with React app (both served by the same Nginx), so no CORS headers needed. If ever split, add explicit allow-list.
6. **reCAPTCHA on signup/login** — not in v1; revisit if we see abuse after P3.

---

## 11. Acceptance criteria

P0 complete when:
- All migrations applied cleanly in a staging copy and rolled back cleanly.
- Admin can sign in to SMA, open "Online Ordering" settings, configure hours/outlet/biller/sender.
- Admin can toggle `enabled`.
- Admin can open a product in SMA admin, toggle "Hide in Shop", and see the change reflected on the customer menu within 5 minutes (cache TTL).
- Admin can open a sale with `online_status` and change it through every state, with emails firing and status log entries appended.
- Admin can moderate a review (approve + reject paths).

P1 complete when the full customer flow runs end-to-end on staging:
signup → verify email → browse menu → add to cart → checkout ASAP → place → receive email → staff marks ready → customer sees Ready → staff marks completed → payment row inserted → customer sees Completed → customer rates the product → staff approves review → review visible on product page.

P2 complete when soft launch runs for one full week with no data-corruption incidents, emails averaging < 5% bounce rate, and zero accounting discrepancies between SMA's reports and the orders placed online.

---
