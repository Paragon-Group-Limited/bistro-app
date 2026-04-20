# Production Deployment Guide

## Prerequisites

- VPS with PHP 7.x, MySQL/MariaDB, Apache/Nginx
- The existing Bistro Central SMA app already running
- SSH/SFTP access to the VPS
- A MySQL backup tool (mysqldump)

---

## Step 1: Backup production DB

```bash
mysqldump -u root -p --single-transaction --routines --triggers bistro > ~/bistro-pre-online-$(date +%Y%m%d).sql
```

Keep this file for at least 90 days.

---

## Step 2: Deploy SMA backend changes

Copy the entire `app/` and `themes/` directories from the committed `bistro` repo
(`C:\Users\rmahi\Desktop\My Apps\bistro\`) to the production SMA installation,
**merging** (not replacing) with existing files.

**New files to add** (these don't overwrite anything):
```
app/config/email.php              ← SMTP config (update password for production!)
app/config/online_api.php         ← JWT secret (REGENERATE for production!)
app/controllers/api/v1/*.php      ← 9 API controllers
app/controllers/cli/*.php         ← 3 CLI tools (optional, dev only)
app/controllers/admin/Online_orders.php
app/controllers/admin/Online_settings.php
app/controllers/admin/Reviews_admin.php
app/core/MY_ApiController.php
app/libraries/{Jwt_auth,Online_auth_lib,Online_mailer,Online_order_service,Rate_limit_lib,Menu_cache}.php
app/models/Online_*.php           ← 5 models
app/helpers/online_helper.php
app/migrations/317_*.php through 326_*.php
app/views/online_email/*.php      ← 11 email templates
themes/default/admin/views/online_orders/*.php
themes/default/admin/views/online_settings/*.php
themes/default/admin/views/reviews_admin/*.php
```

**Files that were modified** (merge carefully):
```
app/config/config.php             ← added api/v1/.* to csrf_exclude_uris
app/config/migration.php          ← bumped migration_version to 326
app/config/routes.php             ← added 2 API route rewrites
app/controllers/Notify.php        ← JSON 404 for api/v1/* paths
app/controllers/admin/Products.php ← menu cache invalidation on save
themes/default/admin/views/header.php ← "Online Ordering" sidebar menu
index.php                         ← ENVIRONMENT (set to 'production' for prod!)
```

### Critical production config changes

1. **`index.php`**: set `ENVIRONMENT` to `'production'` (NOT development!)

2. **`app/config/online_api.php`**: REGENERATE the JWT secret:
   ```bash
   php -r "echo bin2hex(random_bytes(32));"
   ```
   Paste the output as `jwt_secret`. Also set `customer_app_url` to your real domain.

3. **`app/config/email.php`**: update SMTP credentials for production sender.

---

## Step 3: Run migrations

SSH into the VPS, navigate to the SMA root directory:

```bash
cd /path/to/bistro
php index.php cli/migrate/run
```

Expected output: `OK. Current migration version: 326`

This creates 6 new tables + adds columns to sales/products/permissions + seeds data.

---

## Step 4: Deploy the React customer app

The production bundle is in `bistro-app/dist/`. Copy it to your web server.

**Option A — same Apache/Nginx** (recommended):
```bash
# Copy dist/ to a directory served by the same virtual host
scp -r dist/* user@vps:/var/www/bistro-online/
```

Nginx config (add a new `server` block or `location`):
```nginx
server {
    listen 80;
    server_name order.bistrocentral.com;  # your customer-facing domain

    root /var/www/bistro-online;
    index index.html;

    # SPA fallback — all routes resolve to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API calls to the SMA PHP backend
    location /api/ {
        proxy_pass http://127.0.0.1/bistro/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Proxy product images from SMA's uploads
    location /uploads/ {
        proxy_pass http://127.0.0.1/bistro/assets/uploads/;
    }
}
```

**Option B — subdirectory** (simpler, no separate domain):
```bash
scp -r dist/* user@vps:/var/www/bistro/shop/
```
Adjust `vite.config.ts` base to `/shop/` before building if using this route.

---

## Step 5: Bootstrap online settings

1. Log in to SMA admin
2. Go to **Online Ordering → Online Settings**
3. Configure:
   - **Enabled**: check
   - **Pickup outlet**: select the correct warehouse
   - **Biller**: select "Bistro Online"
   - **Customer group**: select "Online Customer"
   - **Hours**: set real opening hours
   - **From email**: production sender address
   - **Staff notify email**: manager's email for cancellation requests
4. Save

---

## Step 6: Internal test (P1)

1. Set `enabled = 1` in Online Settings
2. Staff sign up as a customer on the customer app
3. Walk through: signup → verify email → login → browse menu → add to cart → checkout → order appears in SMA admin → mark ready → mark completed → review → approve
4. Verify emails arrive

---

## Step 7: Soft launch (P2)

- Restrict hours to 2–4 hrs/day for the first week
- Share the link with a small customer cohort (regulars, via in-store flyer)
- Monitor:
  - `app/logs/` for PHP errors
  - Email bounce rate
  - Daily reconciliation: online sales total vs cash collected

---

## Step 8: Full launch (P3)

- Open full hours
- Marketing push

---

## Rollback

If anything breaks:
1. Set `enabled = 0` in Online Settings (instant — customer app shows "Closed")
2. If DB-level issue: restore from the backup taken in Step 1
3. If code-level issue: revert the file changes and restart Apache

---

## File inventory (41 new/modified files)

| Category | Count | Files |
|----------|-------|-------|
| Config | 5 | email.php, online_api.php, config.php, migration.php, routes.php |
| Migrations | 10 | 317–326 |
| API controllers | 9 | Auth, Health, Menu, Orders, Profile, Reviews, Settings, Smoke, Notfound |
| CLI controllers | 3 | Migrate, Mailtest, Devreset |
| Admin controllers | 3 | Online_orders, Online_settings, Reviews_admin |
| Modified controllers | 2 | Notify.php, Products.php |
| Core | 1 | MY_ApiController.php |
| Libraries | 6 | Jwt_auth, Online_auth_lib, Online_mailer, Online_order_service, Rate_limit_lib, Menu_cache |
| Models | 5 | Online_customers, Online_refresh_tokens, Online_orders, Online_menu, Online_reviews |
| Helpers | 1 | online_helper.php |
| Email templates | 11 | verify, reset, order_placed/ready/completed/cancelled_by_customer/cancelled_by_staff/rejected, cancellation_requested, review_approved/rejected |
| Admin views | 5 | online_orders/index+edit, online_settings/index, reviews_admin/index, header.php |
| React bundle | 3 | index.html, index-*.css, index-*.js |
