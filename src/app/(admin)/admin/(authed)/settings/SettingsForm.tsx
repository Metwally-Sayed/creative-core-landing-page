"use client";

import { useState, useTransition } from "react";
import { updateSettings } from "./actions";
import type { SiteSettings } from "@/lib/page-data";
import LogoPicker from "@/components/admin/LogoPicker";

interface Props {
  initialSettings: SiteSettings;
}

export default function SettingsForm({ initialSettings }: Props) {
  const [form, setForm] = useState<Omit<SiteSettings, "id">>({
    logo_url: initialSettings.logo_url,
    logo_dark_url: initialSettings.logo_dark_url,
    logo_icon_url: initialSettings.logo_icon_url,
    site_name: initialSettings.site_name,
    tagline: initialSettings.tagline,
    contact_email: initialSettings.contact_email,
    business_email: initialSettings.business_email,
    social_twitter: initialSettings.social_twitter,
    social_instagram: initialSettings.social_instagram,
    social_linkedin: initialSettings.social_linkedin,
    social_vimeo: initialSettings.social_vimeo,
    social_tiktok: initialSettings.social_tiktok,
    seo_title: initialSettings.seo_title,
    seo_description: initialSettings.seo_description,
    seo_og_image_url: initialSettings.seo_og_image_url,
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const field = (
    key: keyof typeof form,
    label: string,
    type: "text" | "textarea" = "text"
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-[hsl(var(--admin-text-muted))] uppercase tracking-wide">
        {label}
      </label>
      {type === "textarea" ? (
        <textarea
          rows={3}
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))] resize-none"
        />
      ) : (
        <input
          type="text"
          value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="rounded-md border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-surface))] px-3 py-2 text-sm text-[hsl(var(--admin-text))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--admin-accent))]"
        />
      )}
    </div>
  );

  const handleSave = () => {
    startTransition(async () => {
      await updateSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  return (
    <div className="max-w-2xl space-y-8">
      <section className="space-y-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
          Site Identity
        </h2>

        <div className="grid gap-6 sm:grid-cols-3">
          <LogoPicker
            label="Primary Logo"
            description="On light backgrounds (header)"
            value={form.logo_url}
            onChange={(url) => setForm((p) => ({ ...p, logo_url: url }))}
          />
          <LogoPicker
            label="Logo on Dark"
            description="On dark backgrounds (footer, menu)"
            value={form.logo_dark_url}
            onChange={(url) => setForm((p) => ({ ...p, logo_dark_url: url }))}
            darkPreview
          />
          <LogoPicker
            label="Logo Icon / Mark"
            description="Compact icon or brandmark"
            value={form.logo_icon_url}
            onChange={(url) => setForm((p) => ({ ...p, logo_icon_url: url }))}
          />
        </div>

        {field("site_name", "Site Name")}
        {field("tagline", "Tagline")}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
          Contact
        </h2>
        {field("contact_email", "General Email")}
        {field("business_email", "New Business Email")}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
          Social
        </h2>
        {field("social_linkedin", "LinkedIn URL")}
        {field("social_instagram", "Instagram URL")}
        {field("social_twitter", "Twitter / X URL")}
        {field("social_vimeo", "Vimeo URL")}
        {field("social_tiktok", "TikTok URL")}
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--admin-text-muted))]">
          SEO Defaults
        </h2>
        {field("seo_title", "Default Meta Title")}
        {field("seo_description", "Default Meta Description", "textarea")}
        {field("seo_og_image_url", "Default OG Image URL")}
      </section>

      <button
        onClick={handleSave}
        disabled={isPending}
        className="rounded-md bg-[hsl(var(--admin-accent))] px-5 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
      >
        {isPending ? "Saving\u2026" : saved ? "Saved \u2713" : "Save Settings"}
      </button>
    </div>
  );
}
