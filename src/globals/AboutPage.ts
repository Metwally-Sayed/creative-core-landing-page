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

export const AboutPage: GlobalConfig = {
  slug: "aboutPage",
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
          label: "Hero & Jump Links",
          fields: [
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
            {
              name: "hero",
              type: "group",
              label: "Hero Variant",
              admin: {
                initCollapsed: true,
                description:
                  "Select a hero variant. Current uses the legacy hero fields above. Creative uses the Creative Hero settings.",
              },
              fields: [
                { name: "isVisible", type: "checkbox", defaultValue: true, label: "Visible" },
                {
                  name: "variant",
                  type: "select",
                  defaultValue: "current",
                  options: [
                    { label: "Current (Existing About Hero)", value: "current" },
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
              name: "jumpLinks",
              type: "array",
              label: "Jump Links",
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  label: "Link Label",
                },
                {
                  name: "href",
                  type: "text",
                  required: true,
                  label: "Target Anchor / URL",
                },
              ],
            },
          ],
        },
        {
          label: "Locations",
          fields: [
            {
              name: "locations",
              type: "array",
              label: "Locations",
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "city",
                  type: "text",
                  required: true,
                  label: "City",
                },
                {
                  name: "country",
                  type: "text",
                  required: true,
                  label: "Country",
                },
                {
                  name: "timezone",
                  type: "text",
                  required: true,
                  label: "Timezone",
                },
                {
                  name: "mapUrl",
                  type: "text",
                  required: true,
                  label: "Map URL",
                },
                {
                  name: "address",
                  type: "textarea",
                  required: true,
                  label: "Address",
                },
              ],
            },
          ],
        },
        {
          label: "Code of Honor",
          fields: [
            {
              name: "codeOfHonor",
              type: "group",
              label: "Code of Honor Section",
              fields: [
                {
                  name: "eyebrow",
                  type: "text",
                  label: "Eyebrow",
                },
                {
                  name: "title",
                  type: "text",
                  label: "Title",
                },
                {
                  name: "body",
                  type: "textarea",
                  label: "Body",
                },
                {
                  name: "items",
                  type: "array",
                  label: "Code of Honor Items",
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: "itemId",
                      type: "text",
                      required: true,
                      label: "Internal Item ID",
                      admin: {
                        description:
                          "Internal unique key for this value card. Keep stable after publishing.",
                      },
                    },
                    {
                      name: "index",
                      type: "text",
                      required: true,
                      label: "Index Label",
                    },
                    {
                      name: "title",
                      type: "text",
                      required: true,
                      label: "Title",
                    },
                    {
                      name: "body",
                      type: "textarea",
                      required: true,
                      label: "Body",
                    },
                    {
                      name: "art",
                      type: "select",
                      label: "Artwork Style",
                      admin: {
                        description: "Selects the visual style paired with this item.",
                      },
                      options: [
                        { label: "Be Nice", value: "be-nice" },
                        { label: "Powers for Good", value: "powers-for-good" },
                        { label: "Try the Truth", value: "try-the-truth" },
                        { label: "Enjoy the Ride", value: "enjoy-the-ride" },
                        { label: "Speak Up and Listen", value: "speak-up-and-listen" },
                        { label: "Solve the Problem", value: "solve-the-problem" },
                        { label: "Help Each Other", value: "help-each-other" },
                        { label: "Team Up", value: "team-up" },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Mondayteers",
          fields: [
            {
              name: "mondayteers",
              type: "group",
              label: "Mondayteers Section",
              fields: [
                {
                  name: "eyebrow",
                  type: "text",
                  label: "Eyebrow",
                },
                {
                  name: "title",
                  type: "text",
                  label: "Title",
                },
                {
                  name: "body",
                  type: "textarea",
                  label: "Body",
                },
                {
                  name: "team",
                  type: "array",
                  label: "Team Members",
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: "name",
                      type: "text",
                      required: true,
                      label: "Name",
                    },
                    {
                      name: "city",
                      type: "text",
                      required: true,
                      label: "City",
                    },
                    {
                      name: "role",
                      type: "text",
                      required: true,
                      label: "Role",
                    },
                    {
                      name: "art",
                      type: "select",
                      label: "Artwork Style",
                      admin: {
                        description: "Selects the abstract visual treatment on the team card.",
                      },
                      options: [
                        { label: "Art 1", value: "art1" },
                        { label: "Art 2", value: "art2" },
                        { label: "Art 3", value: "art3" },
                        { label: "Art 4", value: "art4" },
                        { label: "Art 5", value: "art5" },
                        { label: "Art 6", value: "art6" },
                        { label: "Art 7", value: "art7" },
                        { label: "Art 8", value: "art8" },
                        { label: "Art 9", value: "art9" },
                        { label: "Art 10", value: "art10" },
                        { label: "Art 11", value: "art11" },
                        { label: "Art 12", value: "art12" },
                        { label: "Art 13", value: "art13" },
                        { label: "Art 14", value: "art14" },
                        { label: "Art 15", value: "art15" },
                        { label: "Art 16", value: "art16" },
                        { label: "Art 17", value: "art17" },
                        { label: "Art 18", value: "art18" },
                        { label: "Art 19", value: "art19" },
                        { label: "Art 20", value: "art20" },
                        { label: "Art 21", value: "art21" },
                        { label: "Art 22", value: "art22" },
                        { label: "Art 23", value: "art23" },
                        { label: "Art 24", value: "art24" },
                        { label: "Art 25", value: "art25" },
                        { label: "Art 26", value: "art26" },
                        { label: "Art 27", value: "art27" },
                        { label: "Art 28", value: "art28" },
                        { label: "Art 29", value: "art29" },
                        { label: "Art 30", value: "art30" },
                      ],
                    },
                    {
                      name: "accentLabel",
                      type: "text",
                      required: true,
                      label: "Accent Label",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default AboutPage;
