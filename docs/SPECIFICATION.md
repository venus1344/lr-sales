# welink-sales — Specification (Next.js)

**Companion:** `docs/PLAN.md`. **Governing rules:** `RULES.md`.

This document describes the target behaviour of the rebuilt app. Where the original
`laraforma` had a behaviour, this app reproduces it (feature parity); deviations are called
out explicitly.

---

## 1. Provenance

The app is a from-scratch rebuild of `laraforma`. The original was compromised and is
quarantined/read-only (see the incident reports in the workspace root). This app shares
its **data model, document numbering, and workflows**, not its code.

---

## 2. Stack & architecture

- **Framework:** Next.js 16 App Router, React 19, TypeScript.
- **Rendering:** authenticated pages render at request time (`await connection()` / dynamic
  routes). Static prerendering is not used for authenticated data pages.
- **Data access:** Prisma 7 exclusively, via the MariaDB driver adapter. No raw SQL/ORM bypass.
- **Auth:** Auth.js v5 credentials provider, JWT sessions, bcrypt-hashed passwords.
- **Validation:** zod v4, validated both client-side (forms) and server-side (actions).
- **Styling:** Tailwind v4 with a small design-system layer (`.sk-*` classes).
- **Tests:** Vitest, pure-function units for pricing, numbering, formatting, and schemas.

### Directory layout (app)
```
app/
  (app)/                     authenticated shell (sidebar, header, breadcrumbs)
    page.tsx                 dashboard
    settings/<entity>/       master-data list / new / [id]/edit
    documents/<type>/        document list / new / [id]/edit / [id]/print
  signin/page.tsx            credentials sign-in
  api/auth/[...nextauth]/    Auth.js handlers
  api/search/<entity>/       JSON search endpoints for comboboxes
components/                  Combobox, RowActions, Breadcrumbs, ClickableRow, icons, …
lib/                         auth, prisma, pricing, numbering, format, validation, search-options
prisma/schema.prisma         32 models (introspected from the cleaned dump)
tests/                       Vitest suites
```

---

## 3. Environment & data

- MySQL 8 served by Docker (`docker-compose.yml`, host port **3307**). Env-driven credentials.
- Database `welink_sales`, imported from the cleaned `laraforma` dump.
- Imported data (reference): 7 users, 3 customers, 10 suppliers, 1,276 items, 216 invoices,
  402 proformas, 185 delivery notes, 12 LPOs.
- `.env` is gitignored; `.env.example` documents required keys without secrets.

---

## 4. Authentication & RBAC

- **Sign-in:** `/signin` (email + password), credentials validated against `users` (active only).
  Failures redirect back with `?error=CredentialsSignin`.
- **Session:** JWT; carries `id` and `super`.
- **Guards:** every page and server action calls `requireUser()` and, where applicable,
  `requireAbility('<entity>_<action>')`. `super` users bypass ability checks.
- **Abilities:** `*_list`, `*_store`, `*_update`, `*_remove` for each module, stored in
  `abilities` / `ability_role` / `role_user`.
- **Fail-closed:** a missing/invalid session redirects to `/signin`; unknown ability denies.

> Note: this build triggers Auth.js CSRF-token generation (`crypto.getRandomValues`) inside
> `auth()`, so authenticated routes are rendered dynamically rather than prerendered.

---

## 5. Modules

### 5.1 Master data (all CRUD)

Common shape for each: list (search + pagination, 15/page), **new**, **[id]/edit**, **delete**,
ability checks, breadcrumbs, icon nav.

| Module | Route | Fields |
|---|---|---|
| Customers | `/settings/customers` | name, location, contact, postal, TIN, VRN, status |
| Suppliers | `/settings/suppliers` | name, location, contacts, TIN, VRN, status |
| Items | `/settings/items` | name, category, specification, unit measure, price, VAT flag, active |
| Item categories | `/settings/item-categories` | name, description, active |
| Currencies | `/settings/currencies` | code, name, rate, active |
| Packages | `/settings/packages` | name, description, price, status |

### 5.2 Documents

All documents share: list (search by number/customer, pagination, 15/page), **new**, **edit**,
**delete**, and a **print** view. List rows are clickable and open the edit form; actions live
in a kebab menu.

**Proformas** (`/documents/proformas`)
- Fields: customer (searchable picker → name + contact/location/postal/TIN/VRN), date,
  currency, exchange rate, purpose, VAT %, withholding %, labour charge, advance, line items.
- Action: **Convert** to an invoice (pre-fills the invoice form from the proforma).

**Invoices** (`/documents/invoices`)
- Same fields as proforma plus discount; can be created blank or from a proforma.

**Delivery notes** (`/documents/delivery-notes`)
- Fields: date, customer (searchable picker), contact, location, postal, TIN, VRN.
- Line items: item, description, quantity, **serial no** (no pricing).

**Local purchase orders** (`/documents/lpos`)
- Fields: supplier (searchable picker), date, currency, purpose, proforma referenced,
  extra notes, VAT %, withholding %, line items (item, specification, quantity, price).

### 5.3 Dashboard
- KPI cards: total invoiced, customers, suppliers, items, invoices, proformas.
- Recent proformas and quick links.
- (Pending) income chart and recent projects.

---

## 6. Business rules

### 6.1 Document numbering
Prefixes and a `No:<n>` sequence, per document type:

| Document | Prefix |
|---|---|
| Proforma | `WE/PF/` |
| Invoice | `WE/INV/` |
| LPO | `WE/LPO/` |
| Internet invoice | `WE/INTERNET/INV/` |

Numbers are derived from existing persisted numbers (`parseSequence` / `nextSequence`), so the
sequence continues without reuse. The number is stored on the record (proformas/invoices in
`notes`, LPOs in `reference_no`).

### 6.2 Pricing / totals
```
subtotal   = Σ(price × quantity)
vat        = subtotal × vatRate
withholding= subtotal × withholdingRate
total      = subtotal + vat + labourCharge − discount − withholding
```
Rates are stored as fractions for calculation (VAT 18 → 0.18, withholding 2 → 0.02). All money
is rounded to 2 decimals (`round2`). The engine is a pure, unit-tested function (`lib/pricing.ts`).

### 6.3 Currency
Documents carry `currency` and `exchange_rate`; amounts are entered in the document currency.
(Conversion/rounding rules mirror the original; exchange rate defaults to 1 / TZS.)

---

## 7. UI conventions

- **Look:** minimal ERPNext/Frappe style — light gray canvas, white cards with hairline
  borders, flat dark primary buttons, small type.
- **Navigation:** left sidebar (Main / Settings / Documents) with icons; header shows
  breadcrumbs (Dashboard → section → entity → action) plus the signed-in user.
- **Scrolling:** the content area scrolls independently; the sidebar and header stay fixed.
- **Search:** list screens use a `?q=` search form and `?page=` pagination.
- **Pickers:** item/customer/supplier selection uses a custom combobox (not native `<select>`)
  with server-backed search and a “Create new…” link to the create form.
- **Rows:** clickable to open the edit form; actions are in a single kebab (⋮) dropdown.
- **Icons:** shared outline icon set; destructive actions use a trash icon.
- **Print:** every document has a print view (`.no-print` chrome hidden in print).

---

## 8. Security model

- No `eval`, `shell_exec`, `child_process`, or terminal endpoints.
- No hardcoded credentials; secrets come from env; legacy passwords are invalidated.
- Auth.js only; session cookie auth; server actions re-check authorization.
- RBAC enforced on the server for every read/write; the client is never trusted.
- All DB access through Prisma; server-only modules are never bundled into client components.
- Never copy files from `public_html/laraforma` (still contains live `.log` backdoors).

---

## 9. Testing & definition of done

- Unit tests (Vitest) cover: formatting (TIN/VRN), password hashing, RBAC checks, pricing,
  numbering, and zod schemas for every entity and document.
- Per-change done means: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build` all pass.
- Nothing merges without passing tests (RULES.md §5).
