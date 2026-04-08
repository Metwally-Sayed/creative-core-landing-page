import type { CollectionConfig } from "payload";

const isAuthenticated = ({ req: { user } }: { req: { user?: unknown | null } }) =>
  Boolean(user);

export const Media: CollectionConfig = {
  slug: "media",
  admin: {
    useAsTitle: "alt",
  },
  access: {
    read: () => true,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  upload: true,
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
    {
      name: "caption",
      type: "textarea",
    },
  ],
};

export default Media;
