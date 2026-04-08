import type { GlobalConfig } from "payload";

export const ServicesPage: GlobalConfig = {
  slug: "servicesPage",
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
              admin: {
                placeholder: "Services | Hello Monday / Dept.",
              },
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
              required: true,
              label: "Hero Title",
            },
            {
              name: "heroBody",
              type: "textarea",
              required: true,
              label: "Hero Body",
            },
          ],
        },
        {
          label: "Service Sections",
          description: "Three service sections shown on the page with two showcase cards each.",
          fields: [
            {
              name: "serviceSections",
              type: "array",
              label: "Service Sections",
              minRows: 3,
              maxRows: 3,
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "sectionId",
                  type: "text",
                  required: true,
                  label: "Section ID",
                  admin: {
                    description: "Used for anchor links (e.g. 'branding').",
                  },
                },
                {
                  name: "eyebrow",
                  type: "text",
                  required: true,
                  label: "Eyebrow",
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
                  name: "linkLabel",
                  type: "text",
                  required: true,
                  label: "Link Label",
                },
                {
                  name: "illustration",
                  type: "select",
                  label: "Illustration Style",
                  admin: {
                    description: "Selects which illustration style renders for this section.",
                  },
                  options: [
                    { label: "Products", value: "products" },
                    { label: "Experiences", value: "experiences" },
                    { label: "Branding", value: "branding" },
                  ],
                  required: true,
                },
                {
                  name: "cards",
                  type: "array",
                  label: "Showcase Cards",
                  minRows: 2,
                  maxRows: 2,
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: "title",
                      type: "text",
                      required: true,
                      label: "Card Title",
                    },
                    {
                      name: "subtitle",
                      type: "text",
                      required: true,
                      label: "Card Subtitle",
                    },
                    {
                      name: "art",
                      type: "select",
                      label: "Card Artwork",
                      admin: {
                        description:
                          "Decorative art style shown on the card. Does not change card copy.",
                      },
                      options: [
                        { label: "Confetti Watch", value: "confetti-watch" },
                        { label: "YouTube Play", value: "youtube-play" },
                        { label: "Bear Frame", value: "bear-frame" },
                        { label: "VR Fans", value: "vr-fans" },
                        { label: "Split Rings", value: "split-rings" },
                        { label: "Residenta Pack", value: "residenta-pack" },
                      ],
                      required: true,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Shiny Things & Awards",
          fields: [
            {
              name: "shinyThings",
              type: "group",
              label: "Shiny Things Intro",
              fields: [
                {
                  name: "eyebrow",
                  type: "text",
                  required: true,
                  label: "Eyebrow",
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
              ],
            },
            {
              name: "awardColumns",
              type: "array",
              label: "Award Columns",
              minRows: 2,
              maxRows: 2,
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  name: "awards",
                  type: "array",
                  label: "Awards",
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: "label",
                      type: "text",
                      required: true,
                      label: "Award Label",
                    },
                    {
                      name: "value",
                      type: "text",
                      required: true,
                      label: "Award Value",
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

export default ServicesPage;
