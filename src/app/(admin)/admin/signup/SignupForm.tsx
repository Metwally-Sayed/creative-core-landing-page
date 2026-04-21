"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signupAction, type SignupState } from "./actions";
import Link from "next/link";

const initialState: SignupState = { error: null };

export default function SignupForm() {
  const [state, formAction, isPending] = useActionState(signupAction, initialState);

  return (
    <form
      action={formAction}
      autoComplete="off"
      className="w-full max-w-sm rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-6 shadow-sm"
    >
      <div className="mb-6">
        <h1 className="text-lg font-medium">Create admin account</h1>
        <p className="mt-1 text-sm text-[hsl(var(--admin-text-muted))]">
          One-time setup — only one admin is allowed.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            required
            autoFocus
          />
          {state.fieldErrors?.email && (
            <p className="text-xs text-red-600">{state.fieldErrors.email}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
          />
          {state.fieldErrors?.password && (
            <p className="text-xs text-red-600">{state.fieldErrors.password}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
          {state.fieldErrors?.confirmPassword && (
            <p className="text-xs text-red-600">
              {state.fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        {state.error && (
          <p role="alert" aria-live="polite" className="text-sm text-red-600">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Creating account…" : "Create account"}
        </Button>

        <p className="text-center text-sm text-[hsl(var(--admin-text-muted))]">
          Already have an account?{" "}
          <Link
            href="/admin/login"
            className="text-[hsl(var(--admin-accent))] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
