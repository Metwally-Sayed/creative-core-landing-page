// src/app/(admin)/admin/projects/new/page.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createProject } from "../actions";

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export default function NewProjectPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) setSlug(toSlug(value));
  }

  function handleSlugChange(value: string) {
    setSlug(toSlug(value));
    setSlugEdited(true);
  }

  function handleCreate() {
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!slug.trim()) {
      setError("Slug is required.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const project = await createProject({
          title: title.trim(),
          slug: slug.trim(),
        });
        router.push(`/admin/projects/${project.id}`);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to create.";
        setError(msg.includes("duplicate") ? "That slug is already taken." : msg);
      }
    });
  }

  return (
    <div className="p-8 max-w-lg">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/projects"
          className="text-sm text-[hsl(var(--admin-text-muted))] hover:text-[hsl(var(--admin-text))]"
        >
          ← Projects
        </Link>
        <h1 className="text-2xl font-semibold text-[hsl(var(--admin-text))]">
          New Project
        </h1>
      </div>

      <div className="space-y-5 rounded-lg border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] p-6">
        <div className="space-y-1">
          <Label htmlFor="new-title">Title *</Label>
          <Input
            id="new-title"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Google - Gemini Developer Competition"
            disabled={isPending}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="new-slug">Slug *</Label>
          <Input
            id="new-slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="google-gemini-developer-competition"
            disabled={isPending}
          />
          <p className="text-xs text-[hsl(var(--admin-text-muted))]">
            URL: /projects/{slug || "…"}
          </p>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <Button onClick={handleCreate} disabled={isPending || !title.trim()}>
            {isPending ? "Creating…" : "Create & edit"}
          </Button>
          <Link
            href="/admin/projects"
            className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap transition-all hover:bg-muted hover:text-foreground"
          >
            Cancel
          </Link>
        </div>
      </div>
    </div>
  );
}
