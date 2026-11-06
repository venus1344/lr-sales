# welink-sales — Implementation Plan (Next.js)

**Project:** WeLink Sales — invoicing / ERP application, a faithful rebuild of `laraforma`.
**Status:** living plan. Built work is checked; unchecked items are parity gaps.
**Companion:** `docs/SPECIFICATION.md`. Governing rules: `RULES.md`.

---

## 0. Executive summary

`laraforma` (Laravel 8 / Livewire 2 / PHP 7.3–8.0) was the entry point for the
2024–2026 compromise:

- a hardcoded super-admin (`aemmanuel199@gmail.com`, password equal to the email),
- an unauthenticated `OnlineTerminal` calling `shell_exec($this->command)`,
- RBAC abilities that were defined but never enforced,
- an end-of-life framework/PHP stack.

It is archived on the `archive/laravel` branch and must never be redeployed. Its
`public_html/laraforma` tree is quarantine/read-only and still contains live `.log`
backdoors — **never copy from it**.

This app rebuilds the same invoicing/ERP behaviour on a supported stack, preserving the
old data, document numbering, and workflows, while removing every incident root cause.
Goal: **feature parity** with the old app (RULES.md §7 — no new features without sign-off).

---

## 1. Stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Data | MySQL 8, Prisma 7 (driver adapter `@prisma/adapter-mariadb`) — DB access **only** via Prisma |
| Auth | Auth.js v5 (`next-auth` beta) — credentials + JWT session, bcrypt passwords |
| UI | Tailwind v4, minimal ERPNext/Frappe look (light gray canvas, white cards, hairline borders) |
| Validation | zod v4 schemas per entity/document |
| Tests | Vitest (`npm test`), 61 unit tests passing |

---

## 2. Status — what is built

### Foundation
- [x] Fresh Next.js 16 + TypeScript scaffold (no reuse of `laraforma` files).
- [x] MySQL 8 in Docker (`docker-compose.yml`, port 3307), schema + data imported from the cleaned dump.
- [x] Prisma 7 schemas for all 32 tables (`prisma/schema.prisma`), `prisma-client` generator with MariaDB adapter.
- [x] Auth.js credentials sign-in/out; session carries `id` and `super`.
- [x] RBAC enforced server-side: `requireUser` / `requireAbility` on every page and action; `super` bypass.
- [x] `.env` gitignored; `.env.example` committed without secrets.
- [x] Sign-in page (`/signin`) with error feedback; root layout redirects unauthenticated users.

### Master data (CRUD + search + pagination)
- [x] Customers (`/settings/customers`)
- [x] Suppliers (`/settings/suppliers`)
- [x] Items (`/settings/items`) — category relation, price, VAT flag, unit measure
- [x] Item categories (`/settings/item-categories`)
- [x] Currencies (`/settings/currencies`)
- [x] Packages (`/settings/packages`)
- [x] List search (`?q=`) + pagination (`?page=`), icons, breadcrumbs.

### Documents (core invoicing)
- [x] **Proformas** — list/search/pagination, new, edit, delete, print.
- [x] **Invoices** — list/search/pagination, new, edit, delete, print; proforma → invoice conversion.
- [x] **Delivery notes** — list/search/pagination, new, edit, delete, print (serial numbers per line).
- [x] **Local purchase orders (LPOs)** — list/search/pagination, new, edit, delete, print.
- [x] Line items with searchable item picker (create-new inline), customer/supplier picker, auto-filled spec/unit/price.
- [x] Totals engine + document numbering (see SPEC §7).
- [x] Row actions via kebab menu; clickable rows open the edit form.

### Shared
- [x] Dashboard: KPI cards, recent proformas, quick links.
- [x] Sidebar navigation with icons + breadcrumbs; fixed header and independently scrolling content.
- [x] Print views for every document.
- [x] 79 passing unit tests (formatting, passwords, RBAC, pricing, numbering, admin schemas, and zod schemas).

### Administration
- [x] **Users** (`/settings/users`) — list/search, create/edit with password + role assignment, block/unblock.
- [x] **Roles** (`/settings/roles`) — list, create/edit with ability assignment (check all), delete.
- [x] **My profile** (`/settings/profile`) — edit own profile and change password (signs out on change).
- [x] **General settings** (`/settings/more`) — key/value settings with `setting_changelog` audit trail.

### Finance
- [x] **Accounts** (`/settings/accounts`) — income and expense accounts (list, create/edit, delete → deactivate when in use).
- [x] **Expenses** (`/expenses`) — list/search, create/edit, delete; income/expense account, requester, project, amount, narration, and a hardened receipt upload (MIME allow-list, 5 MB cap, random filename).

---

## 3. Remaining work — parity with `laraforma`

These exist in the original app and must be ported. Each is unchecked until shipped.

### Internet / ISP billing
- [ ] `internet_customers`, `internet_invoices` / `internet_invoice_packages` models.
- [ ] Recurring billing (`effective_from`/`effective_to`), package line items, `WE/INTERNET/INV` numbering.
- [ ] List/detail/print views.

### Projects
- [ ] `projects`, `project_statuses`, `project_files` models.
- [ ] Status timeline; hardened file attachments; manager/customer/budget/time fields.

### Dashboard & notifications
- [ ] Income chart and recent projects (current dashboard is simplified).
- [ ] Due-invoice reminder emails (`customer_due_message`, `office_due_message`), SMTP from env only.

### Data / housekeeping
- [ ] Dedupe `internet_invoice_list` abilities (76 → 75).
- [ ] Decide on `password_resets` (no primary key) and the `migrations` table in the schema.
- [ ] Triage `npm audit` findings (dev/toolchain).

---

## 4. Workflow & gates (see RULES.md)

1. **Branch per feature** — never commit/push to `main`; the owner creates and merges PRs.
2. **Small commits** — one logical unit each.
3. **No merge without passing tests** — every unit carries tests and `npm test` must pass.
4. Definition of done per change: `npm test`, `npm run lint`, `npx tsc --noEmit`, `npm run build`.

---

## 5. Security invariants (from RULES.md)

- No `eval`, `shell_exec`, `child_process`, or web terminal of any kind.
- No hardcoded credentials; admin seeded from env; all legacy passwords are burned.
- All DB access through Prisma; RBAC checked server-side on every action.
- Auth.js only; server-only code never imported into client components.
- Never copy files from the compromised `laraforma` tree.
