import type { GlobalConfig } from "payload";

const fieldTypes = [
  { label: "Text", value: "text" },
  { label: "Textarea", value: "textarea" },
  { label: "Email", value: "email" },
  { label: "Phone", value: "phone" },
  { label: "Single Select", value: "singleSelect" },
  { label: "Multi Select", value: "multiSelect" },
  { label: "Radio", value: "radio" },
  { label: "Checkbox Group", value: "checkboxGroup" },
  { label: "File Upload", value: "fileUpload" },
];

const visibilityOperators = [
  { label: "Equals", value: "equals" },
  { label: "Not Equals", value: "notEquals" },
  { label: "Includes", value: "includes" },
  { label: "Not Includes", value: "notIncludes" },
  { label: "Is Empty", value: "isEmpty" },
  { label: "Is Not Empty", value: "isNotEmpty" },
];

const fieldWidths = [
  { label: "Full", value: "full" },
  { label: "Half", value: "half" },
  { label: "Third", value: "third" },
];

const visibilityRuleFields = [
  { name: "dependsOnField", type: "text" as const },
  {
    name: "operator",
    type: "select" as const,
    options: visibilityOperators,
  },
  { name: "value", type: "text" as const },
];

export const QuoteForm: GlobalConfig = {
  slug: "quoteForm",
  dbName: "quote_form",
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
          label: "Dialog Content",
          description: "Editor-facing copy used in the quote dialog flow.",
          fields: [
            {
              name: "triggerLabelDefault",
              type: "text",
              label: "Default Trigger Button Label",
            },
            {
              name: "dialogTitle",
              type: "text",
              label: "Dialog Title",
            },
            {
              name: "dialogDescription",
              type: "textarea",
              label: "Dialog Description",
            },
            {
              name: "summaryHeading",
              type: "text",
              label: "Summary Step Heading",
            },
            {
              name: "summaryIntro",
              type: "textarea",
              label: "Summary Step Intro",
            },
            {
              name: "submitButtonLabel",
              type: "text",
              label: "Submit Button Label",
            },
            {
              name: "successMessage",
              type: "textarea",
              label: "Success Message",
            },
          ],
        },
        {
          label: "Notifications",
          description: "Email recipients and subject prefix for form submissions.",
          fields: [
            {
              name: "submissionEmailRecipients",
              type: "array",
              dbName: "email_recipients",
              label: "Submission Email Recipients",
              admin: {
                initCollapsed: true,
              },
              fields: [{ name: "email", type: "text", label: "Recipient Email" }],
            },
            {
              name: "submissionEmailSubjectPrefix",
              type: "text",
              label: "Submission Email Subject Prefix",
            },
          ],
        },
        {
          label: "Steps",
          description: "Multi-step form flow, branching logic, and fields per step.",
          fields: [
            {
              name: "steps",
              type: "array",
              dbName: "steps",
              label: "Form Steps",
              admin: {
                initCollapsed: true,
              },
              fields: [
                { name: "id", type: "text", label: "Step ID" },
                { name: "indexLabel", type: "text", label: "Step Number Label" },
                { name: "navLabel", type: "text", label: "Step Navigation Label" },
                { name: "title", type: "text", label: "Step Title" },
                { name: "description", type: "textarea", label: "Step Description" },
                {
                  name: "visibilityRules",
                  type: "array",
                  dbName: "step_rules",
                  label: "Step Visibility Rules",
                  admin: {
                    initCollapsed: true,
                    description:
                      "Optional branching rules for this entire step. Leave empty to always show the step.",
                  },
                  fields: visibilityRuleFields,
                },
                {
                  name: "fields",
                  type: "array",
                  dbName: "fields",
                  label: "Step Fields",
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    { name: "id", type: "text", label: "Field ID" },
                    { name: "name", type: "text", label: "Field Name" },
                    {
                      name: "type",
                      type: "select",
                      label: "Field Type",
                      options: fieldTypes,
                    },
                    { name: "label", type: "text", label: "Field Label" },
                    { name: "helperText", type: "text", label: "Helper Text" },
                    { name: "placeholder", type: "text", label: "Placeholder" },
                    { name: "required", type: "checkbox", label: "Required" },
                    { name: "defaultValue", type: "text", label: "Default Value" },
                    { name: "includeInSummary", type: "checkbox", label: "Include In Summary" },
                    {
                      name: "width",
                      type: "select",
                      label: "Field Width",
                      options: fieldWidths,
                    },
                    {
                      name: "options",
                      type: "array",
                      dbName: "options",
                      label: "Selectable Options",
                      admin: {
                        initCollapsed: true,
                      },
                      fields: [
                        { name: "label", type: "text", label: "Option Label" },
                        { name: "value", type: "text", label: "Option Value" },
                      ],
                    },
                    {
                      name: "validation",
                      type: "group",
                      label: "Validation Rules",
                      fields: [
                        { name: "minLength", type: "number", label: "Min Length" },
                        { name: "maxLength", type: "number", label: "Max Length" },
                        { name: "minSelections", type: "number", label: "Min Selections" },
                        { name: "maxSelections", type: "number", label: "Max Selections" },
                        { name: "pattern", type: "text", label: "Pattern (Regex)" },
                        {
                          name: "allowedFileMimeTypes",
                          type: "array",
                          dbName: "allowed_mimes",
                          label: "Allowed File MIME Types",
                          admin: {
                            initCollapsed: true,
                          },
                          fields: [{ name: "mimeType", type: "text", label: "MIME Type" }],
                        },
                        { name: "maxFileSizeMb", type: "number", label: "Max File Size (MB)" },
                        { name: "maxFiles", type: "number", label: "Max Files" },
                      ],
                    },
                    {
                      name: "visibilityRules",
                      type: "array",
                      dbName: "visibility_rules",
                      label: "Field Visibility Rules",
                      admin: {
                        initCollapsed: true,
                      },
                      fields: visibilityRuleFields,
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

export default QuoteForm;
