import type { GlobalConfig } from "payload";

export const AboutPage: GlobalConfig = {
  slug: "aboutPage",
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
          label: "Hero & Jump Links",
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
