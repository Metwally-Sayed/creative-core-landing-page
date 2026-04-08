// src/payload.config.ts
import path from "path";
import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";

// src/collections/Media.ts
var Media = {
  slug: "media",
  admin: {
    useAsTitle: "alt"
  },
  upload: true,
  fields: [
    {
      name: "alt",
      type: "text",
      required: true
    },
    {
      name: "caption",
      type: "textarea"
    }
  ]
};

// src/collections/Users.ts
var Users = {
  slug: "users",
  admin: {
    useAsTitle: "email"
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text"
    },
    {
      name: "role",
      type: "select",
      defaultValue: "editor",
      options: [
        {
          label: "Admin",
          value: "admin"
        },
        {
          label: "Editor",
          value: "editor"
        },
        {
          label: "Viewer",
          value: "viewer"
        }
      ],
      required: true
    }
  ]
};

// src/collections/Projects.ts
var Projects = {
  slug: "projects",
  admin: {
    defaultColumns: ["title", "slug", "updatedAt"],
    useAsTitle: "title"
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: "Project Title",
      admin: {
        description: "Main project name used in the admin, cards, and page content."
      }
    },
    {
      name: "slug",
      type: "text",
      index: true,
      required: true,
      unique: true,
      label: "URL Slug",
      admin: {
        description: "Public URL for the project page. Example: fingerspelling-with-machine-learning"
      }
    },
    {
      name: "legacyId",
      type: "text",
      unique: true,
      label: "Legacy Project ID",
      admin: {
        description: "Old numeric project ID used to redirect routes like /projects/1 to the new slug URL.",
        position: "sidebar"
      }
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Card & Listing",
          description: "Controls how the project appears on the homepage, /work page, and related project cards.",
          fields: [
            {
              name: "tags",
              type: "array",
              label: "Project Tags",
              admin: {
                description: "Short labels shown under cards and used for project context.",
                initCollapsed: true
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                  label: "Tag"
                }
              ]
            },
            {
              name: "workFilters",
              type: "select",
              label: "Work Page Filters",
              hasMany: true,
              options: [
                { label: "Products", value: "Products" },
                { label: "Experiences", value: "Experiences" },
                { label: "Branding", value: "Branding" }
              ],
              admin: {
                description: "Choose which filter tabs this project should appear under on /work and the homepage."
              }
            },
            {
              name: "image",
              type: "upload",
              relationTo: "media",
              required: true,
              label: "Primary Card Image",
              admin: {
                description: "Main thumbnail image used across listing cards and summaries."
              }
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
                { label: "Square", value: "square" }
              ],
              admin: {
                description: "Default card shape used in normal project grids and homepage cards."
              }
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
                { label: "Square", value: "square" }
              ],
              admin: {
                description: "Larger card shape used only in the featured layout near the top of the /work page."
              }
            }
          ]
        },
        {
          label: "Hero",
          description: "Top section of the public project detail page.",
          fields: [
            {
              name: "heroLabel",
              type: "text",
              required: true,
              defaultValue: "Case Study",
              label: "Hero Eyebrow Label",
              admin: {
                description: "Small label shown above the hero title."
              }
            },
            {
              name: "heroTitle",
              type: "text",
              required: true,
              label: "Hero Title",
              admin: {
                description: "Main large heading for the project page."
              }
            },
            {
              name: "heroSubtitle",
              type: "text",
              required: true,
              label: "Hero Subtitle",
              admin: {
                description: "Short supporting line under the hero title."
              }
            },
            {
              name: "heroSummary",
              type: "textarea",
              label: "Hero Summary",
              admin: {
                description: "Short summary used for metadata and as an editorial intro to the project."
              }
            },
            {
              name: "launchUrl",
              type: "text",
              label: "Launch / Visit URL",
              admin: {
                description: "External link opened by the main CTA button on the detail page. Leave empty to fall back to /contact."
              }
            }
          ]
        },
        {
          label: "Intro & Overview",
          description: "Project metadata and opening content shown right after the hero.",
          fields: [
            {
              name: "introMeta",
              type: "group",
              label: "Intro Meta Block",
              admin: {
                description: "Structured project details shown near the top of the case study."
              },
              fields: [
                {
                  name: "launchLabel",
                  type: "text",
                  required: true,
                  defaultValue: "Launch project",
                  label: "CTA Button Label",
                  admin: {
                    description: "Text shown on the main overview button."
                  }
                },
                {
                  name: "type",
                  type: "text",
                  required: true,
                  label: "Project Type",
                  admin: {
                    description: "Example: Campaign, Product, Experience, Brand Platform."
                  }
                },
                {
                  name: "client",
                  type: "text",
                  required: true,
                  label: "Client Name"
                },
                {
                  name: "deliverables",
                  type: "text",
                  required: true,
                  label: "Deliverables",
                  admin: {
                    description: "Short summary of what was made. Example: Brand system, website, motion toolkit."
                  }
                }
              ]
            },
            {
              name: "overview",
              type: "array",
              label: "Overview Facts",
              admin: {
                description: "Compact label/value facts shown in the overview strip.",
                initCollapsed: true
              },
              fields: [
                { name: "label", type: "text", required: true, label: "Fact Label" },
                { name: "value", type: "text", required: true, label: "Fact Value" }
              ]
            },
            {
              name: "intro",
              type: "array",
              label: "Intro Paragraphs",
              admin: {
                description: "Opening editorial text blocks shown below the overview strip.",
                initCollapsed: true
              },
              fields: [
                {
                  name: "paragraph",
                  type: "textarea",
                  required: true,
                  label: "Paragraph"
                }
              ]
            }
          ]
        },
        {
          label: "Story Content",
          description: "Main storytelling sections and supporting showcase content for the case study page.",
          fields: [
            {
              name: "primaryShowcase",
              type: "group",
              label: "Primary Showcase",
              admin: {
                description: "Large lead image used in the hero artwork and the first showcase block."
              },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: "Showcase Image"
                },
                {
                  name: "alt",
                  type: "text",
                  required: true,
                  label: "Accessibility Alt Text"
                },
                {
                  name: "label",
                  type: "text",
                  label: "Optional Small Label"
                }
              ]
            },
            {
              name: "process",
              type: "array",
              label: "Process Timeline",
              admin: {
                description: "Step-by-step timeline that explains how the project moved from discovery to launch.",
                initCollapsed: true
              },
              fields: [
                {
                  name: "phase",
                  type: "text",
                  required: true,
                  label: "Step Number",
                  admin: {
                    description: "Example: 01, 02, 03."
                  }
                },
                {
                  name: "label",
                  type: "text",
                  required: true,
                  label: "Step Title"
                },
                {
                  name: "desc",
                  type: "textarea",
                  required: true,
                  label: "Step Description"
                }
              ]
            },
            {
              name: "sections",
              type: "array",
              label: "Story Sections",
              admin: {
                description: "Main case-study chapters. Each section includes text, an image, and layout settings.",
                initCollapsed: true
              },
              fields: [
                {
                  name: "eyebrow",
                  type: "text",
                  required: true,
                  label: "Section Eyebrow"
                },
                {
                  name: "title",
                  type: "text",
                  required: true,
                  label: "Section Title"
                },
                {
                  name: "body",
                  type: "array",
                  label: "Section Body Paragraphs",
                  admin: {
                    initCollapsed: true
                  },
                  fields: [
                    {
                      name: "paragraph",
                      type: "textarea",
                      required: true,
                      label: "Paragraph"
                    }
                  ]
                },
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: "Section Image"
                },
                {
                  name: "imageAlt",
                  type: "text",
                  required: true,
                  label: "Section Image Alt Text"
                },
                {
                  name: "imageLayout",
                  type: "select",
                  required: true,
                  defaultValue: "left",
                  label: "Image Position",
                  options: [
                    { label: "Left", value: "left" },
                    { label: "Right", value: "right" }
                  ],
                  admin: {
                    description: "Choose whether the image appears on the left or right side of the section."
                  }
                },
                {
                  name: "tone",
                  type: "select",
                  defaultValue: "light",
                  label: "Section Background Tone",
                  options: [
                    { label: "Light", value: "light" },
                    { label: "Navy", value: "navy" }
                  ],
                  admin: {
                    description: "Visual tone of the section wrapper."
                  }
                }
              ]
            }
          ]
        },
        {
          label: "Results & Extras",
          description: "Metrics, gallery items, testimonials, palette references, credits, and related projects.",
          fields: [
            {
              name: "impactMetrics",
              type: "array",
              label: "Impact Metrics",
              admin: {
                description: "Results shown in the impact section. Example: Engagement uplift, conversion rate, reach.",
                initCollapsed: true
              },
              fields: [
                { name: "label", type: "text", required: true, label: "Metric Label" },
                { name: "value", type: "text", required: true, label: "Metric Value" }
              ]
            },
            {
              name: "gallery",
              type: "array",
              label: "Gallery Images",
              admin: {
                description: "Supporting images used in the horizontal gallery section.",
                initCollapsed: true
              },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                  label: "Gallery Image"
                },
                {
                  name: "alt",
                  type: "text",
                  required: true,
                  label: "Gallery Image Alt Text"
                },
                {
                  name: "label",
                  type: "text",
                  label: "Optional Image Label"
                }
              ]
            },
            {
              name: "testimonials",
              type: "array",
              label: "Testimonials",
              admin: {
                description: "Quotes shown in the testimonial carousel.",
                initCollapsed: true
              },
              fields: [
                { name: "quote", type: "textarea", required: true, label: "Quote" },
                { name: "author", type: "text", required: true, label: "Author Name" },
                { name: "role", type: "text", required: true, label: "Author Role / Title" }
              ]
            },
            {
              name: "colors",
              type: "array",
              label: "Color Palette",
              admin: {
                description: "Palette chips displayed in the color story section.",
                initCollapsed: true
              },
              fields: [
                {
                  name: "hex",
                  type: "text",
                  required: true,
                  label: "HEX Color",
                  admin: {
                    description: "Example: #0A1B3F"
                  }
                },
                {
                  name: "name",
                  type: "text",
                  required: true,
                  label: "Color Name"
                }
              ]
            },
            {
              name: "credits",
              type: "array",
              label: "Credits / Footer Facts",
              admin: {
                description: "Short label/value items displayed near the bottom of the project page.",
                initCollapsed: true
              },
              fields: [
                { name: "label", type: "text", required: true, label: "Credit Label" },
                { name: "value", type: "text", required: true, label: "Credit Value" }
              ]
            },
            {
              name: "relatedProjects",
              type: "relationship",
              relationTo: "projects",
              hasMany: true,
              label: "Related Projects",
              admin: {
                description: "Choose projects to show in the related projects section."
              }
            }
          ]
        }
      ]
    },
    {
      name: "publishedAt",
      type: "date",
      label: "Published At",
      admin: {
        position: "sidebar",
        description: "Public pages only show projects with a published date."
      }
    },
    {
      name: "sortOrder",
      type: "number",
      defaultValue: 0,
      label: "Listing Order",
      admin: {
        description: "Lower numbers appear first in project listings and the /work page.",
        position: "sidebar"
      }
    }
  ]
};

// src/collections/QuoteAttachments.ts
var QuoteAttachments = {
  slug: "quote-attachments",
  admin: {
    useAsTitle: "filename",
    group: "Quoting System"
  },
  upload: {
    staticDir: "public/uploads/quotes",
    mimeTypes: ["image/*", "application/pdf"]
  },
  fields: [
    {
      name: "alt",
      type: "text"
    }
  ]
};

// src/collections/QuoteSubmissions.ts
var QuoteSubmissions = {
  slug: "quote-submissions",
  admin: {
    useAsTitle: "name",
    group: "Quoting System",
    defaultColumns: ["name", "email", "company", "createdAt"]
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true
    },
    {
      name: "email",
      type: "email",
      required: true
    },
    {
      name: "company",
      type: "text"
    },
    {
      name: "projectType",
      type: "select",
      hasMany: true,
      options: [
        { label: "Product Design", value: "product" },
        { label: "Branding", value: "branding" },
        { label: "Development", value: "dev" },
        { label: "Strategy", value: "strategy" }
      ]
    },
    {
      name: "budget",
      type: "select",
      options: [
        { label: "Under $25k", value: "under25" },
        { label: "$25k - $50k", value: "25-50" },
        { label: "$50k - $100k", value: "50-100" },
        { label: "$100k+", value: "100plus" }
      ]
    },
    {
      name: "message",
      type: "textarea",
      required: true
    },
    {
      name: "attachments",
      type: "upload",
      relationTo: "quote-attachments",
      hasMany: true
    }
  ]
};

// src/globals/Homepage.ts
var heroBlock = {
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
      minRows: 1
    },
    { name: "desktopVideo", type: "upload", relationTo: "media" },
    { name: "mobileVideo", type: "upload", relationTo: "media" },
    { name: "posterImage", type: "upload", relationTo: "media" },
    { name: "scrollCueLabel", type: "text" },
    {
      name: "minHeightVariant",
      type: "select",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Tall", value: "tall" }
      ]
    },
    {
      name: "overlayStyle",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" }
      ]
    }
  ]
};
var curatedProjectsBlock = {
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
        { label: "Tag-based", value: "tagBased" }
      ]
    },
    {
      name: "filterLabels",
      type: "array",
      fields: [{ name: "label", type: "text" }]
    },
    {
      name: "projects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true
    },
    { name: "maxItems", type: "number" },
    { name: "emptyStateText", type: "text" }
  ]
};
var featureMediaBlock = {
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
        { label: "Video", value: "video" }
      ]
    },
    { name: "backgroundImage", type: "upload", relationTo: "media" },
    { name: "backgroundVideo", type: "upload", relationTo: "media" },
    {
      name: "overlayStyle",
      type: "select",
      options: [
        { label: "None", value: "none" },
        { label: "Light", value: "light" },
        { label: "Dark", value: "dark" }
      ]
    },
    {
      name: "stats",
      type: "array",
      fields: [
        { name: "label", type: "text" },
        { name: "value", type: "text" },
        { name: "supportingText", type: "text" }
      ]
    },
    { name: "primaryCtaLabel", type: "text" },
    { name: "primaryCtaHref", type: "text" },
    { name: "secondaryCtaLabel", type: "text" },
    { name: "secondaryCtaHref", type: "text" }
  ]
};
var faqSpotlightBlock = {
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
          fields: [{ name: "label", type: "text" }]
        }
      ]
    },
    {
      name: "quoteLauncherVariant",
      type: "select",
      options: [
        { label: "Standard", value: "standard" },
        { label: "Inverted", value: "inverted" }
      ]
    },
    { name: "quoteLauncherLabel", type: "text" }
  ]
};
var quoteLauncherBlock = {
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
        { label: "Secondary", value: "secondary" }
      ]
    }
  ]
};
var statsGridBlock = {
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
        { name: "supportingText", type: "text" }
      ]
    },
    {
      name: "columns",
      type: "select",
      options: [
        { label: "2", value: "2" },
        { label: "3", value: "3" },
        { label: "4", value: "4" }
      ]
    }
  ]
};
var richTextContentBlock = {
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
        { label: "Split", value: "split" }
      ]
    }
  ]
};
var mediaGalleryBlock = {
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
        { name: "href", type: "text" }
      ]
    },
    {
      name: "layoutVariant",
      type: "select",
      options: [
        { label: "Grid", value: "grid" },
        { label: "Carousel", value: "carousel" },
        { label: "Masonry", value: "masonry" }
      ]
    }
  ]
};
var logoStripBlock = {
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
        { name: "href", type: "text" }
      ]
    }
  ]
};
var ctaBannerBlock = {
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
        { label: "Inverted", value: "inverted" }
      ]
    }
  ]
};
var Homepage = {
  slug: "homepage",
  admin: {
    livePreview: {
      url: () => {
        const secret = process.env.PREVIEW_SECRET || "hello-monday-payload-dev-secret";
        const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";
        return `${serverUrl}/api/preview?secret=${secret}&slug=/`;
      }
    }
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: "internalName",
      type: "text"
    },
    {
      name: "metaTitle",
      type: "text"
    },
    {
      name: "metaDescription",
      type: "text"
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media"
    },
    {
      name: "canonicalUrl",
      type: "text"
    },
    {
      name: "statusNote",
      type: "text",
      admin: {
        description: "Internal notes for editors - not visible on site"
      }
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
        ctaBannerBlock
      ]
    }
  ]
};

// src/globals/SiteSettings.ts
var SiteSettings = {
  slug: "siteSettings",
  admin: {
    livePreview: {
      url: () => {
        const secret = process.env.PREVIEW_SECRET || "hello-monday-payload-dev-secret";
        return `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/preview?secret=${secret}&slug=/`;
      }
    }
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: "logoWordmarkPrimary",
      type: "upload",
      relationTo: "media"
    },
    {
      name: "logoWordmarkSecondary",
      type: "upload",
      relationTo: "media"
    },
    {
      name: "navItems",
      type: "array",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" },
        { name: "openInNewTab", type: "checkbox" }
      ]
    },
    {
      name: "quoteTriggerLabel",
      type: "text"
    },
    {
      name: "mobileMenuLabel",
      type: "text"
    },
    {
      name: "storiesHref",
      type: "text"
    },
    {
      name: "showQuoteCtaRules",
      type: "group",
      fields: [
        { name: "hideOnWork", type: "checkbox" },
        { name: "hideOnServices", type: "checkbox" },
        { name: "hideOnAbout", type: "checkbox" },
        { name: "hideOnProduct", type: "checkbox" },
        { name: "hideOnProjects", type: "checkbox" }
      ]
    },
    {
      name: "contactCards",
      type: "array",
      fields: [
        { name: "label", type: "text" },
        { name: "sublabel", type: "text" },
        { name: "value", type: "text" },
        { name: "href", type: "text" },
        { name: "copyToClipboard", type: "checkbox" }
      ]
    },
    {
      name: "locations",
      type: "array",
      fields: [
        { name: "city", type: "text" },
        {
          name: "addressLines",
          type: "array",
          fields: [
            { name: "line", type: "text" }
          ]
        },
        { name: "href", type: "text" }
      ]
    },
    {
      name: "socialLinks",
      type: "array",
      fields: [
        { name: "label", type: "text" },
        { name: "href", type: "text" }
      ]
    },
    {
      name: "privacyLabel",
      type: "text"
    },
    {
      name: "privacyHref",
      type: "text"
    },
    {
      name: "backToTopLabel",
      type: "text"
    }
  ]
};

// src/globals/QuoteForm.ts
var fieldTypes = [
  { label: "Text", value: "text" },
  { label: "Textarea", value: "textarea" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Single Select", value: "singleSelect" },
  { label: "Multi Select", value: "multiSelect" },
  { label: "Radio", value: "radio" },
  { label: "Checkbox Group", value: "checkboxGroup" },
  { label: "File Upload", value: "fileUpload" }
];
var visibilityOperators = [
  { label: "Equals", value: "equals" },
  { label: "Not Equals", value: "notEquals" },
  { label: "Includes", value: "includes" },
  { label: "Not Includes", value: "notIncludes" },
  { label: "Is Empty", value: "isEmpty" },
  { label: "Is Not Empty", value: "isNotEmpty" }
];
var fieldWidths = [
  { label: "Full", value: "full" },
  { label: "Half", value: "half" },
  { label: "Third", value: "third" }
];
var visibilityRuleFields = [
  { name: "dependsOnField", type: "text" },
  {
    name: "operator",
    type: "select",
    options: visibilityOperators
  },
  { name: "value", type: "text" }
];
var QuoteForm = {
  slug: "quoteForm",
  dbName: "quote_form",
  admin: {
    livePreview: {
      url: () => {
        const secret = process.env.PREVIEW_SECRET || "hello-monday-payload-dev-secret";
        return `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/preview?secret=${secret}&slug=/`;
      }
    }
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: "triggerLabelDefault",
      type: "text"
    },
    {
      name: "dialogTitle",
      type: "text"
    },
    {
      name: "dialogDescription",
      type: "textarea"
    },
    {
      name: "summaryHeading",
      type: "text"
    },
    {
      name: "summaryIntro",
      type: "textarea"
    },
    {
      name: "submitButtonLabel",
      type: "text"
    },
    {
      name: "successMessage",
      type: "textarea"
    },
    {
      name: "submissionEmailRecipients",
      type: "array",
      dbName: "email_recipients",
      fields: [
        { name: "email", type: "text" }
      ]
    },
    {
      name: "submissionEmailSubjectPrefix",
      type: "text"
    },
    {
      name: "steps",
      type: "array",
      dbName: "steps",
      fields: [
        { name: "id", type: "text" },
        { name: "indexLabel", type: "text" },
        { name: "navLabel", type: "text" },
        { name: "title", type: "text" },
        { name: "description", type: "textarea" },
        {
          name: "visibilityRules",
          type: "array",
          dbName: "step_rules",
          admin: {
            description: "Optional branching rules for this entire step. Leave empty to always show the step."
          },
          fields: visibilityRuleFields
        },
        {
          name: "fields",
          type: "array",
          dbName: "fields",
          fields: [
            { name: "id", type: "text" },
            { name: "name", type: "text" },
            {
              name: "type",
              type: "select",
              options: fieldTypes
            },
            { name: "label", type: "text" },
            { name: "helperText", type: "text" },
            { name: "placeholder", type: "text" },
            { name: "required", type: "checkbox" },
            { name: "defaultValue", type: "text" },
            { name: "includeInSummary", type: "checkbox" },
            {
              name: "width",
              type: "select",
              options: fieldWidths
            },
            {
              name: "options",
              type: "array",
              dbName: "options",
              fields: [
                { name: "label", type: "text" },
                { name: "value", type: "text" }
              ]
            },
            {
              name: "validation",
              type: "group",
              fields: [
                { name: "minLength", type: "number" },
                { name: "maxLength", type: "number" },
                { name: "minSelections", type: "number" },
                { name: "maxSelections", type: "number" },
                { name: "pattern", type: "text" },
                {
                  name: "allowedFileMimeTypes",
                  type: "array",
                  dbName: "allowed_mimes",
                  fields: [
                    { name: "mimeType", type: "text" }
                  ]
                },
                { name: "maxFileSizeMb", type: "number" },
                { name: "maxFiles", type: "number" }
              ]
            },
            {
              name: "visibilityRules",
              type: "array",
              dbName: "visibility_rules",
              fields: visibilityRuleFields
            }
          ]
        }
      ]
    }
  ]
};

// src/globals/ServicesPage.ts
var ServicesPage = {
  slug: "servicesPage",
  admin: {
    group: "Pages"
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: "metaTitle",
      type: "text",
      admin: {
        placeholder: "Services | Hello Monday / Dept."
      }
    },
    {
      name: "metaDescription",
      type: "textarea"
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media"
    },
    {
      name: "canonicalUrl",
      type: "text"
    },
    {
      name: "heroTitle",
      type: "text",
      required: true
    },
    {
      name: "heroBody",
      type: "textarea",
      required: true
    },
    {
      name: "serviceSections",
      type: "array",
      minRows: 3,
      maxRows: 3,
      fields: [
        {
          name: "sectionId",
          type: "text",
          required: true,
          admin: {
            description: "Used for anchor links (e.g. 'branding')"
          }
        },
        {
          name: "eyebrow",
          type: "text",
          required: true
        },
        {
          name: "title",
          type: "text",
          required: true
        },
        {
          name: "body",
          type: "textarea",
          required: true
        },
        {
          name: "linkLabel",
          type: "text",
          required: true
        },
        {
          name: "illustration",
          type: "select",
          options: [
            { label: "Products", value: "products" },
            { label: "Experiences", value: "experiences" },
            { label: "Branding", value: "branding" }
          ],
          required: true
        },
        {
          name: "cards",
          type: "array",
          minRows: 2,
          maxRows: 2,
          fields: [
            {
              name: "title",
              type: "text",
              required: true
            },
            {
              name: "subtitle",
              type: "text",
              required: true
            },
            {
              name: "art",
              type: "select",
              options: [
                { label: "Confetti Watch", value: "confetti-watch" },
                { label: "YouTube Play", value: "youtube-play" },
                { label: "Bear Frame", value: "bear-frame" },
                { label: "VR Fans", value: "vr-fans" },
                { label: "Split Rings", value: "split-rings" },
                { label: "Residenta Pack", value: "residenta-pack" }
              ],
              required: true
            }
          ]
        }
      ]
    },
    {
      name: "shinyThings",
      type: "group",
      fields: [
        {
          name: "eyebrow",
          type: "text",
          required: true
        },
        {
          name: "title",
          type: "text",
          required: true
        },
        {
          name: "body",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      name: "awardColumns",
      type: "array",
      minRows: 2,
      maxRows: 2,
      fields: [
        {
          name: "awards",
          type: "array",
          fields: [
            {
              name: "label",
              type: "text",
              required: true
            },
            {
              name: "value",
              type: "text",
              required: true
            }
          ]
        }
      ]
    }
  ]
};

// src/globals/AboutPage.ts
var AboutPage = {
  slug: "aboutPage",
  admin: {
    group: "Pages"
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: "metaTitle",
      type: "text"
    },
    {
      name: "metaDescription",
      type: "textarea"
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media"
    },
    {
      name: "canonicalUrl",
      type: "text"
    },
    {
      name: "heroTitle",
      type: "text",
      required: true
    },
    {
      name: "heroBody",
      type: "textarea",
      required: true
    },
    {
      name: "jumpLinks",
      type: "array",
      fields: [
        {
          name: "label",
          type: "text",
          required: true
        },
        {
          name: "href",
          type: "text",
          required: true
        }
      ]
    },
    {
      name: "locations",
      type: "array",
      fields: [
        {
          name: "city",
          type: "text",
          required: true
        },
        {
          name: "country",
          type: "text",
          required: true
        },
        {
          name: "timezone",
          type: "text",
          required: true
        },
        {
          name: "mapUrl",
          type: "text",
          required: true
        },
        {
          name: "address",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      name: "codeOfHonor",
      type: "group",
      fields: [
        {
          name: "eyebrow",
          type: "text"
        },
        {
          name: "title",
          type: "text"
        },
        {
          name: "body",
          type: "textarea"
        },
        {
          name: "items",
          type: "array",
          fields: [
            {
              name: "itemId",
              type: "text",
              required: true
            },
            {
              name: "index",
              type: "text",
              required: true
            },
            {
              name: "title",
              type: "text",
              required: true
            },
            {
              name: "body",
              type: "textarea",
              required: true
            },
            {
              name: "art",
              type: "select",
              options: [
                { label: "Be Nice", value: "be-nice" },
                { label: "Powers for Good", value: "powers-for-good" },
                { label: "Try the Truth", value: "try-the-truth" },
                { label: "Enjoy the Ride", value: "enjoy-the-ride" },
                { label: "Speak Up and Listen", value: "speak-up-and-listen" },
                { label: "Solve the Problem", value: "solve-the-problem" },
                { label: "Help Each Other", value: "help-each-other" },
                { label: "Team Up", value: "team-up" }
              ]
            }
          ]
        }
      ]
    },
    {
      name: "mondayteers",
      type: "group",
      fields: [
        {
          name: "eyebrow",
          type: "text"
        },
        {
          name: "title",
          type: "text"
        },
        {
          name: "body",
          type: "textarea"
        },
        {
          name: "team",
          type: "array",
          fields: [
            {
              name: "name",
              type: "text",
              required: true
            },
            {
              name: "city",
              type: "text",
              required: true
            },
            {
              name: "role",
              type: "text",
              required: true
            },
            {
              name: "art",
              type: "select",
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
                { label: "Art 30", value: "art30" }
              ]
            },
            {
              name: "accentLabel",
              type: "text",
              required: true
            }
          ]
        }
      ]
    }
  ]
};

// src/globals/WorkPage.ts
var WorkPage = {
  slug: "workPage",
  admin: {
    group: "Pages"
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: "metaTitle",
      type: "text"
    },
    {
      name: "metaDescription",
      type: "textarea"
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media"
    },
    {
      name: "canonicalUrl",
      type: "text"
    },
    {
      name: "heroTitle",
      type: "text"
    },
    {
      name: "heroBody",
      type: "textarea"
    },
    {
      name: "filterLabels",
      type: "array",
      fields: [
        {
          name: "label",
          type: "text",
          required: true
        },
        {
          name: "value",
          type: "text",
          required: true
        }
      ]
    },
    {
      name: "featuredProjects",
      type: "relationship",
      relationTo: "projects",
      hasMany: true,
      admin: {
        description: "Optionally highlight specific projects at the top of the work page"
      }
    }
  ]
};

// src/globals/ProductPage.ts
var ProductPage = {
  slug: "productPage",
  admin: {
    group: "Pages"
  },
  versions: {
    drafts: true
  },
  fields: [
    {
      name: "metaTitle",
      type: "text"
    },
    {
      name: "metaDescription",
      type: "textarea"
    },
    {
      name: "ogImage",
      type: "upload",
      relationTo: "media"
    },
    {
      name: "canonicalUrl",
      type: "text"
    },
    {
      name: "heroVideoUrl",
      type: "text",
      required: true,
      admin: {
        placeholder: "https://videos.ctfassets.net/..."
      }
    },
    {
      name: "heroTitleLines",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "line",
          type: "text",
          required: true
        }
      ]
    },
    {
      name: "introEyebrow",
      type: "text",
      required: true
    },
    {
      name: "introParagraphs",
      type: "array",
      minRows: 1,
      fields: [
        {
          name: "paragraph",
          type: "textarea",
          required: true
        }
      ]
    },
    {
      name: "collaborations",
      type: "array",
      fields: [
        {
          name: "name",
          type: "text",
          required: true
        },
        {
          name: "projectCount",
          type: "text",
          required: true
        },
        {
          name: "tag",
          type: "text",
          required: true
        },
        {
          name: "summary",
          type: "textarea",
          required: true
        },
        {
          name: "videoUrl",
          type: "text",
          required: true
        }
      ]
    },
    {
      name: "testimonials",
      type: "array",
      fields: [
        {
          name: "body",
          type: "textarea",
          required: true
        },
        {
          name: "author",
          type: "text",
          required: true
        },
        {
          name: "role",
          type: "text",
          required: true
        }
      ]
    },
    {
      name: "contact",
      type: "group",
      fields: [
        {
          name: "heading",
          type: "text",
          required: true
        },
        {
          name: "body",
          type: "textarea",
          required: true
        },
        {
          name: "email",
          type: "text",
          required: true
        },
        {
          name: "briefLabel",
          type: "text",
          required: true
        },
        {
          name: "photo",
          type: "upload",
          relationTo: "media"
        },
        {
          name: "name",
          type: "text",
          required: true
        },
        {
          name: "title",
          type: "text",
          required: true
        },
        {
          name: "directEmail",
          type: "text",
          required: true
        }
      ]
    }
  ]
};

// src/payload.config.ts
var databaseURL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/hello_monday_payload";
var payload_config_default = buildConfig({
  admin: {
    user: Users.slug
  },
  collections: [Users, Media, Projects, QuoteAttachments, QuoteSubmissions],
  globals: [
    Homepage,
    SiteSettings,
    QuoteForm,
    ServicesPage,
    AboutPage,
    WorkPage,
    ProductPage
  ],
  db: postgresAdapter({
    pool: {
      connectionString: databaseURL
    },
    push: true
  }),
  editor: lexicalEditor({}),
  graphQL: {
    schemaOutputFile: path.resolve(process.cwd(), "src/graphql-schema.graphql")
  },
  secret: process.env.PAYLOAD_SECRET ?? "hello-monday-payload-dev-secret",
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000",
  typescript: {
    outputFile: path.resolve(process.cwd(), "src/payload-types.ts")
  }
});
export {
  payload_config_default as default
};
