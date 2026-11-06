# RULES.md — Agent Working Agreement

This file is the binding working agreement for every contributor — human or agent —
to the `welink-sales` repository. Read it before making any change.

## 1. Three governing rules

`welink-sales` is a security-sensitive rebuild of a previously-compromised invoicing
application. Three rules govern all work:

1. **Every feature starts from a branch.**
2. **Work is committed in small, atomic units.**
3. **No unit of work merges without passing tests for it.**

Together they keep `main` always releasable, make each change reviewable in isolation,
and let any single change be traced or reverted.

## 2. Git workflow

### 2.1 Branching

- `main` is the integration branch. It must always build and pass tests.
- **Never commit directly to `main`.**
- Every feature, fix, chore, or doc change starts from a new branch off the latest `main`:

  ```bash
  git checkout main
  git pull --ff-only
  git checkout -b <type>/<short-kebab-name>
  ```

- One branch = one concern. Do not bundle unrelated changes on one branch.

### 2.2 Branch naming

| Type          | Prefix      | Example                    |
|---------------|-------------|----------------------------|
| Feature       | `feature/`  | `feature/invoice-pdf`      |
| Bug fix       | `fix/`      | `fix/vat-rounding`         |
| Tests         | `test/`     | `test/rbac-authorization`  |
| Chore/tooling | `chore/`    | `chore/ci-audit`           |
| Documentation | `docs/`     | `docs/agent-rules`         |
| Refactor      | `refactor/` | `refactor/pricing-service` |

Lowercase kebab-case.

### 2.3 Small units of work

- A commit is **one logical change** and must be understandable from its message alone.
- Prefer many small commits over one large commit.
- Every commit leaves the repo in a working state (it builds and runs).
- Do not push half-finished or `WIP` work to a shared branch; keep it local and
  squash/amend before pushing.

**Good units of work**

- `feat(users): add super/active/theme columns to users migration`
- `feat(authz): enforce invoice_store ability in Invoices component`
- `feat(pricing): add PricingService with VAT and withholding tests`

**Bad units of work**

- `update stuff`
- one commit that adds a migration, a model, five Livewire components, and a seeder.

### 2.4 Commit messages

Conventional Commits, imperative mood, subject ≤ 72 characters:

```
<type>(<scope>): <subject>

<body (optional): the why and the what>
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `security`.

### 2.5 Merging

- Push the branch and open a pull request against `main`.
- A change lands on `main` only after review and CI pass (tests + `composer audit`).
- **Test gate (hard requirement):** a branch is **not** merged until tests for that
  change are written and the full suite passes (`php artisan test`). Pure docs/config
  changes are the only exception and must be noted in the commit message.
- Rebase (or squash) the branch onto `main` before merging; keep history linear.

## 3. Non-negotiable security invariants

These derive from the incident report (see `docs/SPECIFICATION.md` §6) and are enforced
in every review:

1. No `shell_exec`, `exec`, `system`, `passthru`, `proc_open`, `popen`, `eval`, or `assert`.
2. No hardcoded credentials. Secrets come only from `.env` / a vault; `APP_KEY` is never committed.
3. `User` must implement `MustVerifyEmail`; application routes sit behind `auth` + `verified`.
4. RBAC abilities must be **enforced** (middleware/policy), not merely defined.
5. Never copy files from `public_html/laraforma` (the compromised tree). Reference it only
   for behaviour/values; always regenerate `vendor/` with `composer install`.

## 4. Definition of done (per commit)

- [ ] One logical change, small and reviewable.
- [ ] Tests for this change are included and the full suite passes (`php artisan test`).
- [ ] No secrets, `.env`, `*.log`, `vendor/`, or `node_modules/` staged.
- [ ] `composer audit` reports no new advisories.
- [ ] Commit message follows §2.4.
- [ ] Pushed to a branch — never straight to `main`.

## 5. Quick reference

```bash
# start a feature
git checkout main && git pull --ff-only
git checkout -b feature/<name>

# stage ONLY the intended files (review with `git status` first)
git add path/to/file ...

# commit one small unit
git commit -m "feat(scope): subject"

# push and open a pull request
git push -u origin feature/<name>
```

## 6. Scope

These rules apply to all contributors and all automated/agent tooling in this repository.
Changes to this file go through the same branch + pull-request process as any other change.
