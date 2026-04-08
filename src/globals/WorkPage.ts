import type { GlobalConfig } from "payload";

export const WorkPage: GlobalConfig = {
  slug: "workPage",
  admin: {
    group: "Pages",
  },
  versions: {
    drafts: true,
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
              name: "heroTitle",
              type: "text",
              label: "Hero Title",
            },
            {
              name: "heroBody",
              type: "textarea",
              label: "Hero Body",
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
