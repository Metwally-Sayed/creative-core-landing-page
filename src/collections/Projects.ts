import type { CollectionConfig } from "payload";

export const Projects: CollectionConfig = {
  slug: "projects",
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data || typeof data !== "object") {
          return data;
        }

        if (Object.prototype.hasOwnProperty.call(data, "inheritThemeFromPalette")) {
          return {
            ...data,
            themePreferenceConfigured: true,
          };
        }

        return data;
      },
    ],
  },
  admin: {
    defaultColumns: ["title", "slug", "updatedAt"],
    useAsTitle: "title",
  },
  versions: {
    drafts: {
      autosave: {
        interval: 300,
        showSaveDraftButton: true,
      },
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Project Title",
      admin: {
        description: "Main project name used in the admin, cards, and page content.",
      },
    },
    {
      name: "slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
      label: "URL Slug",
      admin: {
        description:
          "Public URL for the project page. Example: fingerspelling-with-machine-learning",
      },
    },
    {
      name: "legacyId",
      type: "text",
      unique: true,
      label: "Legacy Project ID",
      admin: {
        description:
          "Old numeric project ID used to redirect routes like /projects/1 to the new slug URL.",
        position: "sidebar",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Card & Listing",
          description:
            "Controls how the project appears on the homepage, /work page, and related project cards.",
          fields: [
            {
              name: "tags",
              type: "array",
              label: "Project Tags",
              admin: {
                description:
                  "Short labels shown under cards and used for project context.",
                initCollapsed: true,
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  label: "Tag",
                },
              ],
            },
            {
              name: "workFilters",
              type: "select",
              label: "Work Page Filters",
              hasMany: true,
              options: [
                { label: "Products", value: "Products" },
                { label: "Experiences", value: "Experiences" },
                { label: "Branding", value: "Branding" },
              ],
              admin: {
                description:
                  "Choose which filter tabs this project should appear under on /work and the homepage.",
              },
            },
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
              label: "Primary Card Image",
              admin: {
                description:
                  "Main thumbnail image used across listing cards and summaries.",
              },
            },
            {
              name: "aspectRatio",
              type: "select",
              label: "Card Aspect Ratio",
              required: true,
              defaultValue: "landscape",
              options: [
                { label: "Portrait", value: "portrait" },
                { label: "Landscape", value: "landscape" },
                { label: "Square", value: "square" },
              ],
              admin: {
                description:
                  "Default card shape used in normal project grids and homepage cards.",
              },
            },
            {
              name: "featuredAspectRatio",
              type: "select",
              label: "Featured Work Aspect Ratio",
              required: true,
              defaultValue: "landscape",
              options: [
                { label: "Portrait", value: "portrait" },
                { label: "Landscape", value: "landscape" },
                { label: "Square", value: "square" },
              ],
              admin: {
                description:
                  "Larger card shape used only in the featured layout near the top of the /work page.",
              },
            },
          ],
        },
        {
          label: "Hero",
          description:
            "Top section of the public project detail page.",
          fields: [
            {
              name: "heroLabel",
              type: "text",
              required: true,
              defaultValue: "Case Study",
              label: "Hero Eyebrow Label",
              admin: {
                description:
                  "Small label shown above the hero title.",
              },
            },
            {
              name: "heroTitle",
              type: "text",
              required: true,
              label: "Hero Title",
              admin: {
                description: "Main large heading for the project page.",
              },
            },
            {
              name: "heroSubtitle",
              type: "text",
              required: true,
              label: "Hero Subtitle",
              admin: {
                description: "Short supporting line under the hero title.",
              },
            },
            {
              name: "heroSummary",
              type: "textarea",
              label: "Hero Summary",
              admin: {
                description:
                  "Short summary used for metadata and as an editorial intro to the project.",
              },
            },
            {
              name: "launchUrl",
              type: "text",
              label: "Launch / Visit URL",
              admin: {
                description:
                  "External link opened by the main CTA button on the detail page. Leave empty to fall back to /contact.",
              },
            },
          ],
        },
        {
          label: "Intro & Overview",
          description:
            "Project metadata and opening content shown right after the hero.",
          fields: [
            {
              name: "introMeta",
              type: "group",
              label: "Intro Meta Block",
              admin: {
                description:
                  "Structured project details shown near the top of the case study.",
              },
              fields: [
                {
                  name: "launchLabel",
                  type: "text",
                  required: true,
                  defaultValue: "Launch project",
                  label: "CTA Button Label",
                  admin: {
                    description:
                      "Text shown on the main overview button.",
                  },
                },
                {
                  name: "type",
                  type: "text",
                  required: true,
                  label: "Project Type",
                  admin: {
                    description:
                      "Example: Campaign, Product, Experience, Brand Platform.",
                  },
                },
                {
                  name: "client",
                  type: "text",
                  required: true,
                  label: "Client Name",
                },
                {
                  name: "deliverables",
                  type: "text",
                  required: true,
                  label: "Deliverables",
                  admin: {
                    description:
                      "Short summary of what was made. Example: Brand system, website, motion toolkit.",
                  },
                },
              ],
            },
            {
              name: "overview",
              type: "array",
              label: "Overview Facts",
              admin: {
                description:
                  "Compact label/value facts shown in the overview strip.",
                initCollapsed: true,
              },
              fields: [
                { name: "label", type: "text", required: true, label: "Fact Label" },
                { name: "value", type: "text", required: true, label: "Fact Value" },
              ],
            },
            {
              name: "intro",
              type: "array",
              label: "Intro Paragraphs",
              admin: {
                description:
                  "Opening editorial text blocks shown below the overview strip.",
                initCollapsed: true,
              },
              fields: [
                {
                  name: "paragraph",
                  type: "textarea",
                  required: true,
                  label: "Paragraph",
                },
              ],
            },
          ],
        },
        {
          label: "Story Content",
          description:
            "Main storytelling sections and supporting showcase content for the case study page.",
          fields: [
            {
              name: "primaryShowcase",
              type: "group",
              label: "Primary Showcase",
              admin: {
                description:
                  "Large lead image used in the hero artwork and the first showcase block.",
              },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: "Showcase Image",
                },
                {
                  name: "alt",
                  type: "text",
                  required: true,
                  label: "Accessibility Alt Text",
                },
                {
                  name: "label",
                  type: "text",
                  label: "Optional Small Label",
                },
              ],
            },
            {
              name: "process",
              type: "array",
              label: "Process Timeline",
              admin: {
                description:
                  "Step-by-step timeline that explains how the project moved from discovery to launch.",
                initCollapsed: true,
              },
              fields: [
                {
                  name: "phase",
                  type: "text",
                  required: true,
                  label: "Step Number",
                  admin: {
                    description: "Example: 01, 02, 03.",
                  },
                },
                {
                  name: "label",
                  type: "text",
                  required: true,
                  label: "Step Title",
                },
                {
                  name: "desc",
                  type: "textarea",
                  required: true,
                  label: "Step Description",
                },
              ],
            },
            {
              name: "sections",
              type: "array",
              label: "Story Sections",
              admin: {
                description:
                  "Main case-study chapters. Each section includes text, an image, and layout settings.",
                initCollapsed: true,
              },
              fields: [
                {
                  name: "eyebrow",
                  type: "text",
                  required: true,
                  label: "Section Eyebrow",
                },
                {
                  name: "title",
                  type: "text",
                  required: true,
                  label: "Section Title",
                },
                {
                  name: "body",
                  type: "array",
                  label: "Section Body Paragraphs",
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: "paragraph",
                      type: "textarea",
                      required: true,
                      label: "Paragraph",
                    },
                  ],
                },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: "Section Image",
                },
                {
                  name: "imageAlt",
                  type: "text",
                  required: true,
                  label: "Section Image Alt Text",
                },
                {
                  name: "imageLayout",
                  type: "select",
                  required: true,
                  defaultValue: "left",
                  label: "Image Position",
                  options: [
                    { label: "Left", value: "left" },
                    { label: "Right", value: "right" },
                  ],
                  admin: {
                    description:
                      "Choose whether the image appears on the left or right side of the section.",
                  },
                },
                {
                  name: "tone",
                  type: "select",
                  defaultValue: "light",
                  label: "Section Background Tone",
                  options: [
                    { label: "Light", value: "light" },
                    { label: "Navy", value: "navy" },
                  ],
                  admin: {
                    description:
                      "Visual tone of the section wrapper.",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Results & Extras",
          description:
            "Metrics, gallery items, testimonials, palette references, credits, and related projects.",
          fields: [
            {
              name: "impactMetrics",
              type: "array",
              label: "Impact Metrics",
              admin: {
                description:
                  "Results shown in the impact section. Example: Engagement uplift, conversion rate, reach.",
                initCollapsed: true,
              },
              fields: [
                { name: "label", type: "text", required: true, label: "Metric Label" },
                { name: "value", type: "text", required: true, label: "Metric Value" },
              ],
            },
            {
              name: "galleryMedia",
              type: "upload",
              relationTo: "media",
              hasMany: true,
              maxRows: 12,
              label: "Gallery Images (Bulk Upload)",
              admin: {
                description:
                  "Fast multi-image gallery field. Use this when you want to upload or select several gallery images at once. The public page will use each media item's alt text and caption.",
              },
            },
            {
              name: "gallery",
              type: "array",
              label: "Gallery Images",
              admin: {
                description:
                  "Advanced gallery overrides. Use this only when you need per-image text different from the media library values.",
                initCollapsed: true,
              },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: "Gallery Image",
                },
                {
                  name: "alt",
                  type: "text",
                  required: true,
                  label: "Gallery Image Alt Text",
                },
                {
                  name: "label",
                  type: "text",
                  label: "Optional Image Label",
                },
              ],
            },
            {
              name: "testimonials",
              type: "array",
              label: "Testimonials",
              admin: {
                description:
                  "Quotes shown in the testimonial carousel.",
                initCollapsed: true,
              },
              fields: [
                { name: "quote", type: "textarea", required: true, label: "Quote" },
                { name: "author", type: "text", required: true, label: "Author Name" },
                { name: "role", type: "text", required: true, label: "Author Role / Title" },
              ],
            },
            {
              name: "colors",
              type: "array",
              label: "Color Palette",
              admin: {
                description:
                  "Palette chips displayed in the color story section. Optionally assign each swatch to a project-page theme role below.",
                initCollapsed: true,
              },
              fields: [
                {
                  name: "hex",
                  type: "text",
                  required: true,
                  label: "HEX Color",
                  validate: (value) => {
                    if (typeof value !== "string") return "HEX color is required.";

                    const candidate = value.trim();
                    if (!/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/.test(candidate)) {
                      return "Use a valid hex color like #1A2B3C or #ABC.";
                    }

                    return true;
                  },
                  admin: {
                    description: "Example: #0A1B3F",
                    components: {
                      Field: {
                        path: "@/components/payload/HexColorPickerField",
                        exportName: "HexColorPickerField",
                      },
                    },
                  },
                },
                {
                  name: "name",
                  type: "text",
                  required: true,
                  label: "Color Name",
                },
                {
                  name: "themeRole",
                  type: "select",
                  label: "Project Theme Role",
                  options: [
                    {
                      label:
                        "Accent - hero backgrounds, major surfaces, buttons, header accents, footer background",
                      value: "accent",
                    },
                    {
                      label:
                        "Secondary - highlights, dividers, progress bar, eyebrow labels, small emphasis details",
                      value: "secondary",
                    },
                    {
                      label:
                        "Background - page base tone, lighter section surfaces, cards, menu icon contrast base",
                      value: "background",
                    },
                    {
                      label:
                        "Foreground - main readable text color used on light project sections and cards",
                      value: "foreground",
                    },
                    {
                      label:
                        "Display Only - shown in Color Story only, does not drive project page theming",
                      value: "showcase",
                    },
                  ],
                  admin: {
                    description:
                      "Optional. Choose exactly what this swatch controls on the project page. If you leave roles empty, the legacy fallback still applies in order: 1 accent, 2 secondary, 3 background, 4 foreground.",
                  },
                },
              ],
            },
            {
              name: "credits",
              type: "array",
              label: "Credits / Footer Facts",
              admin: {
                description:
                  "Short label/value items displayed near the bottom of the project page.",
                initCollapsed: true,
              },
              fields: [
                { name: "label", type: "text", required: true, label: "Credit Label" },
                { name: "value", type: "text", required: true, label: "Credit Value" },
              ],
            },
            {
              name: "relatedProjects",
              type: "relationship",
              relationTo: "projects",
              hasMany: true,
              label: "Related Projects",
              admin: {
                description:
                  "Choose projects to show in the related projects section.",
              },
            },
            {
              name: "inheritThemeFromPalette",
              type: "checkbox",
              label: "Inherit Theme From Palette",
              defaultValue: true,
              admin: {
                description:
                  "When enabled, the project page and shared chrome (header, menu, footer) will adopt colors from the ordered palette below. Color 1 = accent, Color 2 = secondary, Color 3 = background, Color 4 = foreground. Additional colors are display-only.",
              },
            },
            {
              name: "themePreferenceConfigured",
              type: "checkbox",
              defaultValue: false,
              admin: {
                hidden: true,
              },
            },
          ],
        },
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Published At",
      admin: {
        position: "sidebar",
        description:
          "Public pages only show projects with a published date.",
      },
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      label: "Listing Order",
      admin: {
        description:
          "Lower numbers appear first in project listings and the /work page.",
        position: "sidebar",
      },
    },
  ],
};

export default Projects;
