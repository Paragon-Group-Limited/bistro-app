# Bistro Central — Feature & Database Study

> Source-of-truth reconstruction reference, compiled from: (1) UI screenshots of the deployed admin panel, (2) the full MySQL dump `bistro.sql` (~48 MB, 245k lines, ~64 tables with `sma_` prefix), and (3) inference of the upstream codebase. The GitHub repository `Paragon-Group-Limited/bistro` appears to be private (WebFetch not used in this pass), but the `sma_` table prefix, version string `3.4.12`, settings keys, permission matrix, and file conventions are a **near-exact fingerprint of Tecdiary Stock Manager Advanced (SMA) v3.x**, customised and rebranded into *"Bistro Central"* — a restaurant/POS management application for **Paragon Group / Bistro Central, Dhaka, Bangladesh** (currency BDT, timezone `Asia/Dhaka`).

---

## 1. Overview

**Bistro Central** is a multi-outlet restaurant & retail management web application with:

- Multi-warehouse / multi-biller inventory
- Full POS (touch-screen) module with register open/close, suspended bills, reward cards, gift cards
- Back-office sales, purchases, transfers, quotations, returns, repairs
- Customer, supplier, biller (outlet) master data with price groups & customer groups
- Expenses, deposits, payments, gift cards, reward/award points
- Role-based permission matrix (Owner, Admin, Customer, Supplier, Sales Staff, HR Admin, Bistro Manager, Accounts)
- Dashboard with month/year filters, category-wise & outlet-wise sales, YoY comparison
- Reports (stock, sales, purchases, profit/loss, staff, tax, register, expenses)
- Settings (company, currencies, tax rates, units, brands, categories, printers, POS shortcuts)

### Inferred technology stack

| Layer | Tech |
|------|------|
| Backend framework | PHP **CodeIgniter 3** (evidenced by `sma_sessions` CI session blob format with `__ci_last_regenerate` key, `sma_migrations(version)` single-column migrations table, varchar(40) `remember_code`, and Ion Auth groups/users/login_attempts schema) |
| Auth library | **Ion Auth** (`sma_users`, `sma_groups`, `sma_login_attempts`, bcrypt/sha1 40-char hashes with `salt`, `activation_code`, `forgotten_password_code`, `remember_code`) |
| Database | **MySQL / MariaDB**, InnoDB, utf8; table prefix `sma_` |
| Frontend | Bootstrap 3 theme + jQuery DataTables (evidenced by "Show [25] entries / Search" pattern, column sort arrows, Actions dropdowns) |
| PDF | dompdf (see `sma_settings.pdf_lib = 'dompdf'`) |
| POS | Browser + optional java applet for printer/cash-drawer (`sma_pos_settings.java_applet`) |
| Payments | Cash, Credit Card (CC), Cheque, PayPal, Skrill, Stripe, gift cards (toggles in `pos_settings`) |
| Version | Application self-reports **v3.4.12** (see `sma_settings.version`, `sma_pos_settings.version`) |
| Base product | **Tecdiary Stock Manager Advanced** (heavily customised: Bistro Central branding, Repair module, Service Charge, combo items, Food Panda / Hungry Naki / Kiosk / Cafe Central outlet tiles, Bangla/BDT localisation, extra roles `bistro_manager` / `hr_admin` / `accounts`) |

Identifiers on dashboard: `Bistro Central (v3.4.12)`, logo `Bistro_Central_Logo_w.jpg`, biller **"Bistro Central"** at *"5, Paragon House, 1st Floor, Mohakhali, Amtoli, Dhaka, BIN 00418914"*, phone `01844160444`.

---

## 2. Navigation & Modules

### 2.1 Top header (icon toolbar, coloured tiles — screenshot 1)

Left to right:

| Icon | Route | Purpose |
|---|---|---|
| Dashboard (speedometer) | `/admin` or `/admin/welcome` | Dashboard home |
| `$ SALES` (pink) | `/admin/sales` | Sales list |
| `REPAIRS` (blue wrench) | `/admin/sales?type=repair` | Repair jobs |
| Barcode (orange) | `/admin/products` | Products quick-jump |
| People (grey) | `/admin/customers` / `/suppliers` | Customers / Suppliers |
| Settings cog | `/admin/settings` | Settings |
| Calculator | built-in calculator popup |
| Calendar | `/admin/calendar` | Calendar / events |
| CSS/brand | theme toggle |
| Alert (yellow, badge **494**) | `/admin/products/quantity_alerts` | Low-stock alerts |
| **POS** (green) | `/admin/pos` | POS terminal |
| Hourglass (green) | Suspended bills |
| Heart (green) | Favourites / reward-card shortcut |
| List (blue) | Orders / today's sales |
| Eraser (red) | Clear / close register |
| Avatar | User menu: profile / change password / logout |

Header right: *"Your IP Address 192.168.3.250 (Last login at: 13/04/2026 11:24)"* → app records last IP and login timestamp per user.

### 2.2 Left sidebar (collapsible, screenshot 1)

1. **Dashboard**
2. **Products** (expandable)
   - List Products
   - Add Product
   - Import Products
   - Print Barcode/Label
   - Quantity Adjustments
   - Add Adjustment
   - Stock Counts
   - Count Stock
3. **Sales** (expandable)
   - List Sales
   - Management Sales
   - POS Sales
   - List Repair
   - Add Sale
   - Add Sale by CSV
   - Deliveries
   - List Reward Cards
4. **Quotations** (expandable — List / Add Quotation)
5. **Purchases** (expandable — List / Add / Add by CSV / Expenses / Expense Categories / Payments)
6. **Transfers** (List / Add / Add by CSV)
7. **Returns** (List Returns / Add Return / List Return Purchases / Add Return Purchase)
8. **People** (Customers, Suppliers, Billers, Users, Groups & Permissions, Price Groups)
9. **Notifications**
10. **Calendar**
11. **Settings** (Company / Site Settings, Currencies, Tax Rates, Warehouses, Categories, Sub-categories, Brands, Units, Variants, Printers, POS Settings, Backup)
12. **Reports** (Overview, Warehouse Stock, Quantity Alerts, Expiry Alerts, Product Reports, Daily/Monthly Sales, Sales Report, Payments, Purchases, Daily/Monthly Purchases, Profit & Loss, Customers, Suppliers, Staff, Register, Expenses, Tax)

Footer: `© 2026 Bistro Central (v3.4.12)`.

---

## 3. Feature Catalog

### 3.1 Dashboard (screenshot 2)

**Purpose:** executive summary of sales across outlets with month-level drill-down and category breakdown.

**UI elements:**
- Header: "Dashboard", IP & last-login line
- **Six KPI tiles** (clickable, each filtered by biller/outlet):
  - `TK 27,953,044` — **Total Sales** (all-time, all outlets)
  - `TK 2,100` — **Food Panda** (sales attributed to customer/biller "fOODPANDA")
  - `TK 75,704` — **PG Sale** (Paragon Group staff/director sales)
  - `TK 0` — **Café Central**
  - `TK 108,059` — **Kiosk Sale**
  - `TK 491,572` — **April** (current month total)
- **Month Wise Sale** bar chart (Apr-2025 → Apr-2026, 13 bars, Y axis "Quantity Wise Sale", series label "Sales In Bar")
- **Select Month** dropdown (defaults to April) — drives the rest of the page
- **Category grids** — one bar chart per category for the selected month, product-name vs qty sold. Categories visible: Appetizers, Brewed Steamed, Café Central, Chow Mein, Dessert, Dim Sum, Mains, Milkshakes, Rice, Kiosk, Salad, Sandwiches, Set Menu, Soups, Spritzers on the Rocks, Wraps (empty categories show "No data available for this month")
- **Category Wise Sales Amount** horizontal bar chart (top categories by revenue)
- **Previous Year Sales Compare** grouped bar chart (Jan–Dec, 2025 vs 2026)

**Related DB tables:** `sma_sales`, `sma_sale_items`, `sma_categories`, `sma_companies` (billers), `sma_warehouses`.

### 3.2 Products — List (screenshot 3)

Breadcrumb `Home / Products`. Heading "Products (All Stores)".

**Toolbar:** two view toggles (top-right: list view / barcode view), `Show [25]` entries selector, `Search` free-text box.

**Columns (sortable):**
| Col | Notes |
|---|---|
| ☐ (checkbox) | bulk-select row |
| **Image** | product thumbnail (or `no_image.png`) |
| **Code** | `sma_products.code` — numeric SKU (barcode) |
| **Name** | `sma_products.name` |
| **Brand** | `sma_brands.name` via `sma_products.brand` |
| **Category** | `sma_categories.name` |
| **Cost** | `sma_products.cost` (decimal) |
| **Price** | `sma_products.price` |
| **Quantity** | on-hand (often **negative** — overselling is enabled) |
| **Unit** | `sma_units.code` (e.g. `PC`) |
| **Alert Quantity** | reorder threshold |
| **Status** | coloured pill button → *Click To Active* (green) / *Click To Deactive* (red). Toggles `product_status` |
| **Actions** | dropdown: View / Edit / Delete / Duplicate / Print Barcode / Adjust Quantity / Add Variant |

Bottom-left: entries counter + bulk-action bar; bottom-right: DataTables pagination.

### 3.3 Products — Add Product (screenshot 4)

Breadcrumb `Home / Products / Add Product`. Two-column form.

**Left column (required marked *):**
- **Product Type*** — `Standard` / `Combo` / `Digital` / `Service` dropdown (`sma_products.type`)
- **Product Name***
- **Product Code*** — with a *shuffle* button to auto-generate barcode. Caption: *"You can scan your barcode and select the correct symbology below"*
- **Slug*** (URL slug, auto from name)
- **Secondary Name** (`second_name`, e.g. Bangla)
- **Weight (kg)**
- **Barcode Symbology*** — `Code128` (default), EAN-8, EAN-13, UPC, etc.
- **Brand** — dropdown from `sma_brands`
- **Category*** — from `sma_categories` (parent_id = 0)
- **Sub Category** — AJAX-loaded by parent
- **Product Unit*** — from `sma_units`
- **Default Sale Unit** / **Default Purchase Unit** (after unit chosen)
- **Product Cost***
- **Product Price***
- ☐ **Promotion** (toggles `promotion`, reveals `promo_price`, `start_date`, `end_date`)
- **Product Tax** — from `sma_tax_rates` (default "No Tax")
- **Tax Method** — `Exclusive` / `Inclusive`
- **Alert Quantity** (with green save-tick)
- **Product Image** — file browse (single)
- **Product Gallery Images** — file browse (multi → `sma_product_photos`)
- ☐ **Featured** (shop homepage listing)
- ☐ **Hide in POS Module** (`hide_pos`)
- ☐ **Hide in Shop Module** (`hide`)
- ☐ **Custom Fields** — reveals `cf1..cf6`
- **Product Details** (rich-text, for shop page) — `product_details`
- **Product details for invoice** (rich-text, appears on receipt) — `details`
- **[Add Product]** submit button

**Right column:**
- ☐ **This product has multiple variants** *(e.g. Multiple Sizes and/or Colors)* — reveals variant grid (`sma_product_variants`)
- **Store Quantity** block — one pair of inputs per warehouse:
  - Warehouse 1 / 2 → **Quantity** + **Racks** (populates `sma_warehouses_products`)
- **Supplier [+]** section — select from `sma_companies` where `group_name='supplier'`, plus Supplier Part Number and Supplier Price. Up to 5 suppliers (`supplier1..supplier5`, `supplier*price`, `supplier*_part_no`)

### 3.4 Sales — List (screenshot 5)

Breadcrumb `Home / Sales`. Heading "Sales (All Stores)". 5,089 entries.

**Columns:** ☐, Date (`dd/MM/yyyy HH:mm:ss`), Reference No (e.g. `SALE2026/04/10835`), Biller, Customer, Sale Status (pill "Completed" green), Grand Total, Paid, Balance, Payment Status (pill "Due" red / "Paid" green / "Partial" orange), Attachment icon, Actions (View / Edit / Add Payment / Payments / Add Delivery / Email / PDF / Print / Return / Duplicate / Delete).

Footer row is a **filter row** (empty boxes under each column) for per-column search, plus an aggregate total (`19,699.98`). Pagination `< Previous 1 2 3 4 5 Next >`.

### 3.5 POS Sales — List (screenshot 6)

Breadcrumb `Home / POS / POS Sales`. 17,032 entries.

Same layout as Sales but columns: Date, Reference No (prefix `SALE/POS2026/04/30166`), Customer (almost always `Walk-in Customer`), **Phone** (customer phone — absent from regular Sales list), Grand Total, Paid, Balance, Sale Status, Payment Status (overwhelmingly "Paid"), Actions. Filters `sma_sales.pos = 1`.

### 3.6 POS — Terminal (screenshot 7)

URL `/admin/pos`. Two-pane layout:

**Left pane (cart):**
- Customer selector (autocomplete) — default `Walk-in Customer (.0123456789).` with pencil/eye/plus icons (edit / view / add new)
- Warehouse selector — `Warehouse 1`
- Product scan/search bar (by name or code) + `+` manual-add
- Cart table: Product / Price / Qty / Subtotal / 🗑 (trash)
- Totals block: Items, Total, Order Tax, Discount, **Total Payable**
- Action buttons: **Suspend** (orange) | **Order** (teal) | **Payment** (green) | **Cancel** (red) | **Bill** (blue)
- Top header mirrors admin top bar plus `15/04/2026 16:38` live clock

**Right pane (product tiles grid):**
- Categories shown as buttons with image or camera-crossed placeholder, e.g. BEEF HALEEM(1 KG), BREAKFAST MENU, BUFFALO WINGS (8 PCS), CARROT CAKE, CENTURY EGG WITH DICED CHILLI, CHEESE CAKE, CHICKEN AND MUSHROOM QUICHE, CHICKEN CHOWMEIN, CHICKEN CUTLET, CHICKEN KARAGI 5 PCS, CHICKEN KATSU, CHICKEN LOLLIPOP (06 PCS), CHICKEN NANBAN 5 PCS, CHICKEN NUGGETS (06 PCS), CHICKEN POPCORN, CHICKEN SAMI KABAB, CHICKEN SATAY 5 PCS, CHICKEN SPRING ROLL 6 PCS, CHICKEN TEMPURA 5 PCS …
- Bottom nav: prev ◀ | **Signup Reward Card** | next ▶
- Right rail (vertical tabs): **Categories**, **Sub Categories**, **Brands**

**Keyboard shortcuts** (from `sma_pos_settings`): `Ctrl+F3` focus add item, `Ctrl+Shift+M` manual product, `Ctrl+Shift+C` customer, `Ctrl+Shift+A` add customer, `Ctrl+F11/F12` toggle category/subcategory slider, `F4` cancel, `F7` suspend, `F9` print items, `F8` finalize, `Ctrl+F1` today's sale, `Ctrl+F2` hold bills, `Ctrl+F10` close register.

### 3.7 Other modules (inferred from DB & permissions)

| Module | Tables | Controller (SMA convention) |
|---|---|---|
| **Quotations** | `sma_quotes`, `sma_quote_items` | `Quotes` |
| **Purchases** | `sma_purchases`, `sma_purchase_items` | `Purchases` |
| **Transfers** (warehouse-to-warehouse) | `sma_transfers`, `sma_transfer_items` | `Transfers` |
| **Returns (sales)** | `sma_returns`, `sma_return_items` | `Sales::returns` |
| **Returns (purchase)** — same tables with `return_id`/`return_purchase_ref` on `sma_purchases` | | |
| **Deliveries** (sale dispatch) | `sma_deliveries` | `Sales::deliveries` |
| **Repair jobs** (unusual SMA add-on) | `sma_repair_history`, extra cols `repair_note`, `repair_status`, `tech_id` on `sma_sales` | `Repairs` / extended Sales |
| **Customers / Suppliers / Billers** — all share one polymorphic table | `sma_companies` distinguished by `group_name` enum (`customer`, `supplier`, `biller`) | `Customers` / `Suppliers` / `Billers` |
| **Customer Groups / Price Groups** | `sma_customer_groups`, `sma_price_groups`, `sma_product_prices` | `Customers`, `Settings` |
| **Gift Cards / Reward Cards** | `sma_gift_cards`, `sma_gift_card_topups`, award points on `sma_users`/`sma_companies` | `Sales::gift_cards` |
| **Deposits** (customer credit) | `sma_deposits` | `Customers::deposits` |
| **Expenses** | `sma_expenses`, `sma_expense_categories` | `Purchases::expenses` |
| **Payments** | `sma_payments` (polymorphic — one of `sale_id` / `purchase_id` / `return_id` must be set) | `Sales::payments`, `Purchases::payments` |
| **Quantity Adjustments / Stock Counts** | `sma_adjustments`, `sma_adjustment_items`, `sma_stock_counts`, `sma_stock_count_items` | `Products::adjustments` etc. |
| **Calendar** | `sma_calendar` (CodeIgniter "Events" widget) | `Calendar` |
| **POS Register / Cash-in** | `sma_pos_register` (open/close with cash-in-hand, cheques & CC slips counts) | `Pos::register` |
| **Notifications banner** | `sma_notifications` (scope + from/till dates) | `Notifications` |
| **Suspended POS bills (Hold)** | `sma_suspended_bills`, `sma_suspended_items` | POS hourglass button |
| **Combo products** | `sma_combo_items` (product of type `combo` + child `item_code`s) | Products |
| **Order reference counters** | `sma_order_ref` — single-row daily counter for SO/QU/PO/TO/POS/DO/PAY/RE/REP/EX/PPAY/QA prefixes | used by all order-numbered controllers |
| **Users / Groups / Permissions** | `sma_users`, `sma_groups`, `sma_permissions`, `sma_login_attempts`, `sma_user_logins`, `sma_sessions`, `sma_captcha` | Ion Auth + custom `Auth` |

---

## 4. Database Schema

**Convention:** all tables prefixed `sma_`. Engine InnoDB, charset utf8 (one table latin1). Nearly all PKs are `id int(11) AUTO_INCREMENT`. Foreign keys are **not enforced at DB level** (classic SMA); referential integrity is application-side. Relationships below are inferred from column names.

Total documented tables: **64** (excluding the stray empty `table 63`).

### 4.1 Domain grouping

| Domain | Tables |
|---|---|
| Auth & Users | `sma_users`, `sma_groups`, `sma_permissions`, `sma_login_attempts`, `sma_user_logins`, `sma_sessions`, `sma_captcha` |
| People (customers/suppliers/billers) | `sma_companies`, `sma_companies_new` (migration scratch), `sma_addresses`, `sma_customer_groups`, `sma_price_groups`, `sma_deposits`, `sma_gift_cards`, `sma_gift_card_topups` |
| Products / Catalog | `sma_products`, `sma_product_photos`, `sma_product_prices`, `sma_product_variants`, `sma_variants`, `sma_combo_items`, `sma_promos`, `sma_brands`, `sma_categories`, `sma_units` |
| Inventory / Warehouses | `sma_warehouses`, `sma_warehouses_products`, `sma_warehouses_products_variants`, `sma_adjustments`, `sma_adjustment_items`, `sma_stock_counts`, `sma_stock_count_items`, `sma_transfers`, `sma_transfer_items` |
| Sales / POS | `sma_sales`, `sma_sale_items`, `sma_deliveries`, `sma_returns`, `sma_return_items`, `sma_suspended_bills`, `sma_suspended_items`, `sma_pos_register`, `sma_pos_settings`, `sma_printers`, `sma_service_charges`, `sma_repair_history` |
| Quotations | `sma_quotes`, `sma_quote_items` |
| Purchases / Expenses | `sma_purchases`, `sma_purchase_items`, `sma_expenses`, `sma_expense_categories` |
| Accounting / Payments | `sma_payments`, `sma_costing`, `sma_tax_rates`, `sma_paypal`, `sma_skrill` |
| Ops / System | `sma_settings`, `sma_currencies`, `sma_date_format`, `sma_order_ref`, `sma_notifications`, `sma_calendar`, `sma_migrations` |

### 4.2 Auth & Users

#### `sma_users` — PK `id`; `group_id` → `sma_groups.id`; `warehouse_id` → `sma_warehouses.id`; `biller_id`/`company_id` → `sma_companies.id`
| Column | Type | Notes |
|---|---|---|
| id | int unsigned PK | |
| last_ip_address, ip_address | varbinary(45) | binary-packed IP |
| username | varchar(100) | unique in practice |
| password | varchar(40) | SHA-1 w/ salt (Ion Auth legacy) |
| salt | varchar(40) | |
| email | varchar(100) | |
| activation_code, forgotten_password_code, remember_code | varchar(40) | |
| forgotten_password_time, created_on, last_login | int unsigned | UNIX timestamps |
| active | tinyint(1) | |
| first_name, last_name, company, phone, avatar, gender | text fields | |
| group_id | int FK | role |
| warehouse_id | int FK | pin user to one outlet |
| biller_id | int FK | which biller they sell under |
| company_id | int FK | link to `sma_companies` (if user = customer/supplier portal) |
| show_cost, show_price | tinyint(1) | visibility flags |
| award_points | int | loyalty |
| view_right, edit_right | tinyint(1) | can see/edit other users' records |
| allow_discount | tinyint(1) | |

#### `sma_groups` — role directory
| id | name | description |
|---|---|---|
| 1 | owner | Owner |
| 2 | admin | Administrator |
| 3 | customer | Customer |
| 4 | supplier | Supplier |
| 5 | sales | Sales Staff |
| 6 | hr_admin | HR_Admin |
| 7 | bistro_manager | Bistro_Manager |
| 8 | accounts | Accounts |

#### `sma_permissions` — one row per group; **87 boolean columns** covering every controller action. Groups each `products-*`, `quotes-*`, `sales-*`, `purchases-*`, `transfers-*`, `customers-*`, `suppliers-*`, `returns-*`, `reports-*`, `pos-index`, `bulk_actions`, `edit_price` …
See seed INSERTs — groups 5/6/7/8 have tailored subsets (e.g. group 6 `hr_admin` only gets `sales-add`).

#### `sma_login_attempts` — Ion Auth brute-force throttle (id, ip_address varbinary, login, time)
#### `sma_user_logins` — successful login audit (id, user_id, company_id, ip_address, login, time). ~8,663 rows.
#### `sma_sessions` — CodeIgniter DB sessions (id varchar(40) PK, ip_address, timestamp int, data blob with serialized PHP: `identity`, `username`, `user_id`, `group_id`, `biller_id`, `register_id`, `cash_in_hand`, …)
#### `sma_captcha` — (captcha_id bigint PK, captcha_time, ip_address, word) — CI captcha helper.

### 4.3 People — `sma_companies` (unified polymorphic)

One table for **Customers + Suppliers + Billers**, switched by `group_name`.

| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| group_id | int unsigned | → `sma_groups.id` (3=customer, 4=supplier, NULL for biller) |
| group_name | varchar(20) | enum string: `customer` / `supplier` / `biller` |
| customer_group_id / customer_group_name | int / varchar | → `sma_customer_groups` |
| name, company | varchar | |
| vat_no, gst_no | varchar(100) | |
| address, city, state, postal_code, country | varchar | |
| phone, email | | |
| cf1..cf6 | varchar(100) | custom fields |
| invoice_footer | text | |
| payment_term | int | days |
| logo | varchar(255) | default `logo.png` |
| award_points | int | loyalty balance |
| deposit_amount | decimal(25,4) | customer deposit balance |
| price_group_id / price_group_name | → `sma_price_groups` | |

Seed highlights: id=1 `Walk-in Customer`, id=3 biller `Bistro Central`, id=15 `fOODPANDA`, id=19 biller `WRAP MAN (A Concern Of Bistro Central)`, id=20 `Evaly`, many Paragon Group employee customer rows `PG000xxx` with credit limit stored in `cf2`.

> `sma_companies_new` has an almost-identical schema and appears to be a migration/staging copy — not active.

#### `sma_addresses` — additional shipping addresses per company (`company_id` → companies.id)
#### `sma_customer_groups` — id, name, percent *(percent is a price adjustment — negative = discount)*. Seed: (1) General 0%, (2) Reseller -5%, (3) Distributor -15%, (4) New Customer (+10) +10%.
#### `sma_price_groups` — id, name. Seed: Default, DIRECTOR SIR, FOOD PANDA, HUNGRY NAKI, PARAGON GUEST, SIMPLE FOOD.
#### `sma_product_prices` — (id, product_id, price_group_id, price) — override prices per group.
#### `sma_deposits` — customer cash deposits (date, company_id, amount, paid_by, note, created_by).
#### `sma_gift_cards` — (id, date, card_no, value, customer_id, customer, balance, expiry, created_by, award_point). 2 seed rows.
#### `sma_gift_card_topups` — (id, date, card_id → gift_cards.id, amount, created_by, award_point).

### 4.4 Products / Catalog

#### `sma_products` — master item table (~58 columns)
Key columns: `id`, `code` (barcode/SKU), `name`, `product_status`, `unit` → `sma_units.id`, `cost`, `price`, `alert_quantity`, `image`, `category_id` → `sma_categories.id`, `subcategory_id` → `sma_categories.id`, `cf1..cf6`, `quantity` (legacy global on-hand — actual per-warehouse in `sma_warehouses_products`), `tax_rate` → `sma_tax_rates.id`, `track_quantity`, `details` (invoice text), `warehouse` (default WH), `barcode_symbology` (default `code128`), `file` (digital download), `product_details` (shop HTML), `tax_method` (0=exclusive, 1=inclusive), `type` (`standard`/`combo`/`digital`/`service`), `supplier1..5` + `supplier*price` + `supplier*_part_no`, `promotion`, `promo_price`, `start_date`, `end_date`, `sale_unit`, `purchase_unit`, `brand` → `sma_brands.id`, `slug`, `featured`, `weight`, `hsn_code`, `views`, `hide` (shop), `second_name`, `hide_pos`.

#### `sma_product_photos` — (id, product_id, photo)
#### `sma_product_variants` — (id, product_id, name, cost, price, quantity) — inline variants
#### `sma_variants` — (id, name) — global variant dictionary
#### `sma_combo_items` — (id, product_id [combo parent], item_code [child SKU], quantity, unit_price)
#### `sma_promos` — (id, name, product2buy, product2get, start_date, end_date, description) — BOGO style
#### `sma_brands` — (id, code, name, image, slug, description). Seed: BISTRO CENTRAL, Private, Paragon agro ltd, Szechuan Chinese, Barista, Pastry and Bakery, Kiosk, Cafe Central, etc.
#### `sma_categories` — self-referential tree (`parent_id` = 0 for root). Seed: SET MENU, CATERING, Mains, Dessert, Appetizers, Soups, Wraps, Sandwiches, Brewed Steamed, Spritzers on the rocks, Milkshakes, Private, Pizza, Pastry & Bakery, Pasta, Breakfast, Szechuan Chinese, Noodles, Dim Sum, Chow Mein, Kids Menu, Rice, Kiosk, Cafe Central …
#### `sma_units` — (id, code, name, base_unit, operator, unit_value, operation_value) — supports conversion rules. Only `PC` seeded.

### 4.5 Inventory / Warehouses

#### `sma_warehouses` — (id, code, name, address, map, phone, email, price_group_id). Seed: 1=Warehouse 1, 2=Warehouse 2.
#### `sma_warehouses_products` — per-WH stock (id, product_id, warehouse_id, quantity, rack, avg_cost).
#### `sma_warehouses_products_variants` — same but per-variant.
#### `sma_adjustments` — (id, date, reference_no, warehouse_id, note, attachment, created_by, updated_by, updated_at, count_id → stock_counts.id) — +/- stock movements.
#### `sma_adjustment_items` — (id, adjustment_id, product_id, option_id → product_variants.id, quantity, warehouse_id, serial_no, type `addition`/`subtraction`).
#### `sma_stock_counts` — (id, date, reference_no, warehouse_id, type `full`/`partial`, initial_file, final_file, brands, brand_names, categories, category_names, note, products, rows, differences, matches, missing, created_by, updated_by, updated_at, finalized).
#### `sma_stock_count_items` — (id, stock_count_id, product_id, product_code, product_name, product_variant, product_variant_id, expected, counted, cost).
#### `sma_transfers` — (id, transfer_no, date, from_warehouse_id/code/name, to_warehouse_id/code/name, note, total, total_tax, grand_total, created_by, status `pending`/`sent`/`received`, shipping, attachment, cgst/sgst/igst).
#### `sma_transfer_items` — standard line items incl. `quantity_balance` for FIFO tracking.

### 4.6 Sales / POS

#### `sma_sales` — central sales table (~55 columns). AUTO_INCREMENT = 40,999.
Key columns: `id`, `date`, `reference_no` (e.g. `SALE2023/07/5738` or POS `SALE/POS2023/07/13149`), `customer_id/customer`, `biller_id/biller`, `warehouse_id`, `note` (HTML), `staff_note`, `total`, `product_discount`, `order_discount_id` (e.g. `"10%"`), `total_discount`, `order_discount`, `total_service_charge`, `service_charge`, `product_tax`, `order_tax_id` → `sma_tax_rates.id`, `order_tax`, `total_tax`, `shipping`, `grand_total`, `grand_total_with_sc`, `sale_status` (`completed`/`pending`/`ordered`/`returned`), `payment_status` (`paid`/`partial`/`due`/`pending`), `payment_term`, `due_date`, `created_by`/`updated_by`/`updated_at`, `total_items`, `pos` (0/1), `paid`, `return_id`, `surcharge`, `attachment`, `return_sale_ref`, `sale_id` (parent for returns), `return_sale_total`, `rounding`, `suspend_note`, `api` (flag: created via API), `shop` (flag: online shop), `address_id` → `sma_addresses.id`, `reserve_id`, `hash` (URL-safe invoice hash), `manual_payment`, `cgst/sgst/igst` (India GST, unused here), `payment_method` (`cash`/`CC`/`Cheque`/`stripe`/`paypal`/`gift_card`), `type` (`Sales`/`Repair`), `type_detail` (`In Progress`/`Waiting for Parts`/...), `repair_note`, `repair_status`, `tech_id` → `sma_users.id`.

#### `sma_sale_items` — line items. AUTO_INCREMENT = 107,388.
Columns: id, sale_id, product_id, product_code, product_name, product_type (`standard`/`combo`/`digital`/`service`), option_id → variant, net_unit_price, unit_price (gross), quantity, warehouse_id, item_tax, tax_rate_id, tax (string e.g. `"5%"`), discount (string), item_discount, subtotal, serial_no, real_unit_price, sale_item_id (for returns), product_unit_id, product_unit_code (`PC`), unit_quantity, comment, gst/cgst/sgst/igst.

#### `sma_deliveries` — (id, date, sale_id, do_reference_no, sale_reference_no, customer, address, note, status, attachment, delivered_by, received_by, created_by, updated_by, updated_at).
#### `sma_returns` — customer refund header, mirrors sales structure + `total_items`, `paid`, `surcharge`, `hash`.
#### `sma_return_items` — line items with `comment`.
#### `sma_suspended_bills` + `sma_suspended_items` — held POS orders (count of items, customer, biller, shipping).
#### `sma_pos_register` — open/close shifts: (id, date, user_id, cash_in_hand, status `open`/`close`, total_cash, total_cheques, total_cc_slips, total_cash_submitted, total_cheques_submitted, total_cc_slips_submitted, note, closed_at, transfer_opened_bills, closed_by). AUTO_INCREMENT = 1,922.
#### `sma_pos_settings` — single-row config: category/product limits, default category/customer/biller, display_time, 2 custom field labels, receipt printer, cash-drawer codes (ESC/POS), every keyboard shortcut, paypal/stripe toggles, rounding, char_per_line (42), pin_code, after_sale_page, item_order, authorize, remote_printing, printer id, order_printers (CSV of kitchen printer ids), auto_print, customer_details, local_printers, java_applet, product_button_color.
#### `sma_printers` — (id, title, type, profile, char_per_line, path, ip_address varbinary(45), port) — kitchen/receipt/label printers.
#### `sma_service_charges` — (id, name, code, rate). Seed: "Service Charge 5%".
#### `sma_repair_history` — (id, created_date, updated_date, created_by, updated_by, sale_id, repair_note, repair_status). Statuses seen: `In Progress`, `Return/Not Fixable`, `Waiting for Parts`.

### 4.7 Quotations

#### `sma_quotes` — mirrors sales header + `supplier_id/supplier`, `hash`, `status` (`pending`/`sent`/`approved`/`rejected`/`ordered`).
#### `sma_quote_items` — standard line items.

### 4.8 Purchases & Expenses

#### `sma_purchases` — (reference_no, date, supplier_id/supplier, warehouse_id, note, total, product_discount, order_discount_id/order_discount, total_discount, product_tax, order_tax_id/order_tax, total_tax, shipping, grand_total, paid, status `received`/`pending`/`ordered`/`partial`, payment_status `paid`/`partial`/`due`/`pending`, created_by/updated_by/updated_at, attachment, payment_term, due_date, return_id, surcharge, return_purchase_ref, purchase_id (parent for return), return_purchase_total, cgst/sgst/igst).
#### `sma_purchase_items` — (purchase_id, transfer_id, product_id, product_code/name, option_id, net_unit_cost, quantity, warehouse_id, item_tax, tax_rate_id, tax, discount, item_discount, expiry, subtotal, quantity_balance (remaining FIFO), date, status, unit_cost, real_unit_cost, quantity_received, supplier_part_no, purchase_item_id (for returns), product_unit_id/code, unit_quantity, gst/cgst/sgst/igst).
#### `sma_expenses` — (id, date, reference `EX…`, amount, note, created_by, attachment, category_id, warehouse_id).
#### `sma_expense_categories` — (id, code, name).

### 4.9 Accounting / Payments

#### `sma_payments` — polymorphic (`sale_id` **or** `purchase_id` **or** `return_id` set). Columns: reference_no (`IPAY…`), transaction_id, paid_by (`cash`/`CC`/`Cheque`/`gift_card`/`stripe`/`paypal`/`ppp`/`authorize`), cheque_no, cc_no (last 4), cc_holder, cc_month, cc_year, cc_type (Visa/Master/Amex), amount, currency, created_by, attachment, type (`received`/`sent`/`returned`), note, pos_paid, pos_balance (cash tendered/change), approval_code. AUTO_INCREMENT = 39,995.
#### `sma_costing` — FIFO layer tracker: (date, product_id, sale_item_id, sale_id, purchase_item_id, quantity, purchase_net_unit_cost, purchase_unit_cost, sale_net_unit_price, sale_unit_price, quantity_balance, inventory flag, overselling flag, option_id). AUTO_INCREMENT = 107,333. Drives profit/loss reports.
#### `sma_tax_rates` — (id, name, code, rate, type `1`=percent / `2`=fixed). Seed: No Tax, VAT @10%, VAT @ 5%, VAT 5% + Service Charge 5%.
#### `sma_paypal` — (id, active, account_email, paypal_currency, fixed_charges, extra_charges_my, extra_charges_other).
#### `sma_skrill` — (id, active, account_email, secret_word, skrill_currency, fixed_charges, extra_charges_my, extra_charges_other).

### 4.10 Ops / System

#### `sma_settings` — single-row site config. Notable cols: logo, logo2, site_name (`Bistro Central`), language (`english`), default_warehouse (1), accounting_method (2=FIFO), default_currency (`BDT`), default_tax_rate, rows_per_page (25), version (`3.4.12`), default_tax_rate2, dateformat (`d/m/Y`), sales_prefix (`SALE`), quote_prefix (`QUOTE`), purchase_prefix (`PO`), transfer_prefix (`TR`), delivery_prefix (`DO`), payment_prefix (`IPAY`), return_prefix (`SR`), returnp_prefix (`PR`), expense_prefix, item_addition, theme (`default`), product_serial, default_discount, product_discount, discount_method, tax1/tax2, overselling (1), restrict_user, restrict_calendar, timezone (`Asia/Dhaka`), image widths/heights, watermark, reg_ver/allow_reg/reg_notification/auto_reg, protocol/mailpath/smtp_*, corn (cron timestamp), customer_group (4), default_email, mmode (maintenance), bc_fix, auto_detect_barcode, captcha, reference_format, racks, attributes, product_expiry, decimals (2), qty_decimals (2), decimals_sep, thousands_sep, invoice_view, default_biller (3), envato_username, purchase_code, rtl, each_spent/ca_point (loyalty accrual), each_sale/sa_point, update, sac (service charge flag), display_all_products, display_symbol, symbol (`TK`), remove_expired, barcode_separator (`-`), set_focus, price_group, barcode_img, ppayment_prefix (`POP`), disable_editing (90 days), qa_prefix, update_cost, apis, state, pdf_lib (`dompdf`).

#### `sma_currencies` — (id, code, name, rate, auto_update, symbol). Seed: USD, EUR, **BDT @ 84.0000 (symbol BDT)**.
#### `sma_date_format` — (id, js, php, sql) — 6 presets.
#### `sma_order_ref` — single-row per-date counter for all document prefixes (so, qu, po, to, pos, do, pay, re, rep, ex, ppay, qa).
#### `sma_notifications` — (id, comment html, date, from_date, till_date, scope tinyint 1=admin/2=user/3=all).
#### `sma_calendar` — (id, title, description, start, end, color, user_id).
#### `sma_migrations` — single `version` bigint column (CI3 migration tracker). Current version: **315**.

### 4.11 Relationship summary (most-traversed FKs)

```
sma_users.group_id            → sma_groups.id
sma_users.biller_id           → sma_companies.id   (group_name='biller')
sma_users.warehouse_id        → sma_warehouses.id
sma_permissions.group_id      → sma_groups.id

sma_companies.group_id        → sma_groups.id     (3/4/NULL)
sma_companies.customer_group_id → sma_customer_groups.id
sma_companies.price_group_id  → sma_price_groups.id
sma_addresses.company_id      → sma_companies.id

sma_products.category_id      → sma_categories.id
sma_products.subcategory_id   → sma_categories.id
sma_products.brand            → sma_brands.id
sma_products.unit/sale_unit/purchase_unit → sma_units.id
sma_products.tax_rate         → sma_tax_rates.id
sma_products.supplier1..5     → sma_companies.id
sma_product_photos.product_id → sma_products.id
sma_product_prices.product_id → sma_products.id
sma_product_prices.price_group_id → sma_price_groups.id
sma_product_variants.product_id → sma_products.id
sma_combo_items.product_id    → sma_products.id  (combo parent)

sma_warehouses_products.(product_id, warehouse_id) → products, warehouses
sma_adjustments.warehouse_id  → sma_warehouses.id
sma_adjustment_items.(adjustment_id, product_id, option_id, warehouse_id)
sma_stock_counts.warehouse_id, .count_id  ←→ sma_adjustments.count_id
sma_stock_count_items.stock_count_id → sma_stock_counts.id
sma_transfers.(from_warehouse_id, to_warehouse_id) → sma_warehouses.id
sma_transfer_items.transfer_id → sma_transfers.id

sma_sales.customer_id         → sma_companies.id
sma_sales.biller_id           → sma_companies.id
sma_sales.warehouse_id        → sma_warehouses.id
sma_sales.order_tax_id        → sma_tax_rates.id
sma_sales.sale_id             → sma_sales.id     (self: return→original)
sma_sales.address_id          → sma_addresses.id
sma_sales.tech_id             → sma_users.id     (repair)
sma_sale_items.sale_id        → sma_sales.id
sma_sale_items.product_id     → sma_products.id
sma_sale_items.sale_item_id   → sma_sale_items.id (self: return link)
sma_deliveries.sale_id        → sma_sales.id
sma_returns.customer_id/biller_id → sma_companies.id
sma_return_items.return_id    → sma_returns.id
sma_suspended_items.suspend_id → sma_suspended_bills.id
sma_repair_history.sale_id    → sma_sales.id
sma_pos_register.user_id      → sma_users.id

sma_quotes.customer_id/biller_id/supplier_id → sma_companies.id
sma_quote_items.quote_id      → sma_quotes.id

sma_purchases.supplier_id     → sma_companies.id
sma_purchases.warehouse_id    → sma_warehouses.id
sma_purchases.purchase_id     → sma_purchases.id  (self: return)
sma_purchase_items.purchase_id → sma_purchases.id
sma_purchase_items.transfer_id → sma_transfers.id
sma_expenses.category_id      → sma_expense_categories.id
sma_expenses.warehouse_id     → sma_warehouses.id

sma_payments.(sale_id|purchase_id|return_id) → respective
sma_costing.(sale_id, sale_item_id, purchase_item_id, product_id)

sma_gift_cards.customer_id    → sma_companies.id
sma_gift_card_topups.card_id  → sma_gift_cards.id
sma_deposits.company_id       → sma_companies.id
```

---

## 5. Enums & Lookup Values (from seed data)

| Concept | Values |
|---|---|
| **User roles** (`sma_groups`) | owner, admin, customer, supplier, sales, hr_admin, bistro_manager, accounts |
| **Company kind** (`sma_companies.group_name`) | customer, supplier, biller |
| **Customer groups** | General (0%), Reseller (-5%), Distributor (-15%), New Customer (+10%) |
| **Price groups** | Default, DIRECTOR SIR, FOOD PANDA, HUNGRY NAKI, PARAGON GUEST, SIMPLE FOOD |
| **Product type** (`sma_products.type`) | standard, combo, digital, service |
| **Product status** (`product_status`) | 1 = Active, 0 = Inactive |
| **Tax method** | 0 = Exclusive, 1 = Inclusive |
| **Tax rates** | No Tax (0%), VAT @10%, VAT @ 5%, VAT 5% + Service Charge 5% |
| **Tax rate type** | 1 = Percent, 2 = Fixed |
| **Service charges** | Service Charge 5% |
| **Currencies** | USD, EUR, BDT (symbol `TK`, rate 84.0) |
| **Barcode symbology** | code128 (default), code39, EAN8, EAN13, UPC, codabar, … |
| **Sale status** (`sale_status`) | completed, pending, ordered, returned |
| **Payment status** | paid, partial, due, pending |
| **Sale type** (`type`) | Sales, Repair |
| **Sale type_detail** (repair sub-status) | In Progress, Waiting for Parts, Return/Not Fixable, (and fixed) |
| **Repair status history** | In Progress, Waiting for Parts, Return/Not Fixable |
| **Payment method** (`paid_by` / `payment_method`) | cash, CC, Cheque, gift_card, stripe, paypal, ppp, authorize |
| **CC type** | Visa, Master, Amex |
| **Payment type** | received, sent, returned |
| **Purchase status** | received, pending, ordered, partial |
| **Transfer status** | pending, sent, completed |
| **Adjustment type** | addition, subtraction |
| **Stock count type** | full, partial |
| **POS register status** | open, close |
| **Notification scope** | 1 = admin, 2 = user, 3 = all |
| **Document prefixes** (`sma_settings`) | SALE, QUOTE, PO, TR, DO, IPAY, SR, PR, EX, POP |
| **Warehouses** | 1=Warehouse 1, 2=Warehouse 2 |
| **Billers (outlets)** | Bistro Central (id 3), WRAP MAN (id 19) — extended virtually via customer+price group: Food Panda, PG Group, Café Central, Kiosk, Paragon Agro |
| **Default timezone / date format** | Asia/Dhaka, `d/m/Y` |
| **Accounting method** | 0=AVG, 1=LIFO, 2=FIFO (app uses 2) |
| **Loyalty** | configurable via `each_spent`/`ca_point` and `each_sale`/`sa_point`; gift cards accrue `award_point` per top-up |

---

## 6. Open Questions / Gaps

1. **Source repo** — `github.com/Paragon-Group-Limited/bistro` was not traversed this pass (likely private). Controller & view file listings can be auto-generated from the `sma_permissions` column names (each `{module}-{action}` maps to a CI method) — a full list can be produced on demand if repo access is granted.
2. **HR module** — role `hr_admin` (group 6) exists and its permission row enables only `sales-add` and `reports-sales`; no dedicated HR tables (attendance, payroll, leave) are present in the dump, so HR appears to be **view-only reporting** rather than a full HR system. Confirm whether Paragon runs a separate HR app.
3. **Accounts module** — role `accounts` (group 8) has broad read + payment/expense rights but no dedicated ledger/journal tables. Accounting is therefore *transactional-trace-based* (sales + purchases + payments + expenses + costing) rather than double-entry. A general ledger would need to be added if required.
4. **Reward Cards vs Gift Cards** — the POS "Signup Reward Card" button and "List Reward Cards" nav are **presented as a separate flow** but reuse `sma_gift_cards` + `sma_users.award_points` + `sma_companies.award_points`. Confirm whether a separate rewards table exists in the live codebase that was omitted from the dump.
5. **Dashboard outlet tiles** — "Food Panda", "PG Sale", "Café Central", "Kiosk Sale" are computed by filtering `sma_sales` against specific customer_id/biller_id/category_id combos — the exact predicate (is "Kiosk Sale" by category=Kiosk or by biller?) should be confirmed against the dashboard controller.
6. **Shop / online storefront** — `sma_sales.shop` flag, `sma_products.hide`, `slug`, `featured`, `product_details` (HTML) all suggest an embedded public shop. No shop-specific routes are visible in screenshots; may be disabled for this tenant.
7. **API** — `sma_sales.api` flag + `sma_settings.apis` suggest a REST API (used by mobile apps / Food Panda integration). Endpoint surface not captured.
8. **Stale table `table 63`** — a CREATE TABLE at line 245,007 literally named `` `table 63` `` — appears to be a dev-time accident; safe to ignore.
9. **`sma_companies_new`** — duplicate schema with 270+ rows; looks like a migration holding table. Do not reuse without verifying it isn't live.
10. **Indian GST columns** (`cgst`, `sgst`, `igst`, `gst`) are present on every transactional table but always NULL in this Bangladesh deployment — carried over from upstream Tecdiary SMA India edition.
11. **`sma_repair_history` vs `sma_sales.repair_*`** — repair events are double-stored. Confirm which is the source of truth before rebuilding.
12. **Printer profiles** — `sma_printers` is empty in dump but `sma_pos_settings.order_printers` references printer ids — kitchen routing rules need re-creation.
13. **Negative stock** everywhere — `overselling=1` in settings and negative `quantity` values in `sma_products` and `sma_warehouses_products` are intentional (a restaurant consumes faster than it books purchases). Any rebuild must preserve the tolerance for negative stock.

---

*End of document.*
