import type { GlobalConfig } from "payload";

export const SiteSettings: GlobalConfig = {
  slug: "siteSettings",
  admin: {
    group: "Globals",
    livePreview: {
      url: () => {
        const secret = process.env.PREVIEW_SECRET || "hello-monday-payload-dev-secret";
        return `${process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"}/api/preview?secret=${secret}&slug=/`;
      },
    },
  },
  versions: {
    drafts: true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: "Brand & Header",
          description:
            "Header identity assets, navigation links, and quote CTA controls.",
          fields: [
            {
              name: "logoWordmarkPrimary",
              type: "upload",
              relationTo: "media",
              label: "Primary Logo Wordmark",
            },
            {
              name: "logoWordmarkSecondary",
              type: "upload",
              relationTo: "media",
              label: "Secondary Logo Wordmark",
            },
            {
              name: "navItems",
              type: "array",
              label: "Navigation Items",
              labels: {
                singular: "Navigation Item",
                plural: "Navigation Items",
              },
              admin: {
                description: "Main links shown in the menu.",
                initCollapsed: true,
              },
              fields: [
                { name: "label", type: "text", label: "Link Label" },
                { name: "href", type: "text", label: "Link URL / Path" },
                { name: "openInNewTab", type: "checkbox", label: "Open In New Tab" },
              ],
            },
            {
              name: "quoteTriggerLabel",
              type: "text",
              label: "Quote Trigger Label",
            },
            {
              name: "mobileMenuLabel",
              type: "text",
              label: "Mobile Menu Label",
            },
            {
              name: "storiesHref",
              type: "text",
              label: "Stories Link URL",
            },
            {
              name: "showQuoteCtaRules",
              type: "group",
              label: "Quote CTA Visibility Rules",
              admin: {
                description:
                  "Choose on which page types the quote CTA button should be hidden.",
              },
              fields: [
                { name: "hideOnWork", type: "checkbox", label: "Hide On Work Page" },
                { name: "hideOnServices", type: "checkbox", label: "Hide On Services Page" },
                { name: "hideOnAbout", type: "checkbox", label: "Hide On About Page" },
                { name: "hideOnProduct", type: "checkbox", label: "Hide On Product Page" },
                { name: "hideOnProjects", type: "checkbox", label: "Hide On Project Detail Pages" },
              ],
            },
          ],
        },
        {
          label: "Footer Content",
          description: "Contact blocks, office locations, and social links shown in the footer.",
          fields: [
            {
              name: "contactCards",
              type: "array",
              label: "Contact Cards",
              labels: {
                singular: "Contact Card",
                plural: "Contact Cards",
              },
              admin: {
                initCollapsed: true,
              },
              fields: [
                { name: "label", type: "text", label: "Section Label" },
                { name: "sublabel", type: "text", label: "Sub Label" },
                { name: "value", type: "text", label: "Displayed Value" },
                { name: "href", type: "text", label: "Link (mailto:, tel:, or URL)" },
                { name: "copyToClipboard", type: "checkbox", label: "Copy Value On Click" },
              ],
            },
            {
              name: "locations",
              type: "array",
              label: "Locations",
              labels: {
                singular: "Location",
                plural: "Locations",
              },
              admin: {
                initCollapsed: true,
              },
              fields: [
                { name: "city", type: "text", label: "City" },
                {
                  name: "addressLines",
                  type: "array",
                  label: "Address Lines",
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [{ name: "line", type: "text", label: "Address Line" }],
                },
                { name: "href", type: "text", label: "Map URL" },
              ],
            },
            {
              name: "socialLinks",
              type: "array",
              label: "Social Links",
              labels: {
                singular: "Social Link",
                plural: "Social Links",
              },
              admin: {
                initCollapsed: true,
              },
              fields: [
                { name: "label", type: "text", label: "Platform Label" },
                { name: "href", type: "text", label: "Profile URL" },
              ],
            },
          ],
        },
        {
          label: "Utility & Legal",
          description: "Small utility labels and legal links used in footer controls.",
          fields: [
            {
              name: "privacyLabel",
              type: "text",
              label: "Privacy Link Label",
            },
            {
              name: "privacyHref",
              type: "text",
              label: "Privacy Link URL",
            },
            {
              name: "backToTopLabel",
              type: "text",
              label: "Back To Top Label",
            },
          ],
        },
      ],
    },
  ],
};

export default SiteSettings;
