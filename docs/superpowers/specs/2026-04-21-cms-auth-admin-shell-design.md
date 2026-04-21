# CMS Sub-project #1: Auth & Admin Shell

**Status:** Approved — ready for implementation plan
**Date:** 2026-04-21
**Branch:** `rebuild`
**Sub-project:** 1 of 5 in the CMS buildout

## Context

The `rebuild` branch of the Hello Monday site is a static Next.js 16 app with no CMS. The goal is to build a custom CMS in five sequenced sub-projects:

1. **Auth & admin shell** ← this spec
2. Media center
3. Simple collections (Locations, FAQ, Team, Code-of-Honor, Awards)
4. Rich collection: Projects
5. Page builder + globals

This spec covers only sub-project #1. Each subsequent sub-project will get its own spec and plan.

## Goal

Deliver a protected `/admin` area with a working login flow and an empty-but-navigable admin shell, ready for later sub-projects to fill in. Nothing else.

## Scope decisions (from brainstorm)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Who logs in | Single admin | Small agency site; no user management needed |
| Credentials source | Email + password from env vars | Zero external dependencies, no DB required |
| Session strategy | JWT (stateless) | No DB in this sub-project; scales to 7-day sessions |
| Admin URL | `/admin` via route group `(admin)` | Standard pattern, clean separation from public site |
| Deliverable | Shell skeleton with nav stubs | Locks UX pattern; defers storage decisions to sub-project #2 |
| Visual style | Neutral admin (Notion/Linear-like) | Editor productivity over brand expression |

## Architecture

### Stack

- `next-auth@5` (Auth.js v5 — App Router native)
- `bcryptjs` for password hash comparison
- `zod` for credential-shape validation (already a dependency)
- Next.js 16 `proxy.ts` for route protection (Next 16 renamed `middleware` → `proxy`)
- Existing `shadcn/ui` primitives for the shell UI — no new component library

### Route structure

```
src/app/
├── (site)/                        # existing public routes (unchanged)
└── (admin)/                       # NEW route group, separate layout
    └── admin/
        ├── login/page.tsx         # login form (public — not protected)
        ├── layout.tsx             # admin shell (sidebar + top bar)
        ├── page.tsx               # /admin → dashboard placeholder
        ├── media/page.tsx         # stub for sub-project #2
        ├── projects/page.tsx      # stub for sub-project #4
        ├── pages/page.tsx         # stub for sub-project #5
        └── settings/page.tsx      # stub
```

### Auth flow

1. User requests any `/admin/*` path.
2. `src/proxy.ts` runs; calls `auth()` from Auth.js to check for a valid JWT cookie.
3. No session → 307 redirect to `/admin/login?from=<original-path>`.
4. User submits login form. The form posts via Auth.js's built-in `signIn('credentials', ...)` server action.
5. The `Credentials` provider's `authorize()`:
   - Validates shape with `zod` (email format, non-empty password).
   - Compares email against `ADMIN_EMAIL` in constant time.
   - Runs `bcrypt.compare(password, ADMIN_PASSWORD_HASH)`.
   - Returns `{ id: "admin", email, role: "admin" }` on success, `null` on failure.
6. On success, Auth.js issues an HTTP-only, Secure, `SameSite=Lax` JWT cookie and redirects to the `from` param (or `/admin` if absent).
7. Logout: a `signOut()` server action clears the cookie and redirects to `/admin/login`.

### Session configuration

- Strategy: `jwt`
- `maxAge`: 7 days (`60 * 60 * 24 * 7`)
- Sliding: yes (JWT re-issued on activity)
- Cookie name: Auth.js default (`authjs.session-token` / `__Secure-authjs.session-token` in prod)
- `callbacks.jwt` stamps `role: "admin"` into the token — future-proofs sub-projects that may add more roles.

## Files to create

| Path | Purpose |
|------|---------|
| `src/auth.ts` | Auth.js config + exports `{ handlers, signIn, signOut, auth }` |
| `src/proxy.ts` | Route protection (Next 16 proxy) with `config.matcher` for `/admin/:path*` excluding `/admin/login` and `/api/auth/*` |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js handler — re-exports `handlers.GET`, `handlers.POST` |
| `src/app/(admin)/admin/layout.tsx` | Admin shell (sidebar + top bar) |
| `src/app/(admin)/admin/page.tsx` | Dashboard placeholder |
| `src/app/(admin)/admin/login/page.tsx` | Login page (server component) |
| `src/app/(admin)/admin/login/LoginForm.tsx` | Client component — form + server action wiring |
| `src/app/(admin)/admin/media/page.tsx` | Stub |
| `src/app/(admin)/admin/projects/page.tsx` | Stub |
| `src/app/(admin)/admin/pages/page.tsx` | Stub |
| `src/app/(admin)/admin/settings/page.tsx` | Stub |
| `src/components/admin/Sidebar.tsx` | Left nav — list of sections, active-state styling |
| `src/components/admin/UserMenu.tsx` | Top-right dropdown: admin email + Sign out |
| `src/components/admin/TopBar.tsx` | Top bar with page title slot + user menu |
| `scripts/hash-password.ts` | Small CLI: `npx tsx scripts/hash-password.ts` prompts for a password, prints bcrypt hash |
| `.env.example` | Documents the new env vars (see below) |

### Modifications to existing files

| Path | Change |
|------|--------|
| `src/app/globals.css` | Add admin-scoped CSS variables under `[data-admin]` selector (see tokens below) |
| `package.json` | Add `next-auth@5`, `bcryptjs`, `@types/bcryptjs` |

## Environment variables (new)

| Name | Purpose | Example |
|------|---------|---------|
| `AUTH_SECRET` | JWT signing secret | Generate with `openssl rand -base64 32` |
| `ADMIN_EMAIL` | The single admin's email | `admin@hellomonday.example` |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the admin password | Generated via `scripts/hash-password.ts` |

All three are validated at module-load time of `src/auth.ts`. Missing any → throw a clear error listing the missing names. Fail fast — never ship a broken admin.

`AUTH_SECRET` must remain stable across deploys; changing it invalidates all active sessions. Documented in `.env.example`.

## UX

### Login page (`/admin/login`)

- Full-viewport, neutral gray background (`hsl(var(--admin-bg))`)
- Centered card (max-width 400px, white surface, soft shadow)
- Small "Hello Monday" text mark at the top
- Form fields, stacked:
  - Email (`<Input type="email" required autoFocus>`)
  - Password (`<Input type="password" required>`)
  - Submit button (`<Button>Sign in</Button>`), full width, loading state while pending
- Error region below form. On failure: `Invalid email or password.` — never disclose which field is wrong. On submit, focus moves to the error message for screen readers (`role="alert"`, `aria-live="polite"`).
- After a failed attempt, the next submit has a 1-second artificial delay (mitigates brute force without needing rate-limiting infra).
- No "forgot password" link. Recovery = rotate the env var and redeploy.

### Admin shell (`(admin)/admin/layout.tsx`)

```
┌──────────────┬───────────────────────────────────────┐
│              │  Page title                [User ▾]   │
│   Sidebar    ├───────────────────────────────────────┤
│              │                                       │
│ • Dashboard  │                                       │
│ • Media      │            {children}                 │
│ • Projects   │                                       │
│ • Pages      │                                       │
│ • Settings   │                                       │
└──────────────┴───────────────────────────────────────┘
```

- **Root** of admin layout has `data-admin` attribute so the scoped CSS variables apply.
- **Sidebar**: 240px fixed on desktop, white background, bottom border to separate from top bar. Nav items use `lucide-react` icons. Active route has a 2px left accent border + slightly bolder text. Hover: subtle background tint.
- **Top bar**: 56px, 1px bottom border. Left side renders a page title (each page renders its own `<h1>` as the first child in the main pane — no title context/provider needed for this sub-project; can be revisited if more shell coordination emerges). Right side: `<UserMenu>` showing the admin email and a "Sign out" menu item.
- **Main pane**: scrollable, `max-w-5xl` container, `p-6 md:p-8`. Each stub page renders `<h1>` with section name + muted "Coming soon" text.
- **Mobile (<768px)**: sidebar collapses to a hamburger drawer. Functional, not polished — admin is desktop-first.

### Visual tokens (new, admin-scoped)

Added to `src/app/globals.css` under `[data-admin]`:

| Token | Value (HSL) | Used for |
|-------|-------------|----------|
| `--admin-bg` | `0 0% 98%` | Page background |
| `--admin-surface` | `0 0% 100%` | Cards, sidebar |
| `--admin-border` | `0 0% 90%` | Dividers, input borders |
| `--admin-text` | `0 0% 15%` | Primary text |
| `--admin-text-muted` | `0 0% 45%` | Secondary text |
| `--admin-accent` | reuses `var(--primary)` | Active nav, focus rings, primary buttons |

The admin layout sets `data-admin` on its root, so these variables override public-site tokens within the admin subtree only.

### Components reused (no new primitives)

- `<Button>`, `<Input>`, `<Label>` from `src/components/ui/*`
- `<DropdownMenu>` for `<UserMenu>`

## Error handling

| Situation | Behavior |
|-----------|----------|
| Missing required env var at boot | Throw at `src/auth.ts` module-load; error lists every missing name |
| Invalid credentials | `authorize()` returns `null`; login page renders generic error |
| Malformed email/password input | `zod` parse fails in `authorize()`; returns `null`; same generic error |
| Expired JWT | `auth()` returns `null` → proxy redirects to login with `from` |
| Server error in `authorize()` | Caught by Auth.js; login page shows "Something went wrong. Try again." |
| Double-submit / concurrent sign-in | Submit button disabled while pending |

## Testing

No test framework is currently configured in the project. Automated tests are deferred to sub-project #3 when there's enough shared infrastructure to make setup worthwhile.

**Manual test checklist** (to be run before merging sub-project #1):

1. Unauthenticated GET `/admin` → 307 to `/admin/login?from=%2Fadmin`
2. Unauthenticated GET `/admin/media` → 307 to `/admin/login?from=%2Fadmin%2Fmedia`
3. Login with correct credentials → redirected to `/admin`
4. Login with wrong email → generic error, no disclosure
5. Login with wrong password → generic error, no disclosure
6. Login with malformed email → generic error (zod caught)
7. After login, `from=/admin/settings` redirects to `/admin/settings`, not `/admin`
8. Cookie inspection: HTTP-only, Secure (in prod), SameSite=Lax, JWT-shaped
9. Sign out → cookie cleared, redirected to `/admin/login`
10. Expired/tampered JWT → proxy redirects to login
11. Missing env var on boot → server refuses to start with clear error
12. All five stub pages render without errors when authenticated

## Out of scope (explicitly deferred)

- Rate limiting / IP lockout (revisit when we have a DB in sub-project #2)
- CSRF tokens on non-auth forms (Auth.js handles auth CSRF; no other admin mutations exist yet)
- Sign-in audit log (add when we have a DB)
- Password reset / recovery flow (env-var rotation is the recovery path)
- Polished mobile admin (functional only)
- Two-factor authentication
- OAuth providers
- Multi-user support / roles

## Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Env-var rotation is manual | If password is compromised, must regen hash and redeploy | Acceptable for single-admin agency site; flagged in README |
| `AUTH_SECRET` drift across deploys | All active sessions invalidated | Documented in `.env.example`; stored in deployment env, not rotated lightly |
| bcrypt cost factor too low / high | Login slow, or brute force easier | Use bcrypt default cost (10) — balanced |
| Auth.js v5 is still beta at time of writing | API may shift | Pin exact version; subscribe to release notes during implementation |

## Out-of-scope-but-follow-ups

- Automated tests for the auth flow (defer to sub-project #3)
- Session storage migration to DB (optional, after sub-project #2 adds a DB)
- Add a `role` check helper (`requireAdmin()`) once more roles exist

## Transition

Next step: write a detailed implementation plan (ordered tasks, file-by-file) via the `superpowers:writing-plans` skill. The plan will reference this spec and break the work into checkable units.
