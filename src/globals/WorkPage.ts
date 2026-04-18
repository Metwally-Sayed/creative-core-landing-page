import type { GlobalConfig } from "payload";

const DEFAULT_CREATIVE_HERO_MEDIA = [
  "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?w=200&h=200&fit=crop",
] as const;

function seedCreativeHero(target: Record<string, unknown>) {
  if (!target.kicker) target.kicker = "";
  if (!target.headline) target.headline = "Ideas That\nOrbit Your";
  if (!target.highlight) target.highlight = "Core.";
  if (!target.body)
    target.body = "Brand strategy, identity, content, and 3D visuals that convert.";
  if (!target.subcopy) target.subcopy = "";
  if (!target.primaryCtaLabel) target.primaryCtaLabel = "Start Your Project";
  if (!target.primaryCtaHref) target.primaryCtaHref = "#quote";
  if (!target.secondaryCtaLabel) target.secondaryCtaLabel = "See Our Work";
  if (!target.secondaryCtaHref) target.secondaryCtaHref = "/work";
  if (!target.layoutVariant) target.layoutVariant = "split";
  if (!target.mediaSide) target.mediaSide = "right";
  if (!target.textAlign) target.textAlign = "left";
  if (!target.backgroundStyle) target.backgroundStyle = "soft";

  const existing = Array.isArray(target.mediaItems) ? (target.mediaItems as Array<Record<string, unknown>>) : [];
  if (existing.length === 0) {
    target.mediaItems = DEFAULT_CREATIVE_HERO_MEDIA.map((url, index) => ({
      externalUrl: url,
      alt: `Creative hero image ${index + 1}`,
      href: "",
    }));
  }
}

export const WorkPage: GlobalConfig = {
  slug: "workPage",
  admin: {
    group: "Pages",
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== "object") {
          return data;
        }

        const doc = data as Record<string, unknown>;
        const hero = (doc.hero ?? {}) as Record<string, unknown>;
        const isVisible = hero.isVisible !== false;
        const variant = String(hero.variant ?? "current");

        if (isVisible && variant === "creative") {
          const creative = (hero.creative ?? {}) as Record<string, unknown>;
          seedCreativeHero(creative);

          if (Array.isArray(creative.mediaItems)) {
            creative.mediaItems = (creative.mediaItems as Array<Record<string, unknown>>).filter((item) => {
              const alt = String(item.alt ?? "").trim();
              const hasUpload = Boolean(item.media);
              const hasUrl = Boolean(String(item.externalUrl ?? "").trim());
              return alt && (hasUpload || hasUrl);
            });
          }

          hero.creative = creative;
          doc.hero = hero;
        }

        return data;
      },
    ],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "SEO",
          fields: [
            {
              name: "metaTitle",
              type: "text",
              label: "Meta Title",
            },
            {
              name: "metaDescription",
              type: "textarea",
              label: "Meta Description",
            },
            {
              name: "ogImage",
              type: "upload",
              relationTo: "media",
              label: "Open Graph Image",
            },
            {
              name: "canonicalUrl",
              type: "text",
              label: "Canonical URL",
            },
          ],
        },
        {
          label: "Hero",
          fields: [
            {
              name: "hero",
              type: "group",
              label: "Hero Variant",
              admin: {
                initCollapsed: true,
                description:
                  "Select a hero variant. Current uses the legacy fields below. Creative uses the Creative Hero settings.",
              },
              fields: [
                { name: "isVisible", type: "checkbox", defaultValue: true, label: "Visible" },
                {
                  name: "variant",
                  type: "select",
                  defaultValue: "current",
                  options: [
                    { label: "Current (Existing Work Hero)", value: "current" },
                    { label: "Creative (Sphere Hero)", value: "creative" },
                  ],
                },
                {
                  name: "creative",
                  type: "group",
                  label: "Creative Hero Settings",
                  admin: {
                    initCollapsed: true,
                    condition: (_, siblingData) =>
                      (siblingData as { variant?: string } | undefined)?.variant === "creative",
                  },
                  fields: [
                    { name: "kicker", type: "text", label: "Kicker / Eyebrow" },
                    { name: "headline", type: "text", label: "Headline" },
                    { name: "highlight", type: "text", label: "Highlight Word (Optional)" },
                    { name: "body", type: "textarea", label: "Body" },
                    { name: "subcopy", type: "textarea", label: "Subcopy" },
                    { name: "primaryCtaLabel", type: "text", label: "Primary CTA Label" },
                    { name: "primaryCtaHref", type: "text", label: "Primary CTA Link" },
                    { name: "secondaryCtaLabel", type: "text", label: "Secondary CTA Label" },
                    { name: "secondaryCtaHref", type: "text", label: "Secondary CTA Link" },
                    {
                      name: "layoutVariant",
                      type: "select",
                      label: "Layout Variant",
                      defaultValue: "split",
                      options: [
                        { label: "Split", value: "split" },
                        { label: "Stacked", value: "stacked" },
                      ],
                    },
                    {
                      name: "mediaSide",
                      type: "select",
                      label: "Media Side",
                      defaultValue: "right",
                      options: [
                        { label: "Right", value: "right" },
                        { label: "Left", value: "left" },
                      ],
                    },
                    {
                      name: "textAlign",
                      type: "select",
                      label: "Text Alignment",
                      defaultValue: "left",
                      options: [
                        { label: "Left", value: "left" },
                        { label: "Center", value: "center" },
                      ],
                    },
                    {
                      name: "backgroundStyle",
                      type: "select",
                      label: "Background Style",
                      defaultValue: "soft",
                      options: [
                        { label: "Soft", value: "soft" },
                        { label: "None", value: "none" },
                      ],
                    },
                    {
                      name: "mediaItems",
                      type: "array",
                      label: "Media Sphere Items",
                      admin: { initCollapsed: true },
                      fields: [
                        { name: "media", type: "upload", relationTo: "media", required: false, label: "Image Upload" },
                        { name: "externalUrl", type: "text", label: "Image URL (Optional)" },
                        { name: "alt", type: "text", required: true, label: "Alt Text" },
                        { name: "href", type: "text", label: "Link (Optional)" },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: "heroTitle",
              type: "text",
              label: "Hero Title",
              admin: {
                description: "Legacy: used by the Current hero variant.",
              },
            },
            {
              name: "heroBody",
              type: "textarea",
              label: "Hero Body",
              admin: {
                description: "Legacy: used by the Current hero variant.",
              },
            },
          ],
        },
        {
          label: "Filters",
          fields: [
            {
              name: "filterLabels",
              type: "array",
              label: "Filter Labels",
              admin: {
                initCollapsed: true,
                description:
                  "Each filter needs a display label and a value. Value should match one of: Products, Experiences, Branding.",
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  label: "Display Label",
                },
                {
                  name: "value",
                  type: "text",
                  required: true,
                  label: "Filter Value",
                },
              ],
            },
          ],
        },
        {
          label: "Featured Projects",
          fields: [
            {
              name: "featuredProjects",
              type: "relationship",
              relationTo: "projects",
              hasMany: true,
              label: "Featured Projects",
              admin: {
                description: "Optional projects to pin near the top of the work page.",
              },
            },
          ],
        },
      ],
    },
  ],
};

export default WorkPage;
