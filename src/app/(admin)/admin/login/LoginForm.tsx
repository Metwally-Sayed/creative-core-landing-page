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
