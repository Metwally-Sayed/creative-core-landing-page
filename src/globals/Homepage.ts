import type { Block, GlobalConfig } from "payload";

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
      type: "image",
      externalUrl: url,
      alt: `Creative hero image ${index + 1}`,
      href: "",
    }));
  }
}

const heroBlock: Block = {
  slug: "hero",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    {
      name: "variant",
      type: "select",
      defaultValue: "current",
      options: [
        { label: "Current (Video Hero)", value: "current" },
        { label: "Creative (Sphere Hero)", value: "creative" },
      ],
      admin: {
        description:
          "Select which hero layout to render. Current uses the video fields below. Creative uses the Creative Hero settings.",
      },
    },
    { name: "eyebrow", type: "text" },
    {
      name: "headlineRotator",
      type: "array",
      fields: [{ name: "value", type: "text" }],
      admin: {
        condition: (_, siblingData) => (siblingData as { variant?: string } | undefined)?.variant !== "creative",
      },
      minRows: 1,
    },
    {
      name: "desktopVideo",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) => (siblingData as { variant?: string } | undefined)?.variant !== "creative",
      },
    },
    {
      name: "mobileVideo",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) => (siblingData as { variant?: string } | undefined)?.variant !== "creative",
      },
    },
    {
      name: "posterImage",
      type: "upload",
      relationTo: "media",
      admin: {
        condition: (_, siblingData) => (siblingData as { variant?: string } | undefined)?.variant !== "creative",
      },
    },
    {
      name: "scrollCueLabel",
      type: "text",
      admin: {
        condition: (_, siblingData) => (siblingData as { variant?: string } | undefined)?.variant !== "creative",
      },
    },
    {
      name: "minHeightVariant",
      type: "select",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Tall", value: "tall" },
      ],
      admin: {
        condition: (_, siblingData) => (siblingData as { variant?: string } | undefined)?.variant !== "creative",
      },
    },
    {
      name: "overlayStyle",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
      ],
      admin: {
        condition: (_, siblingData) => (siblingData as { variant?: string } | undefined)?.variant !== "creative",
      },
    },
    {
      name: "creative",
      type: "group",
      label: "Creative Hero",
      admin: {
        condition: (_, siblingData) => (siblingData as { variant?: string } | undefined)?.variant === "creative",
        description: "CMS-driven content for the Creative hero variant.",
      },
      fields: [
        { name: "kicker", type: "text", label: "Kicker / Eyebrow" },
        { name: "headline", type: "text", label: "Headline", required: false },
        { name: "highlight", type: "text", label: "Highlight Word (Optional)" },
        { name: "body", type: "textarea", label: "Body" },
        { name: "subcopy", type: "textarea", label: "Subcopy" },
        {
          name: "primaryCtaLabel",
          type: "text",
          label: "Primary CTA Label",
        },
        {
          name: "primaryCtaHref",
          type: "text",
          label: "Primary CTA Link",
        },
        {
          name: "secondaryCtaLabel",
          type: "text",
          label: "Secondary CTA Label",
        },
        {
          name: "secondaryCtaHref",
          type: "text",
          label: "Secondary CTA Link",
        },
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
          admin: {
            description: "Images shown in the hero media sphere. Add at least 1 for best results.",
          },
          fields: [
            {
              name: "type",
              type: "select",
              defaultValue: "image",
              options: [
                { label: "Image", value: "image" },
                { label: "Video", value: "video" },
              ],
              admin: {
                description: "Images show as-is. Videos show a poster/thumbnail in the sphere and play in a modal.",
              },
            },
            {
              name: "media",
              type: "upload",
              relationTo: "media",
              required: false,
              label: "Image Upload",
              admin: {
                condition: (_, siblingData) => (siblingData as { type?: string } | undefined)?.type !== "video",
              },
            },
            {
              name: "externalUrl",
              type: "text",
              label: "Image URL (Optional)",
              admin: {
                condition: (_, siblingData) => (siblingData as { type?: string } | undefined)?.type !== "video",
              },
            },
            {
              name: "videoMedia",
              type: "upload",
              relationTo: "media",
              required: false,
              label: "Video Upload",
              admin: {
                condition: (_, siblingData) => (siblingData as { type?: string } | undefined)?.type === "video",
              },
            },
            {
              name: "videoUrl",
              type: "text",
              label: "Video URL (Optional)",
              admin: {
                condition: (_, siblingData) => (siblingData as { type?: string } | undefined)?.type === "video",
              },
            },
            {
              name: "posterMedia",
              type: "upload",
              relationTo: "media",
              required: false,
              label: "Video Poster Upload (Optional)",
              admin: {
                condition: (_, siblingData) => (siblingData as { type?: string } | undefined)?.type === "video",
                description:
                  "Used for the sphere preview. If omitted, the sphere shows a generic video tile.",
              },
            },
            {
              name: "posterUrl",
              type: "text",
              label: "Video Poster URL (Optional)",
              admin: {
                condition: (_, siblingData) => (siblingData as { type?: string } | undefined)?.type === "video",
              },
            },
            { name: "alt", type: "text", required: true, label: "Accessible Label / Alt Text" },
            { name: "href", type: "text", label: "Link (Optional)" },
          ],
        },
      ],
    },
  ],
};

const curatedProjectsBlock: Block = {
  slug: "curatedProjects",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "body", type: "textarea" },
    {
      name: "filterMode",
      type: "select",
      options: [
        { label: "Manual", value: "manual" },
        { label: "Tag-based", value: "tagBased" },
      ],
    },
    {
      name: "filterLabels",
      type: "array",
      fields: [{ name: "label", type: "text" }],
    },
    {
      name: "projects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
    },
    { name: "maxItems", type: "number" },
    { name: "emptyStateText", type: "text" },
  ],
};

const featureMediaBlock: Block = {
  slug: "featureMedia",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "body", type: "textarea" },
    {
      name: "backgroundMediaType",
      type: "select",
      options: [
        { label: "Image", value: "image" },
        { label: "Video", value: "video" },
      ],
    },
    { name: "backgroundImage", type: "upload", relationTo: "media" },
    { name: "backgroundVideo", type: "upload", relationTo: "media" },
    {
      name: "overlayStyle",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
      ],
    },
    {
      name: "stats",
      type: "array",
      fields: [
        { name: "label", type: "text" },
        { name: "value", type: "text" },
        { name: "supportingText", type: "text" },
      ],
    },
    { name: "primaryCtaLabel", type: "text" },
    { name: "primaryCtaHref", type: "text" },
    { name: "secondaryCtaLabel", type: "text" },
    { name: "secondaryCtaHref", type: "text" },
  ],
};

const faqSpotlightBlock: Block = {
  slug: "faqSpotlight",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "subheading", type: "text" },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "id", type: "text" },
        { name: "question", type: "text" },
        { name: "answer", type: "textarea" },
        { name: "preview", type: "text" },
        {
          name: "deliverables",
          type: "array",
          fields: [{ name: "label", type: "text" }],
        },
      ],
    },
    {
      name: "quoteLauncherVariant",
      type: "select",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Inverted", value: "inverted" },
      ],
    },
    { name: "quoteLauncherLabel", type: "text" },
  ],
};

const quoteLauncherBlock: Block = {
  slug: "quoteLauncher",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "body", type: "textarea" },
    { name: "triggerLabel", type: "text" },
    {
      name: "themeVariant",
      type: "select",
      options: [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
      ],
    },
  ],
};

const statsGridBlock: Block = {
  slug: "statsGrid",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "body", type: "textarea" },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "label", type: "text" },
        { name: "value", type: "text" },
        { name: "supportingText", type: "text" },
      ],
    },
    {
      name: "columns",
      type: "select",
      options: [
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" },
      ],
    },
  ],
};

const richTextContentBlock: Block = {
  slug: "richTextContent",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "richText", type: "richText" },
    { name: "primaryCtaLabel", type: "text" },
    { name: "primaryCtaHref", type: "text" },
    { name: "secondaryCtaLabel", type: "text" },
    { name: "secondaryCtaHref", type: "text" },
    {
      name: "layoutVariant",
      type: "select",
      options: [
        { label: "Centered", value: "centered" },
        { label: "Left", value: "left" },
        { label: "Split", value: "split" },
      ],
    },
  ],
};

const mediaGalleryBlock: Block = {
  slug: "mediaGallery",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "body", type: "textarea" },
    {
      name: "items",
      type: "array",
      fields: [
        { name: "media", type: "upload", relationTo: "media" },
        { name: "alt", type: "text" },
        { name: "caption", type: "text" },
        { name: "href", type: "text" },
      ],
    },
    {
      name: "layoutVariant",
      type: "select",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
        { label: "Masonry", value: "masonry" },
      ],
    },
  ],
};

const logoStripBlock: Block = {
  slug: "logoStrip",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "body", type: "textarea" },
    {
      name: "logos",
      type: "array",
      fields: [
        { name: "logo", type: "upload", relationTo: "media" },
        { name: "name", type: "text" },
        { name: "href", type: "text" },
      ],
    },
  ],
};

const ctaBannerBlock: Block = {
  slug: "ctaBanner",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    { name: "heading", type: "text" },
    { name: "body", type: "textarea" },
    { name: "primaryCtaLabel", type: "text" },
    { name: "primaryCtaHref", type: "text" },
    { name: "secondaryCtaLabel", type: "text" },
    { name: "secondaryCtaHref", type: "text" },
    {
      name: "themeVariant",
      type: "select",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Inverted", value: "inverted" },
      ],
    },
  ],
};

export const Homepage: GlobalConfig = {
  slug: "homepage",
  admin: {
    livePreview: {
      url: () => {
        const secret = process.env.PREVIEW_SECRET || "hello-monday-payload-dev-secret";
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        return `${serverUrl}/api/preview?secret=${secret}&slug=/`;
      },
    },
  },
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data || typeof data !== "object" || !Array.isArray(data.blocks)) {
          return data;
        }

        const nextData = data as {
          blocks: Array<Record<string, unknown>>;
        };

        for (const block of nextData.blocks) {
          if (!block || typeof block !== "object") {
            continue;
          }

          const blockType = String(block.blockType ?? "");

        if (blockType === "hero") {
          const variant = String(block.variant ?? "current");

          if (variant !== "creative" && !block.desktopVideo) {
            throw new Error("Homepage hero block requires a desktop video.");
          }

          if (variant === "creative") {
            const creative = (block.creative ?? {}) as Record<string, unknown>;
            seedCreativeHero(creative);

            // Ensure media items have either an upload or external URL.
            if (Array.isArray(creative.mediaItems)) {
              creative.mediaItems = (creative.mediaItems as Array<Record<string, unknown>>).filter((item) => {
                const alt = String(item.alt ?? "").trim();
                const hasUpload = Boolean(item.media);
                const hasUrl = Boolean(String(item.externalUrl ?? "").trim());
                return alt && (hasUpload || hasUrl);
              });
            }

            block.creative = creative;
          }
          }

          if (blockType === "faqSpotlight" && Array.isArray(block.items)) {
            const seen = new Set<string>();
            for (const item of block.items as Array<Record<string, unknown>>) {
              const itemId = String(item?.id ?? "").trim();
              if (!itemId) {
                continue;
              }

              if (seen.has(itemId)) {
                throw new Error(`FAQ item id "${itemId}" must be unique within faqSpotlight block.`);
              }

              seen.add(itemId);
            }
          }
        }

        return data;
      },
    ],
  },
  fields: [
    {
      name: "internalName",
      type: "text",
    },
    {
      name: "metaTitle",
      type: "text",
    },
    {
      name: "metaDescription",
      type: "text",
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media",
    },
    {
      name: "canonicalUrl",
      type: "text",
    },
    {
      name: "statusNote",
      type: "text",
      admin: {
        description: "Internal notes for editors - not visible on site",
      },
    },
    {
      name: "blocks",
      type: "blocks",
      blocks: [
        heroBlock,
        curatedProjectsBlock,
        featureMediaBlock,
        faqSpotlightBlock,
        quoteLauncherBlock,
        statsGridBlock,
        richTextContentBlock,
        mediaGalleryBlock,
        logoStripBlock,
        ctaBannerBlock,
      ],
    },
  ],
};

export default Homepage;
