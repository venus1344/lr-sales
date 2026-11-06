# welink-sales — Implementation Plan

**Project:** WeLink Sales — invoicing / ERP application (replacement for `laraforma`)
**Status:** Draft for approval — do not build until authorized
**Companion:** `docs/SPECIFICATION.md`

---

## 0. Executive summary

Rebuild the invoicing app from scratch on **PHP 8.3 + Laravel 12 (or 13) + Livewire 3**,
preserving the old app's data, workflows, document numbering, and look-and-feel, while
eliminating every vulnerability that made the old app the entry point for the 2024–2026
compromise.

**Hard rules for the build** (each maps to a confirmed incident root cause):

1. No `shell_exec`/`eval`/web-terminal of any kind.
2. No hardcoded credentials; admin seeded from an env-provided random password.
3. `MustVerifyEmail` enforced; registration disabled.
4. RBAC abilities actually enforced (old app only defined them).
5. Fresh scaffold + `composer install`; **never** copy from the compromised `laraforma` tree
   (which still contains 4 live `.log` backdoors — see SPEC §2).
6. Supported framework/PHP only, with `composer audit` in CI.

---

## 1. Phase 0 — Environment & ground rules

**Goal:** establish a clean, safe working environment before writing app code.

- [ ] Confirm target versions (Laravel 12 vs 13; see open decision §9 of SPEC). Default: **Laravel 12 / PHP 8.3**.
- [ ] Create the project folder `welink-sales/` via `composer create-project laravel/laravel` (fresh), then `composer require livewire/livewire barryvdh/laravel-dompdf` (Livewire 3, dompdf ^3).
- [ ] Add `docs/` (this plan + spec) into the repo; initialize git; commit the pristine scaffold.
- [ ] **Quarantine, not reuse:** treat `public_html/laraforma` as read-only reference. Do not copy `vendor/`, `.env`, or any stray `.log` file. Reference it only for behaviour/values.
- [ ] Verify local toolchain: PHP 8.3.31, Composer 2.8, Node 22 (already present).
- [ ] Set `.env.example` with no secrets; `.env` gitignored; `APP_KEY` generated locally.

**Exit criteria:** `welink-sales` runs locally (`php artisan serve`), fresh vendor tree, git clean, `composer audit` passes.

---

## 2. Phase 1 — Foundation (auth & RBAC)

**Goal:** a hardened identity + authorization layer, the direct remediation of root causes #1, #3, #4.

- [ ] `User` model implements `MustVerifyEmail`; `$fillable` allow-list; casts.
- [ ] Auth controllers (Laravel built-in): login, logout, email verification, password reset/change; `register => false`.
- [ ] Login throttling; password confirmation for destructive actions.
- [ ] RBAC rebuild: `Role`, `Ability`, `role_user`, `ability_role` models + relations.
- [ ] Migrations for `users`, `roles`, `abilities`, `role_user`, `ability_role`.
- [ ] Seeder for the 76 abilities (from dump data) and the initial `Admin` role.
- [ ] **Enforcement:** an `ability:<name>` middleware + a `User::hasAbility()` helper + policies; `super` bypass. Every route and Livewire component checks its ability.
- [ ] Guarded admin seeder: reads `ADMIN_NAME/EMAIL/PASSWORD` from env, aborts if missing, hashes password, marks verified, flags `super`.

**Exit criteria:** login/verify/reset work; an unverified user is blocked; a user without `invoice_store` cannot create an invoice; admin seeder requires an env password.

---

## 3. Phase 2 — Master data

**Goal:** the reference entities the documents depend on.

- [ ] Migrations + models + Livewire components + views for: `customers`, `suppliers`, `item_categories`, `items`, `currencies`, `packages`.
- [ ] CRUD with validation, pagination, search, soft-delete where decided.
- [ ] TIN/VRN formatting helpers (`formatTIN`, `formatVRN`) moved into a testable support class.
- [ ] Ability checks on every action (`*_list`, `*_store`, `*_update`, `*_remove`).

**Exit criteria:** full CRUD for each entity, matching the old UI, with working authorization.

---

## 4. Phase 3 — Documents (core invoicing)

**Goal:** the heart of the app — proformas, invoices, delivery notes, LPOs.

- [ ] Migrations + models for `proformas`/`proforma_items`, `invoices`/`invoice_items`,
      `delivery_notes`/`delivery_note_items`, `local_purchase_orders`/`local_purchase_order_items`.
- [ ] `DocumentNumberService` implementing `WE/PF`, `WE/INV`, `WE/LPO`, `WE/INTERNET/INV` numbering (fixing old substring bugs); unit-tested.
- [ ] Line-item management (add/edit/remove items with quantity/price, unit measure, serial for delivery notes).
- [ ] Totals engine: subtotal, discount, VAT (18% default), withholding tax (2% default), labor charge, advance, exchange-rate conversion — extracted into a pure, testable `PricingService`.
- [ ] **Proforma → Invoice conversion** (links via `proforma_id`), and invoice → delivery note.
- [ ] List/search/detail views; status handling.
- [ ] PDF export via dompdf for each document (proforma, invoice, LPO, delivery note) reusing the old print layouts.

**Exit criteria:** create→save→print each document; conversion works; numbering increments correctly; totals are correct under multiple currencies and taxes; PDFs render.

---

## 5. Phase 4 — Internet/ISP billing

- [ ] Migrations + models + UI for `internet_customers`, `internet_invoices`, `internet_invoice_packages`.
- [ ] Recurring billing fields (`effective_from`/`effective_to`), package line items, reference numbering.
- [ ] PDF + list/detail views.

---

## 6. Phase 5 — Accounts & expenses

- [ ] Migrations + models + UI for `income_accounts`, `expense_accounts`, `expenses`.
- [ ] Expense form with receipt upload (hardened: MIME allow-list, size cap, random name, non-executable storage), narration, project/account linkage.

---

## 7. Phase 6 — Projects

- [ ] Migrations + models + UI for `projects`, `project_statuses`, `project_files`.
- [ ] Status timeline, file attachments (same hardening as receipts), manager/customer/budget/time fields.

---

## 8. Phase 7 — Settings, dashboard, email

- [ ] `settings` key/value + `setting_changelog` audit (who changed what, from→to).
- [ ] Dashboard: summary cards, income chart, recent projects (reuse old data shapes).
- [ ] Due-invoice reminder emails (`customer_due_message`, `office_due_message`) via Laravel Mail + queue; SMTP config from env only.

---

## 9. Phase 8 — Data migration & verification

- [ ] Produce migrations that match the cleaned schema (SPEC §5).
- [ ] Purge rogue accounts (`aemmanuel199@gmail.com`, `support@laraforma.gq`, unverified supers) from the import.
- [ ] Import cleaned dump table-by-table in FK order; re-seed abilities/settings.
- [ ] Reconcile record counts vs source; spot-check rendered documents.

---

## 10. Phase 9 — Hardening, testing, documentation

- [ ] Feature tests: auth/verification, RBAC enforcement, document flows, totals, numbering.
- [ ] Unit tests: `PricingService`, `DocumentNumberService`, TIN/VRN formatters.
- [ ] `composer audit` (and a scheduled CI audit) green.
- [ ] Host-level hardening checklist (from the remediation docs): `disable_functions`,
      separate OS user/container, WAF, HTTPS, scheduled backups, monitoring.
- [ ] Runbook: deploy + credential rotation + post-deploy malware sweep.

**Exit criteria:** test suite green; audit green; the security checklist in SPEC §6 is fully verified.

---

## 11. Phase 10 — Deployment & cutover (separate authorization)

- [ ] Provision a **new, isolated** hosting user/container (never the WordPress account).
- [ ] Fresh MySQL DB + dedicated user; rotate credentials from the burned set (`SGa2.1G1p.`, old SMTP passwords, old `APP_KEY`).
- [ ] Deploy with `APP_DEBUG=false`, HTTPS, `disable_functions` enforced.
- [ ] Import data, seed the first admin, verify login/prints, enable 2FA (if in scope).
- [ ] Decommission/remove the old `laraforma` app and the four remaining `.log` backdoors from the old tree.

---

## 12. Milestones & acceptance

| Phase | Deliverable | Acceptance signal |
|-------|-------------|-------------------|
| 0 | Clean scaffold | runs locally, audit green |
| 1 | Auth + RBAC | verify + ability enforcement demo |
| 2 | Master data | CRUD + auth checks |
| 3 | Documents | full invoice/proforma/LPO/DN flow + PDF |
| 4 | ISP billing | recurring invoice flow |
| 5 | Accounts/expenses | expense + receipt upload |
| 6 | Projects | project + statuses + files |
| 7 | Settings/dashboard/email | chart + changelog + emails |
| 8 | Data migration | counts reconciled |
| 9 | Tests + hardening | suite + audit green |
| 10 | Deploy | cutover + old app removed |

---

## 13. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Reintroducing the compromised code | Fresh scaffold; `laraforma` is reference-only; no `vendor/` or stray files copied |
| Data loss during migration | Import to a staging DB first; reconcile counts; keep backups |
| Staff workflow disruption | Preserve numbering, screen layout, and print output |
| Dependency CVEs | Pin supported versions; `composer audit` in CI; scheduled updates |
| Same-account re-infection | Isolated hosting user/container; `disable_functions`; WAF |
| Scope creep | v1 = feature parity; §6.1 items are explicitly deferred |

---

## 14. What we will **not** build (remediation of the exact exploits)

- ❌ `OnlineTerminal` (web shell) — not recreated.
- ❌ `EnsureEverythingIsOkay` (public seeder with hardcoded admin) — not recreated.
- ❌ Any hardcoded admin/password in code or migrations.
- ❌ Ability definitions without enforcement.
- ❌ `User` without `MustVerifyEmail`.
