import type { Block, GlobalConfig } from "payload";

const heroBlock: Block = {
  slug: "hero",
  fields: [
    { name: "blockName", type: "text" },
    { name: "anchorId", type: "text" },
    { name: "isVisible", type: "checkbox", defaultValue: true },
    { name: "eyebrow", type: "text" },
    {
      name: "headlineRotator",
      type: "array",
      fields: [{ name: "value", type: "text" }],
      minRows: 1,
    },
    { name: "desktopVideo", type: "upload", relationTo: "media", required: true },
    { name: "mobileVideo", type: "upload", relationTo: "media" },
    { name: "posterImage", type: "upload", relationTo: "media" },
    { name: "scrollCueLabel", type: "text" },
    {
      name: "minHeightVariant",
      type: "select",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Tall", value: "tall" },
      ],
    },
    {
      name: "overlayStyle",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" },
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

          if (blockType === "hero" && !block.desktopVideo) {
            throw new Error("Homepage hero block requires a desktop video.");
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
