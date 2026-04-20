# Customer Online Ordering — What's New

This branch adds a customer-facing online ordering channel to the existing Bistro Central SMA system. Staff continue using the existing SMA admin as before — the only changes to SMA are additive (new pages, new API endpoints, new DB tables). Nothing existing was removed or modified in a breaking way.

## Customer App (React)

A standalone web app where customers can:

- **Sign up / log in** with email + password (email verification required)
- **Browse the menu** with category filters, search, and product detail modals
- **Add items to cart** with quantity picker and notes
- **Place pickup orders** (ASAP or scheduled) — cash on pickup
- **Track order status** in real time (polling every 15s): Pending → Preparing → Ready → Completed
- **Cancel orders** within a 5-minute window, or request cancellation after
- **Rate and review** products after order completion (1–5 stars + comment)
- **Manage their profile** and change password
- **Receive transactional emails** at every step (verification, order placed/preparing/ready/completed, cancellation, review moderation)

Tech stack: React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui, framer-motion.

## SMA Backend Changes

### New API (`/api/v1/*`)

A REST API module inside the SMA CodeIgniter codebase. 9 controllers, JWT-authenticated for customer endpoints, public for menu browsing:

- Auth (signup, verify, login, forgot/reset password, refresh, logout)
- Menu (categories, products, product detail, reviews)
- Orders (place, list, detail, cancel, request-cancellation, reviewable items)
- Reviews (create, edit, delete, list mine)
- Profile (change password)
- Settings (public hours/outlet info)
- Health check

### New Staff Admin Pages

Three new pages accessible under the "Online Ordering" sidebar menu (Owner/Admin/Bistro Manager):

- **Online Orders** — list with status filter + badges, manage page with status dropdown (Pending → Preparing → Ready → Completed / Cancel / Reject), email notification checkbox
- **Online Settings** — enable/disable toggle, pickup outlet, biller, customer group, price group, opening hours (Sun–Sat), prep time, scheduling window, cancel window, sender email
- **Reviews** — moderation queue with Pending/Approved/Rejected tabs, approve/reject with reason

### Database Changes (Migrations 317–326)

All additive — no existing tables or columns were modified.

| Migration | What it creates |
|---|---|
| 317 | `sma_online_customers` — customer accounts (email/password/phone) |
| 318 | `sma_online_refresh_tokens` — JWT refresh token store |
| 319 | `sma_online_settings` — single-row config for online ordering |
| 320 | `sma_online_reviews` — product reviews with moderation |
| 321 | `sma_online_status_log` — audit trail of order status changes |
| 322 | 8 new columns on `sma_sales` for online order tracking |
| 323 | 2 new columns on `sma_permissions` for review moderation |
| 324 | 2 new columns on `sma_products` for review aggregates |
| 325 | Seed data: "Bistro Online" biller, "Online Customer" group, `on` order ref prefix |
| 326 | `sma_api_rate_limits` — rate limiting for API endpoints |

### How Online Orders Flow Into SMA

Online orders use `Sales_model::addSale()` — the exact same code path as POS sales. This means:

- FIFO costing fires automatically
- Inventory decrements correctly
- Orders appear in SMA's existing sales reports
- Service charge (5%) applied identically to POS
- Reference numbers use `ON/YYYY/MM/NNNNN` format

Payment is recorded when staff marks the order "Completed" (cash on pickup).

### Email

12 transactional email templates via SMTP (Office 365 or any SMTP relay):

verify-email, reset-password, order-placed, order-preparing, order-ready, order-completed, order-cancelled-by-customer, order-cancelled-by-staff, order-rejected, cancellation-requested (to staff), review-approved, review-rejected.

In development, emails are also captured as `.eml` files in `app/logs/emails/`.
