"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, type LoginState } from "./actions";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, ArrowUpRight } from "lucide-react";

const initialState: LoginState = { error: null };

type Props = { from: string; logoUrl?: string; siteName?: string };

function SparkleIcon({ color = "hsl(var(--admin-orange))" }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1.5v4M8 10.5v4M1.5 8h4M10.5 8h4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BrandMark({ logoUrl, siteName }: { logoUrl?: string; siteName: string }) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={siteName}
        width={180}
        height={54}
        className="h-10 w-auto object-contain object-left brightness-0 invert"
        priority
      />
    );
  }
  return (
    <div className="flex items-center gap-3">
      <div
        className="flex shrink-0 items-center justify-center rounded-[10px]"
        style={{
          width: 36,
          height: 36,
          background: "rgba(255,255,255,0.12)",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        <SparkleIcon />
      </div>
      <span
        className="text-[18px] font-semibold tracking-tight text-white"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {siteName}
      </span>
    </div>
  );
}

export default function LoginForm({ from, logoUrl, siteName = "Creative Core" }: Props) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="flex h-full min-h-screen w-full">
      {/* ── Left: editorial navy panel ── */}
      <div
        className="hidden lg:flex flex-1 flex-col p-14 text-white relative overflow-hidden"
        style={{
          background:
            "linear-gradient(140deg, hsl(var(--admin-navy-ink)) 0%, hsl(var(--admin-navy)) 100%)",
        }}
      >
        {/* ambient glow */}
        <div
          className="pointer-events-none absolute"
          style={{
            inset: 0,
            background:
              "radial-gradient(50% 50% at 20% 30%, hsl(var(--admin-orange) / 0.18) 0%, transparent 70%)",
          }}
          aria-hidden
        />

        {/* Brand — real logo or sparkle fallback */}
        <div className="relative">
          <BrandMark logoUrl={logoUrl} siteName={siteName} />
        </div>

        {/* Hero copy */}
        <div className="relative mt-auto mb-auto flex flex-col">
          <p
            className="mb-4 text-[11px] font-semibold uppercase "
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            Studio Admin
          </p>
          <h1
            className="leading-[0.95] font-semibold -0.035em] max-w-[520px]"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(52px, 6vw, 80px)",
            }}
          >
            Welcome back.
            <br />
            <span
              className="font-medium italic"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              The studio&apos;s quiet at this hour.
            </span>
          </h1>

          {/* Stats row */}
          <div
            className="mt-14 flex gap-12 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
          >
            {[
              ["24", "Active projects"],
              ["312", "Media assets"],
              ["3", "Studios"],
            ].map(([value, label]) => (
              <div key={label}>
                <div
                  className="text-[42px] font-semibold leading-none "
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "hsl(var(--admin-orange))",
                  }}
                >
                  {value}
                </div>
                <div
                  className="mt-2.5 text-[10px] font-semibold uppercase "
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative flex justify-between text-[12px]"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          <span>© 2026 {siteName}</span>
          <span>Cairo · Riyadh · London</span>
        </div>
      </div>

      {/* ── Right: login form ── */}
      <div
        className="flex w-full flex-col justify-center px-10 py-12 lg:w-[480px] lg:shrink-0"
        style={{ background: "hsl(var(--admin-bg))" }}
      >
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile brand */}
          <div className="mb-8 lg:hidden">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={siteName}
                width={160}
                height={48}
                className="h-9 w-auto object-contain object-left"
                priority
              />
            ) : (
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-[8px]"
                  style={{ background: "hsl(var(--admin-navy-ink))" }}
                >
                  <SparkleIcon />
                </div>
                <span
                  className="text-[16px] font-semibold tracking-tight"
                  style={{
                    fontFamily: "var(--font-serif)",
                    color: "hsl(var(--admin-navy-ink))",
                  }}
                >
                  {siteName}
                </span>
              </div>
            )}
          </div>

          <p
            className="mb-2 text-[11px] font-semibold uppercase "
            style={{ color: "hsl(var(--admin-text-muted))" }}
          >
            Sign in
          </p>
          <h2
            className="mb-2 text-[40px] font-semibold leading-tight -0.03em]"
            style={{
              fontFamily: "var(--font-serif)",
              color: "hsl(var(--admin-navy-ink))",
            }}
          >
            Open the studio.
          </h2>
          <p
            className="mb-8 text-[13px] leading-relaxed"
            style={{ color: "hsl(var(--admin-text-muted))" }}
          >
            Use the email associated with your studio seat.
          </p>

          <form action={formAction} autoComplete="off" className="flex flex-col gap-5">
            <input type="hidden" name="from" value={from} />

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="email"
                className="text-[11px] font-semibold uppercase 0.18em]"
                style={{ color: "hsl(var(--admin-text-muted))" }}
              >
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "hsl(var(--admin-text-muted))" }}
                  aria-hidden
                />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="off"
                  required
                  autoFocus
                  className="pl-10"
                  style={{
                    border: "1px solid hsl(var(--admin-border-strong))",
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: 12,
                    color: "hsl(var(--admin-navy-ink))",
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="password"
                className="text-[11px] font-semibold uppercase 0.18em]"
                style={{ color: "hsl(var(--admin-text-muted))" }}
              >
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2"
                  style={{ color: "hsl(var(--admin-text-muted))" }}
                  aria-hidden
                />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="pl-10"
                  style={{
                    border: "1px solid hsl(var(--admin-border-strong))",
                    background: "rgba(255,255,255,0.7)",
                    borderRadius: 12,
                    color: "hsl(var(--admin-navy-ink))",
                  }}
                />
              </div>
            </div>

            {state.error && (
              <p
                role="alert"
                aria-live="polite"
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "hsl(0 84% 60% / 0.08)",
                  color: "hsl(0 84% 45%)",
                  border: "1px solid hsl(0 84% 60% / 0.2)",
                }}
              >
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 text-[14px] font-semibold text-white transition-opacity disabled:opacity-70"
              style={{
                background: "hsl(var(--admin-orange))",
                boxShadow: "0 8px 22px hsl(var(--admin-orange) / 0.30)",
              }}
            >
              {isPending ? "Signing in…" : "Sign in to " + siteName}
              {!isPending && <ArrowUpRight className="h-4 w-4" aria-hidden />}
            </button>
          </form>

          <p
            className="mt-8 text-center text-[12px]"
            style={{ color: "hsl(var(--admin-text-muted))" }}
          >
            No account yet?{" "}
            <Link
              href="/admin/signup"
              className="font-semibold hover:underline"
              style={{ color: "hsl(var(--admin-navy-ink))" }}
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
