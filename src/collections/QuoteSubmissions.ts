import type { CollectionConfig } from "payload";

const isAdmin = ({ req: { user } }: { req: { user?: { role?: string } | null } }) =>
  user?.role === "admin";

export const QuoteSubmissions: CollectionConfig = {
  slug: "quote-submissions",
  admin: {
    useAsTitle: "submitterEmail",
    group: "Quoting System",
    defaultColumns: ["submitterEmail", "submitterName", "status", "notificationState", "submittedAt"],
    hidden: ({ user }) => user?.role !== "admin",
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "new",
      options: [
        { label: "New", value: "new" },
        { label: "In Review", value: "inReview" },
        { label: "Closed", value: "closed" },
      ],
    },
    {
      name: "sourcePage",
      type: "text",
      required: true,
    },
    {
      name: "submittedAt",
      type: "date",
      required: true,
    },
    {
      name: "submitterName",
      type: "text",
      required: true,
    },
    {
      name: "submitterEmail",
      type: "email",
      required: true,
      index: true,
    },
    {
      name: "submitterCompany",
      type: "text",
    },
    {
      name: "preferredContactMethod",
      type: "text",
    },
    {
      name: "answers",
      type: "json",
      required: true,
    },
    {
      name: "summaryText",
      type: "textarea",
      required: true,
    },
    {
      name: "attachments",
      type: "upload",
      relationTo: "quote-attachments",
      hasMany: true,
    },
    {
      name: "notificationState",
      type: "select",
      required: true,
      defaultValue: "pending",
      options: [
        { label: "Pending", value: "pending" },
        { label: "Sent", value: "sent" },
        { label: "Failed", value: "failed" },
      ],
    },
  ],
};

export default QuoteSubmissions;
