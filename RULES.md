# RULES.md — Agent Working Agreement

This file is the binding working agreement for every contributor — human or agent —
to the `welink-sales` repository. Read it before making any change.

## 1. Three governing rules

`welink-sales` is a security-sensitive rebuild of a previously-compromised invoicing
application (Next.js + TypeScript + Prisma + MySQL). Three rules govern all work:

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

- `feat(auth): add credentials provider against the users table`
- `feat(customers): add customers list server component`
- `feat(pricing): add VAT and withholding totals with tests`

**Bad units of work**

- `update stuff`
- one commit that adds a Prisma model, a server action, three UI components, and a test.

### 2.4 Commit messages

Conventional Commits, imperative mood, subject ≤ 72 characters:

```
<type>(<scope>): <subject>

<body (optional): the why and the what>
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `security`.

**No co-author trailers.** Commit messages must not contain `Co-authored-by:` or any other
co-author/attribution line (including AI/tool attribution). Commits are authored by a single
human author only.

### 2.5 Merging

- Push the branch and open a pull request against `main`.
- A change lands on `main` only after review and CI pass (tests + `npm audit`).
- **Test gate (hard requirement):** a branch is **not** merged until tests for that
  change are written and the full suite passes (`npm test`). Pure docs/config changes
  are the only exception and must be noted in the commit message.
- Rebase (or squash) the branch onto `main` before merging; keep history linear.

## 3. Non-negotiable security invariants

These derive from the incident report and are enforced in every review:

1. No remote-code-execution surface: no `eval`, no `child_process` `exec`/`spawn`
   (or `*Sync`) with untrusted input, and no `dangerouslySetInnerHTML` with
   unsanitized data.
2. No hardcoded credentials. Secrets come only from `.env` (gitignored) / a vault:
   `DATABASE_URL`, `AUTH_SECRET`, SMTP credentials, etc. Never commit `.env`.
3. All database access goes through Prisma (parameterized). Never interpolate user
   input into raw SQL.
4. RBAC abilities must be **enforced** server-side, not merely defined. `super`
   bypasses; every protected action checks the relevant ability.
5. Authentication and email verification are enforced via Auth.js; no protected route
   or server action runs without a session/ability check.
6. Never copy files from the compromised `public_html/laraforma` tree. Reference it
   only for behaviour/values; always regenerate dependencies with `npm install`.
7. Server-only code (`lib/prisma.ts`, DB access, secrets) must never be imported into
   Client Components (`'use client'`). Keep everything sensitive on the server.

## 4. Definition of done (per commit)

- [ ] One logical change, small and reviewable.
- [ ] Tests for this change are included and the full suite passes (`npm test`).
- [ ] Lint passes (`npm run lint`).
- [ ] No secrets, `.env`, `node_modules/`, `.next/`, or `generated/` staged.
- [ ] `npm audit` reports no new high/critical advisories.
- [ ] Commit message follows §2.4.
- [ ] Pushed to a branch — never straight to `main`.

## 5. Quick reference

```bash
# start a feature
git checkout main && git pull --ff-only
git checkout -b feature/<name>

# stage ONLY the intended files (review with `git status` first)
git add path/to/file ...

# run the tests before committing
npm test

# lint
npm run lint

# commit one small unit
git commit -m "feat(scope): subject"

# push and open a pull request
git push -u origin feature/<name>
```

## 6. Scope

These rules apply to all contributors and all automated/agent tooling in this repository.
Changes to this file go through the same branch + pull-request process as any other change.

## 7. Feature scope: mirror the original `laraforma`

- This app is a faithful rebuild of the original `laraforma` invoicing project. **Do not add new features, modules, screens, fields, or behaviours that do not exist in `laraforma`.**
- The goal is **feature parity** — same screens, same data model, same behaviour. When in doubt, match the original rather than inventing.
- Internal refactors (e.g. extracting pricing/numbering into testable services) are allowed. New user-facing features are **not**.
- Any genuinely new feature requires explicit sign-off from the project owner and must be recorded here *before* it is built.

