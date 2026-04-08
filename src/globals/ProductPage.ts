import type { GlobalConfig } from "payload";

export const ProductPage: GlobalConfig = {
  slug: "productPage",
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
              name: "heroVideoUrl",
              type: "text",
              required: true,
              label: "Hero Video URL",
              admin: {
                placeholder: "https://videos.ctfassets.net/...",
                description: "Direct video URL for the hero background media.",
              },
            },
            {
              name: "heroTitleLines",
              type: "array",
              label: "Hero Title Lines",
              minRows: 1,
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "line",
                  type: "text",
                  required: true,
                  label: "Title Line",
                },
              ],
            },
          ],
        },
        {
          label: "Intro",
          fields: [
            {
              name: "introEyebrow",
              type: "text",
              required: true,
              label: "Intro Eyebrow",
            },
            {
              name: "introParagraphs",
              type: "array",
              label: "Intro Paragraphs",
              minRows: 1,
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
          ],
        },
        {
          label: "Collaborations & Quotes",
          fields: [
            {
              name: "collaborations",
              type: "array",
              label: "Collaborations",
              admin: {
                initCollapsed: true,
                description: "Ordered collaboration rows shown in the showcase section.",
              },
              fields: [
                {
                  name: "name",
                  type: "text",
                  required: true,
                  label: "Name",
                },
                {
                  name: "projectCount",
                  type: "text",
                  required: true,
                  label: "Project Count Label",
                },
                {
                  name: "tag",
                  type: "text",
                  required: true,
                  label: "Tag",
                },
                {
                  name: "summary",
                  type: "textarea",
                  required: true,
                  label: "Summary",
                },
                {
                  name: "videoUrl",
                  type: "text",
                  required: true,
                  label: "Preview Video URL",
                },
              ],
            },
            {
              name: "testimonials",
              type: "array",
              label: "Testimonials",
              admin: {
                initCollapsed: true,
                description: "Rotating quotes shown in the testimonial strip. Order controls rotation.",
              },
              fields: [
                {
                  name: "body",
                  type: "textarea",
                  required: true,
                  label: "Quote Body",
                },
                {
                  name: "author",
                  type: "text",
                  required: true,
                  label: "Author",
                },
                {
                  name: "role",
                  type: "text",
                  required: true,
                  label: "Role / Title",
                },
              ],
            },
          ],
        },
        {
          label: "Contact",
          fields: [
            {
              name: "contact",
              type: "group",
              label: "Contact Section",
              fields: [
                {
                  name: "heading",
                  type: "text",
                  required: true,
                  label: "Heading",
                },
                {
                  name: "body",
                  type: "textarea",
                  required: true,
                  label: "Body",
                },
                {
                  name: "email",
                  type: "text",
                  required: true,
                  label: "Main Email",
                },
                {
                  name: "briefLabel",
                  type: "text",
                  required: true,
                  label: "Brief CTA Label",
                },
                {
                  name: "photo",
                  type: "upload",
                  relationTo: "media",
                  label: "Contact Photo",
                },
                {
                  name: "name",
                  type: "text",
                  required: true,
                  label: "Contact Name",
                },
                {
                  name: "title",
                  type: "text",
                  required: true,
                  label: "Contact Title",
                },
                {
                  name: "directEmail",
                  type: "text",
                  required: true,
                  label: "Direct Email",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

export default ProductPage;
