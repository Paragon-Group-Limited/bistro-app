# Deployment Checklist

## Prerequisites

- VPS with PHP 7.x, MySQL/MariaDB, Apache or Nginx
- The existing Bistro Central SMA app already running
- SSH access to the VPS
- HTTPS configured (required for secure cookies and email links)

---

## Step 1: Backup

```bash
mysqldump -u root -p --single-transaction bistro > ~/bistro-backup-$(date +%Y%m%d).sql
```

Keep this backup for at least 90 days.

---

## Step 2: Deploy SMA backend files

Copy the following from the `online-ordering-feature` branch of the `bistro` repo to the production SMA installation. These are all **additive** — they don't overwrite existing functionality.

**New files (just copy):**
```
app/config/email.php
app/config/online_api.php
app/controllers/api/v1/*.php          (9 files)
app/controllers/cli/*.php             (3 files)
app/controllers/admin/Online_orders.php
app/controllers/admin/Online_settings.php
app/controllers/admin/Reviews_admin.php
app/core/MY_ApiController.php
app/libraries/Jwt_auth.php
app/libraries/Online_auth_lib.php
app/libraries/Online_mailer.php
app/libraries/Online_order_service.php
app/libraries/Rate_limit_lib.php
app/libraries/Menu_cache.php
app/models/Online_*.php               (5 files)
app/helpers/online_helper.php
app/migrations/317_*.php through 326_*.php
app/views/online_email/*.php          (12 templates)
themes/default/admin/views/online_orders/*.php
themes/default/admin/views/online_settings/*.php
themes/default/admin/views/reviews_admin/*.php
```

**Existing files that were modified (merge carefully):**
```
app/config/config.php        → added api/v1/.* to csrf_exclude_uris
app/config/migration.php     → migration_version bumped to 326
app/config/routes.php        → added 2 API route entries
app/controllers/Notify.php   → JSON 404 for api/v1/* paths
app/controllers/admin/Products.php → menu cache invalidation on save
app/core/MY_Controller.php   → fixed is_set → defined('SHOP') && SHOP
themes/default/admin/views/header.php → "Online Ordering" sidebar menu
index.php                    → ENVIRONMENT setting
```

---

## Step 3: Production configuration

These MUST be changed on the production server before going live.

### 3.1 — Set ENVIRONMENT to production

**File:** `index.php` line 46
```php
define('ENVIRONMENT', 'production');
```
This enables strict rate limits, suppresses PHP error display, and blocks dev-only CLI tools.

### 3.2 — Regenerate JWT secret

**File:** `app/config/online_api.php`
```bash
php -r "echo bin2hex(random_bytes(32));"
```
Paste the output as the `jwt_secret` value. This secret signs all customer auth tokens — if it leaks, anyone can impersonate any customer.

### 3.3 — Set customer app URL

**File:** `app/config/online_api.php`
```php
$config['customer_app_url'] = 'https://order.yourdomain.com';
```
This URL appears in every verification and password-reset email.

### 3.4 — Configure SMTP

**File:** `app/config/email.php`

Update `smtp_host`, `smtp_user`, `smtp_pass` for the production email sender. The sender address must match what's configured in Online Settings (step 6).

### 3.5 — Set production database credentials

**File:** `app/config/database.php`

Create a dedicated MySQL user (not root) with access only to the `bistro` database. Set the username and password.

### 3.6 — Hardcode base URL

**File:** `app/config/config.php` line 21
```php
$config['base_url'] = 'https://yourdomain.com/bistro/';
```
Do NOT use `$_SERVER['HTTP_HOST']` in production (host header injection risk).

### 3.7 — Enable secure cookies

**File:** `app/config/config.php`
```php
$config['cookie_secure'] = TRUE;    // requires HTTPS
$config['cookie_httponly'] = TRUE;   // prevents JS access to session cookies
```

---

## Step 4: Run database migrations

```bash
cd /path/to/bistro
php index.php cli/migrate/run
```

Expected output: `OK. Current migration version: 326`

This creates 6 new tables, adds columns to sales/products/permissions, and seeds the "Bistro Online" biller + "Online Customer" group.

---

## Step 5: Deploy customer app

Build the React app (already built in `bistro-app/dist/`):
```bash
cd bistro-app
npm run build
```

Copy `dist/` contents to the web server. Configure Nginx to serve it:

```nginx
server {
    listen 443 ssl;
    server_name order.yourdomain.com;

    root /var/www/bistro-online;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API to SMA backend
    location /api/ {
        proxy_pass http://127.0.0.1/bistro/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Proxy product images
    location /uploads/ {
        proxy_pass http://127.0.0.1/bistro/assets/uploads/;
    }

    # SSL config (adjust paths)
    ssl_certificate     /etc/letsencrypt/live/order.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/order.yourdomain.com/privkey.pem;
}
```

---

## Step 6: Configure online ordering in SMA admin

1. Log in to SMA admin
2. Sidebar → **Online Ordering → Online Settings**
3. Set:
   - **Enabled**: checked
   - **Pickup outlet**: select the warehouse
   - **Biller**: select "Bistro Online"
   - **Customer group**: select "Online Customer"
   - **Opening hours**: set real hours per day
   - **From email**: the production sender address (must match SMTP user)
   - **Staff notify email**: manager's email for cancellation alerts
4. Save

---

## Step 7: Staged rollout

| Phase | What | Duration |
|---|---|---|
| P1 — Internal | Staff test with `enabled=1`, restricted hours | 2–3 days |
| P2 — Soft launch | Share link with regulars, 2–4 hrs/day | 1 week |
| P3 — Full launch | Open full hours, marketing push | Ongoing |

Monitor during P1/P2:
- `app/logs/` for PHP errors
- Email bounce rate
- Daily reconciliation: online order totals vs cash collected

---

## Rollback

**Instant**: Set `enabled=0` in Online Settings. Customer app shows "Closed" immediately.

**Code rollback**: Revert the file changes. The new tables remain in the DB but are harmless (nothing references them from the existing SMA code).

**Data rollback**: Restore from the backup taken in Step 1 (last resort — loses orders placed since backup).
