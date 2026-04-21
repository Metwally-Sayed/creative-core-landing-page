"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createPageAndRedirect } from "../actions";

export default function NewPagePage() {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError("Slug may only contain lowercase letters, numbers, and hyphens.");
      return;
    }
    setError("");
    startTransition(() => {
      createPageAndRedirect({ title: title.trim(), slug: slug.trim() });
    });
  };

  const autoSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return (
    <>
      <h1 className="mb-8 text-2xl font-semibold">New Page</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-5">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(autoSlug(e.target.value));
            }}
            placeholder="About Us"
            className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium uppercase tracking-wide text-[hsl(var(--admin-text-muted))]">
            Slug
          </label>
          <div className="flex items-center gap-1">
            <span className="text-sm text-[hsl(var(--admin-text-muted))]">/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(autoSlug(e.target.value))}
              placeholder="about-us"
              className="flex-1 rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
            />
          </div>
        </div>
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-[hsl(var(--admin-accent))] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {isPending ? "Creating…" : "Create Page"}
          </button>
          <Link
            href="/admin/pages"
            className="rounded-md border border-[hsl(var(--admin-border))] px-5 py-2 text-sm font-medium text-[hsl(var(--admin-text))] hover:bg-[hsl(var(--admin-hover))] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
