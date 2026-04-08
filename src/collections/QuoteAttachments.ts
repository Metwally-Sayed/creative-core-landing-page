import type { CollectionConfig } from "payload";

const isAdmin = ({ req: { user } }: { req: { user?: { role?: string } | null } }) =>
  user?.role === "admin";

export const QuoteAttachments: CollectionConfig = {
  slug: "quote-attachments",
  admin: {
    useAsTitle: "filename",
    group: "Quoting System",
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  upload: {
    staticDir: "public/uploads/quotes",
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
    {
      name: "fieldName",
      type: "text",
    },
    {
      name: "submission",
      type: "relationship",
      relationTo: "quote-submissions",
    },
  ],
};

export default QuoteAttachments;
