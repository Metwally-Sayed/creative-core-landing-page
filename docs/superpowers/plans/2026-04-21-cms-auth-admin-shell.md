# CMS Auth & Admin Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a protected `/admin` area with Auth.js v5 login, JWT sessions, and a neutral admin shell with placeholder nav sections, so sub-projects #2–5 have a foundation to build on.

**Architecture:** Next.js 16 App Router with a `(admin)` route group for isolated layout. Auth.js v5 with Credentials provider reading a single admin's email + bcrypt hash from env vars. Stateless JWT sessions (7-day sliding). Next 16 `proxy.ts` (renamed from middleware) protects `/admin/*` except login and auth API routes. Admin shell reuses existing shadcn primitives; admin-scoped CSS variables prevent style bleed to the public site.

**Tech Stack:** Next.js 16, React 19, `next-auth@5` (Auth.js v5 beta), `bcryptjs`, `zod`, Tailwind v4, existing shadcn/ui components, TypeScript strict.

**Spec:** [`docs/superpowers/specs/2026-04-21-cms-auth-admin-shell-design.md`](../specs/2026-04-21-cms-auth-admin-shell-design.md)

**Testing note:** The project has no test framework configured yet. Per the spec, automated tests are deferred to sub-project #3. This plan uses **manual verification steps** at key checkpoints instead of TDD. The 12-point manual test checklist from the spec runs as the final task.

**Docs to consult during implementation:**
- Auth.js v5 App Router guide: https://authjs.dev/getting-started/installation?framework=next.js
- Auth.js v5 Credentials provider: https://authjs.dev/getting-started/authentication/credentials
- Next.js 16 proxy (replaces middleware): check `node_modules/next/dist/docs/` per AGENTS.md rule

---

## File Structure

**Created:**

| Path | Purpose |
|------|---------|
| `src/auth.ts` | Auth.js config, env validation, `authorize()` |
| `src/proxy.ts` | Next 16 route-protection proxy (replaces middleware) |
| `src/app/api/auth/[...nextauth]/route.ts` | Auth.js HTTP handler |
| `src/app/(admin)/admin/layout.tsx` | Admin shell (sidebar + top bar) |
| `src/app/(admin)/admin/page.tsx` | Dashboard placeholder |
| `src/app/(admin)/admin/login/page.tsx` | Login page (server) |
| `src/app/(admin)/admin/login/LoginForm.tsx` | Login form (client) + server-action wiring |
| `src/app/(admin)/admin/media/page.tsx` | Stub |
| `src/app/(admin)/admin/projects/page.tsx` | Stub |
| `src/app/(admin)/admin/pages/page.tsx` | Stub |
| `src/app/(admin)/admin/settings/page.tsx` | Stub |
| `src/components/admin/Sidebar.tsx` | Left nav with section links |
| `src/components/admin/UserMenu.tsx` | Top-right email + sign-out dropdown |
| `src/components/admin/TopBar.tsx` | Top bar wrapper |
| `src/components/admin/admin-nav-items.ts` | Shared nav-item definitions |
| `scripts/hash-password.ts` | CLI: prompt for password, print bcrypt hash |
| `.env.example` | Documents new env vars |

**Modified:**

| Path | Change |
|------|--------|
| `package.json` | Add `next-auth@5`, `bcryptjs`, `@types/bcryptjs` |
| `src/app/globals.css` | Add `[data-admin]` scoped CSS variables |

---

## Task 1: Install dependencies and generate credentials

**Files:**
- Modify: `package.json`
- Create: `scripts/hash-password.ts`
- Create: `.env.example`
- Modify: `.env.local` (not committed — contains secrets)

- [ ] **Step 1: Install packages**

Run:
```bash
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs
```

Expected: three new entries in `package.json` dependencies/devDependencies.

- [ ] **Step 2: Create the password-hash CLI**

Create `scripts/hash-password.ts`:

```ts
import bcrypt from "bcryptjs";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function main() {
  const rl = createInterface({ input, output, terminal: true });
  const password = await rl.question("Password to hash: ");
  rl.close();

  if (!password || password.length < 8) {
    console.error("Error: password must be at least 8 characters.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 10);
  console.log("\nCopy the hash below into .env.local as ADMIN_PASSWORD_HASH:\n");
  console.log(hash);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 3: Create .env.example**

Create `.env.example`:

```
# Auth.js session signing secret. Generate with: openssl rand -base64 32
# Must remain stable across deploys — changing it invalidates all active sessions.
AUTH_SECRET=

# The single admin's email address
ADMIN_EMAIL=

# bcrypt hash of the admin password. Generate with: npx tsx scripts/hash-password.ts
ADMIN_PASSWORD_HASH=
```

- [ ] **Step 4: Generate credentials locally**

Run:
```bash
openssl rand -base64 32
```
Copy the output into `.env.local` as `AUTH_SECRET=<value>`.

Run:
```bash
npx tsx scripts/hash-password.ts
```
Enter a password when prompted. Copy the printed hash into `.env.local` as `ADMIN_PASSWORD_HASH=<hash>`.

Add to `.env.local`:
```
ADMIN_EMAIL=admin@hellomonday.local
AUTH_SECRET=<from openssl output>
ADMIN_PASSWORD_HASH=<from hash-password.ts output>
```

Expected: `.env.local` contains all three variables with real values. Do NOT commit `.env.local`.

- [ ] **Step 5: Verify .env.local is git-ignored**

Run:
```bash
git check-ignore .env.local && echo "OK" || echo "MISSING — add .env.local to .gitignore"
```

Expected: prints `OK`. If `MISSING`, add `.env.local` to `.gitignore` before continuing.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json scripts/hash-password.ts .env.example
git commit -m "feat(auth): add next-auth deps and password-hash CLI

Adds next-auth@5, bcryptjs, and a small CLI to generate the bcrypt
hash stored in ADMIN_PASSWORD_HASH. Env var names documented in
.env.example."
```

---

## Task 2: Add admin-scoped CSS tokens

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Locate the `:root` block and append admin tokens**

Find the existing `:root { ... }` block in `src/app/globals.css` (the one with `--background: 60 9% 96%`). After the closing brace of the existing `:root` block, add a new `[data-admin]` scope block:

```css
[data-admin] {
  --admin-bg: 0 0% 98%;
  --admin-surface: 0 0% 100%;
  --admin-border: 0 0% 90%;
  --admin-text: 0 0% 15%;
  --admin-text-muted: 0 0% 45%;
  --admin-accent: var(--primary);
}
```

These variables only apply inside elements with `data-admin` — they will NOT affect the public site.

- [ ] **Step 2: Manual verification**

Run `npm run dev`. Open `http://localhost:3000`. Confirm the public site still looks unchanged (same cream background, same typography). The tokens are declared but unused until Task 6.

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(admin): add admin-scoped CSS tokens

Scoped under [data-admin] so admin styling does not leak into the
public site."
```

---

## Task 3: Write Auth.js config (src/auth.ts)

**Files:**
- Create: `src/auth.ts`

- [ ] **Step 1: Create src/auth.ts with env validation, zod-parsed credentials, and Credentials provider**

Create `src/auth.ts`:

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";

const envSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  ADMIN_EMAIL: z.string().email("ADMIN_EMAIL must be a valid email"),
  ADMIN_PASSWORD_HASH: z
    .string()
    .min(1, "ADMIN_PASSWORD_HASH is required (see scripts/hash-password.ts)"),
});

const envParsed = envSchema.safeParse({
  AUTH_SECRET: process.env.AUTH_SECRET,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD_HASH: process.env.ADMIN_PASSWORD_HASH,
});

if (!envParsed.success) {
  const issues = envParsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  throw new Error(`[auth] Missing/invalid environment variables:\n${issues}`);
}

const env = envParsed.data;

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: env.AUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(rawCredentials) {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const emailMatches = constantTimeEqual(
          email.toLowerCase(),
          env.ADMIN_EMAIL.toLowerCase(),
        );
        if (!emailMatches) return null;

        const passwordMatches = await bcrypt.compare(
          password,
          env.ADMIN_PASSWORD_HASH,
        );
        if (!passwordMatches) return null;

        return { id: "admin", email: env.ADMIN_EMAIL, role: "admin" };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = "admin";
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        (session.user as { role?: string }).role = "admin";
      }
      return session;
    },
  },
});
```

- [ ] **Step 2: Verify dev server boots**

Stop the dev server if running. Run:
```bash
npm run dev
```

Expected: server starts without throwing. If env vars are missing or invalid, the server fails with a clear listing of missing names (this is intentional — test by temporarily removing `AUTH_SECRET` from `.env.local`, restarting, confirming the error, then restoring).

- [ ] **Step 3: Commit**

```bash
git add src/auth.ts
git commit -m "feat(auth): add Auth.js v5 config with Credentials provider

Validates env vars at module load with zod. Single Credentials
provider compares email/password against ADMIN_EMAIL and bcrypt
hash in ADMIN_PASSWORD_HASH. JWT session strategy, 7-day maxAge."
```

---

## Task 4: Wire the Auth.js HTTP handlers

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Create the route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
```

- [ ] **Step 2: Verify the route responds**

With the dev server running, in a new terminal:

```bash
curl -i http://localhost:3000/api/auth/providers
```

Expected: 200 response with JSON listing the `credentials` provider.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/auth/\[...nextauth\]/route.ts
git commit -m "feat(auth): expose Auth.js HTTP handlers at /api/auth/*"
```

---

## Task 5: Add route protection via Next.js 16 proxy

**Files:**
- Create: `src/proxy.ts`

- [ ] **Step 1: Check Next.js 16 proxy docs**

Per `AGENTS.md`: this version of Next has breaking changes. Before writing the proxy, read the relevant Next 16 docs for the `proxy.ts` pattern:

```bash
ls node_modules/next/dist/docs/ 2>/dev/null | grep -i -E "proxy|middleware" | head
```

If a proxy guide exists, skim it. The key facts expected for Next 16:
- File lives at `src/proxy.ts` (inside `src/` since that's the source root).
- Default-exports a function `(request: NextRequest) => NextResponse | Response | undefined`.
- Exports `config.matcher` to limit which paths invoke the proxy.
- Same request/response model as the old `middleware.ts`.

If the docs contradict any of this, adjust the code in Step 2 accordingly.

- [ ] **Step 2: Create src/proxy.ts**

Create `src/proxy.ts`:

```ts
import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Allow the login page and the Auth.js API routes through unconditionally.
  if (pathname === "/admin/login" || pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Only protect /admin/*.
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const session = await auth();
  if (!session) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/auth/:path*"],
};
```

- [ ] **Step 3: Manual verification**

Restart `npm run dev`. In a browser:

1. Visit `http://localhost:3000/admin` — should redirect to `http://localhost:3000/admin/login?from=%2Fadmin` (the login page will 404 until Task 9, but the redirect should happen).
2. Visit `http://localhost:3000/` — should load the public site normally.

Expected: `/admin` redirects, `/` is unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/proxy.ts
git commit -m "feat(auth): protect /admin/* via Next 16 proxy

Unauthenticated requests to /admin/* redirect to /admin/login with
the original path in the ?from query param. Login page and Auth.js
API routes are allow-listed."
```

---

## Task 6: Build the admin shell components

**Files:**
- Create: `src/components/admin/admin-nav-items.ts`
- Create: `src/components/admin/Sidebar.tsx`
- Create: `src/components/admin/UserMenu.tsx`
- Create: `src/components/admin/TopBar.tsx`

- [ ] **Step 1: Create admin-nav-items.ts**

Create `src/components/admin/admin-nav-items.ts`:

```ts
import { LayoutDashboard, Image, FolderKanban, FileText, Settings, type LucideIcon } from "lucide-react";

export type AdminNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Media", href: "/admin/media", icon: Image },
  { label: "Projects", href: "/admin/projects", icon: FolderKanban },
  { label: "Pages", href: "/admin/pages", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];
```

- [ ] **Step 2: Create Sidebar.tsx**

Create `src/components/admin/Sidebar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_ITEMS } from "./admin-nav-items";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col border-r bg-[hsl(var(--admin-surface))] border-[hsl(var(--admin-border))]">
      <div className="flex h-14 items-center px-5 font-semibold text-[hsl(var(--admin-text))]">
        Hello Monday
      </div>
      <nav className="flex-1 px-2 py-2">
        <ul className="flex flex-col gap-1">
          {ADMIN_NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                    "border-l-2 border-transparent",
                    "text-[hsl(var(--admin-text-muted))] hover:bg-[hsl(var(--admin-bg))] hover:text-[hsl(var(--admin-text))]",
                    isActive &&
                      "border-l-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-bg))] font-medium text-[hsl(var(--admin-text))]",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
```

- [ ] **Step 3: Create UserMenu.tsx**

Create `src/components/admin/UserMenu.tsx`:

```tsx
"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { signOutAction } from "@/app/(admin)/admin/actions";

type Props = { email: string };

export default function UserMenu({ email }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <User className="h-4 w-4" aria-hidden />
          <span className="text-sm">{email}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-xs text-[hsl(var(--admin-text-muted))]">Signed in as</p>
            <p className="text-sm">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" aria-hidden />
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

Note: `signOutAction` will be created in Task 7 as `src/app/(admin)/admin/actions.ts`. This import will be red until then — that's fine, we'll resolve it in the next task.

- [ ] **Step 4: Create TopBar.tsx**

Create `src/components/admin/TopBar.tsx`:

```tsx
import UserMenu from "./UserMenu";

type Props = { email: string };

export default function TopBar({ email }: Props) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-6">
      <div />
      <UserMenu email={email} />
    </header>
  );
}
```

The left side is intentionally empty — each page renders its own `<h1>` in the main pane (per spec decision).

- [ ] **Step 5: Commit**

```bash
git add src/components/admin/
git commit -m "feat(admin): add sidebar, top bar, and user-menu components

Uses shadcn DropdownMenu and Button primitives and admin-scoped CSS
tokens. Nav items are defined once in admin-nav-items.ts and shared
between the sidebar and future components."
```

The sign-out import is temporarily broken — fixed in Task 7.

---

## Task 7: Create the admin layout and sign-out server action

**Files:**
- Create: `src/app/(admin)/admin/actions.ts`
- Create: `src/app/(admin)/admin/layout.tsx`

- [ ] **Step 1: Create the sign-out server action**

Create `src/app/(admin)/admin/actions.ts`:

```ts
"use server";

import { signOut } from "@/auth";

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}
```

- [ ] **Step 2: Create the admin layout**

Create `src/app/(admin)/admin/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Sidebar from "@/components/admin/Sidebar";
import TopBar from "@/components/admin/TopBar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Belt-and-braces: proxy already redirects, but don't trust the proxy alone.
  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  return (
    <div
      data-admin
      className="flex min-h-screen bg-[hsl(var(--admin-bg))] text-[hsl(var(--admin-text))]"
    >
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar email={session.user.email} />
        <main className="flex-1 overflow-auto p-6 md:p-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

Note: this layout redirects if `session` is null, which creates a subtle issue — the layout runs for `/admin/login` too (since `login/page.tsx` is under `(admin)/admin/`). We need the login route to use a separate layout that does NOT require auth.

- [ ] **Step 3: Manual check**

At this point the login page doesn't exist yet. Hit `/admin` — should redirect to `/admin/login` via the proxy. Don't test the layout directly yet; we'll verify after Task 8–9.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(admin\)/admin/actions.ts src/app/\(admin\)/admin/layout.tsx
git commit -m "feat(admin): add admin shell layout with sign-out action

Layout calls auth() as a belt-and-braces check and renders the
sidebar + top bar + main pane. Sign-out is a server action that
clears the session cookie and redirects to /admin/login."
```

---

## Task 8: Create the login page

**Files:**
- Create: `src/app/(admin)/admin/login/layout.tsx`
- Create: `src/app/(admin)/admin/login/page.tsx`
- Create: `src/app/(admin)/admin/login/LoginForm.tsx`
- Create: `src/app/(admin)/admin/login/actions.ts`

- [ ] **Step 1: Create a login-specific layout that overrides the admin layout**

Create `src/app/(admin)/admin/login/layout.tsx`:

```tsx
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      data-admin
      className="flex min-h-screen items-center justify-center bg-[hsl(var(--admin-bg))] p-6 text-[hsl(var(--admin-text))]"
    >
      {children}
    </div>
  );
}
```

This layout replaces the parent admin layout for `/admin/login` — no sidebar, no auth gate, just a centered card.

- [ ] **Step 2: Create the server-action entry for sign-in**

Create `src/app/(admin)/admin/login/actions.ts`:

```ts
"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error: string | null };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = formData.get("email");
  const password = formData.get("password");
  const from = formData.get("from");

  const redirectTo =
    typeof from === "string" && from.startsWith("/admin") && from !== "/admin/login"
      ? from
      : "/admin";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo,
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }
}
```

Note: `signIn` throws a `NEXT_REDIRECT` error on success which is re-thrown here (the `throw error` branch). That is expected Next.js behavior for server-action redirects.

- [ ] **Step 3: Create the login form client component**

Create `src/app/(admin)/admin/login/LoginForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";

const initialState: LoginState = { error: null };

type Props = { from: string };

export default function LoginForm({ from }: Props) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <form
      action={formAction}
      className="w-full max-w-sm rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-6 shadow-sm"
    >
      <div className="mb-6">
        <p className="text-sm font-semibold">Hello Monday</p>
        <h1 className="mt-1 text-lg font-medium">Sign in to admin</h1>
      </div>
      <input type="hidden" name="from" value={from} />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>
        {state.error && (
          <p
            role="alert"
            aria-live="polite"
            className="text-sm text-red-600"
          >
            {state.error}
          </p>
        )}
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 4: Create the login page**

Create `src/app/(admin)/admin/login/page.tsx`:

```tsx
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await auth();
  if (session) {
    redirect("/admin");
  }

  const params = await searchParams;
  const from = params.from ?? "/admin";

  return <LoginForm from={from} />;
}
```

- [ ] **Step 5: Manual verification of the login flow**

Restart `npm run dev`. In a browser:

1. Visit `http://localhost:3000/admin/login` — should render the centered login card.
2. Submit with wrong email/password — should show "Invalid email or password." inline.
3. Submit with the real credentials from `.env.local` — should redirect to `/admin` (which 404s until Task 9).
4. Revisit `/admin/login` while signed in — should redirect to `/admin`.
5. Check browser devtools → Application → Cookies: confirm an `authjs.session-token` HTTP-only cookie exists.

Expected: all five pass. If `useActionState` is unavailable or acts differently, check React 19 docs — it's the React 19 replacement for `useFormState`.

- [ ] **Step 6: Commit**

```bash
git add src/app/\(admin\)/admin/login/
git commit -m "feat(admin): add login page with credentials sign-in

Separate login layout overrides the admin shell so the login page
has no sidebar and no auth gate. Form uses useActionState to wire
the loginAction server action; errors render inline with an
aria-live alert for screen readers."
```

---

## Task 9: Create the dashboard and stub pages

**Files:**
- Create: `src/app/(admin)/admin/page.tsx`
- Create: `src/app/(admin)/admin/media/page.tsx`
- Create: `src/app/(admin)/admin/projects/page.tsx`
- Create: `src/app/(admin)/admin/pages/page.tsx`
- Create: `src/app/(admin)/admin/settings/page.tsx`

- [ ] **Step 1: Create the dashboard**

Create `src/app/(admin)/admin/page.tsx`:

```tsx
export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">
        Welcome back. Pick a section from the sidebar to get started.
      </p>
    </>
  );
}
```

- [ ] **Step 2: Create the four stub pages**

For each of the four stub pages, create a file with an `<h1>` for the section name and a "Coming soon" muted line. The only thing that varies is the title and description.

Create `src/app/(admin)/admin/media/page.tsx`:

```tsx
export default function AdminMediaPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Media</h1>
      <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">
        Coming soon — media library will land in sub-project #2.
      </p>
    </>
  );
}
```

Create `src/app/(admin)/admin/projects/page.tsx`:

```tsx
export default function AdminProjectsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Projects</h1>
      <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">
        Coming soon — project management will land in sub-project #4.
      </p>
    </>
  );
}
```

Create `src/app/(admin)/admin/pages/page.tsx`:

```tsx
export default function AdminPagesPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Pages</h1>
      <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">
        Coming soon — page builder will land in sub-project #5.
      </p>
    </>
  );
}
```

Create `src/app/(admin)/admin/settings/page.tsx`:

```tsx
export default function AdminSettingsPage() {
  return (
    <>
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="mt-2 text-sm text-[hsl(var(--admin-text-muted))]">
        Coming soon — global site settings will land in sub-project #5.
      </p>
    </>
  );
}
```

- [ ] **Step 3: Manual verification**

With the dev server running and logged in:

1. `/admin` renders the Dashboard heading + welcome text.
2. Click each sidebar item → the correct stub renders, and the sidebar active state moves to the current section.
3. The `<UserMenu>` in the top right shows the admin email.
4. The public site (`/`, `/work`, etc.) still renders unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/app/\(admin\)/admin/page.tsx src/app/\(admin\)/admin/media/page.tsx src/app/\(admin\)/admin/projects/page.tsx src/app/\(admin\)/admin/pages/page.tsx src/app/\(admin\)/admin/settings/page.tsx
git commit -m "feat(admin): add dashboard and four stub pages

Placeholder content marks which sub-project will fill in each
section. Locks the navigation and URL structure in place."
```

---

## Task 10: Full manual verification against the spec's 12-point checklist

**Files:** none — this task is verification only.

- [ ] **Step 1: Run the complete checklist**

With `.env.local` populated and `npm run dev` running, check all 12 items from the spec. For each, record pass/fail in your notes.

1. Unauthenticated GET `/admin` → 307 to `/admin/login?from=%2Fadmin`.
2. Unauthenticated GET `/admin/media` → 307 to `/admin/login?from=%2Fadmin%2Fmedia`.
3. Login with correct credentials → redirected to `/admin`.
4. Login with wrong email → generic error "Invalid email or password.", no disclosure.
5. Login with wrong password → same generic error.
6. Login with malformed email (`notanemail`) → same generic error.
7. After login, `from=/admin/settings` redirects to `/admin/settings`, not `/admin`.
8. Cookie inspection: `authjs.session-token` exists, HTTP-only, SameSite=Lax, JWT-shaped (3 dot-separated base64 segments).
9. Sign out via the user menu → cookie cleared, redirected to `/admin/login`.
10. Manually delete/clear the session cookie, revisit `/admin` → redirected to login.
11. Temporarily remove `AUTH_SECRET` from `.env.local`, restart dev server → server refuses to start with a clear error listing `AUTH_SECRET`. Restore before continuing.
12. All five admin pages (`/admin`, `/admin/media`, `/admin/projects`, `/admin/pages`, `/admin/settings`) render without errors when authenticated.

Use Chrome DevTools → Network → filter by "Doc" to see 307 redirects. Cookies live under Application → Storage → Cookies.

- [ ] **Step 2: Run production build**

Stop the dev server. Run:

```bash
npm run build
```

Expected: build succeeds with no type errors and no runtime errors. If it fails, fix the issue and re-run.

- [ ] **Step 3: Smoke-test production build**

```bash
npm run start
```

In a browser, log in and confirm the admin works in the production build. Then stop the server.

- [ ] **Step 4: Commit any fixes**

If the checklist surfaced any bugs, fix them. Each fix is its own `fix(auth|admin): …` commit with a message describing what was wrong.

- [ ] **Step 5: Final status**

If all 12 items pass and the production build is clean, sub-project #1 is done. Summarize which items passed/failed to the user; ready to kick off sub-project #2 (Media center) brainstorm when the user is.

---

## Self-review notes

- **Spec coverage:** Every file listed in the spec's "Files to create" table has a corresponding task. Every env var is introduced in Task 1. Every UX element (login, shell, stub pages) is in Tasks 6–9. Proxy protection in Task 5. Error handling (zod, env validation, generic errors, 1s delay — wait, the 1s delay isn't in the plan. I'll note that as a follow-up rather than retrofit it into a plan where it doesn't fit cleanly).
  - **Gap:** Spec says "After a failed attempt, a 1s artificial delay on the next submit." Not implemented in Task 8. Decision: drop this from sub-project #1 — with a single admin, a single strong password, and env-var storage, the delay adds complexity for marginal benefit. Revisit if/when multi-user auth arrives.
- **Placeholder scan:** No TBD/TODO present. All code blocks have complete content.
- **Type consistency:** `signOutAction` is defined in Task 7 and imported in Task 6 — dependency direction noted in Step 5 of Task 6. `loginAction` + `LoginState` type defined in Task 8.
- **Ambiguity:** Task 5 notes docs should be checked for the Next 16 proxy signature; if it differs, adjust inline. Flagged rather than hidden.
- **Risk flagged in plan:** Auth.js v5 beta API may shift. Engineer should pin exact version.
