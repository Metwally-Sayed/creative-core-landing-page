import { draftMode } from "next/headers";
import { cache } from "react";

import { getPayload } from "payload";
import config from "@payload-config";

export type QuoteFieldType =
  | "text"
  | "textarea"
  | "email"
  | "phone"
  | "singleSelect"
  | "multiSelect"
  | "radio"
  | "checkboxGroup"
  | "fileUpload";

export type VisibilityOperator =
  | "equals"
  | "notEquals"
  | "includes"
  | "notIncludes"
  | "isEmpty"
  | "isNotEmpty";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  minSelections?: number;
  maxSelections?: number;
  pattern?: string;
  allowedFileMimeTypes?: string[];
  maxFileSizeMb?: number;
  maxFiles?: number;
}

export interface VisibilityRule {
  dependsOnField: string;
  operator: VisibilityOperator;
  value: string;
}

export interface QuoteField {
  id: string;
  name: string;
  type: string;
  label: string;
  helperText?: string;
  placeholder?: string;
  required: boolean;
  defaultValue?: string;
  includeInSummary: boolean;
  width: string;
  options: FieldOption[];
  validation: FieldValidation;
  visibilityRules: VisibilityRule[];
}

export interface QuoteStep {
  id: string;
  indexLabel: string;
  navLabel: string;
  title: string;
  description?: string;
  visibilityRules: VisibilityRule[];
  fields: {
    id: string;
    name: string;
    type: string;
    label: string;
    helperText?: string;
    placeholder?: string;
    required: boolean;
    defaultValue?: string;
    includeInSummary: boolean;
    width: string;
    options: { label: string; value: string }[];
    validation: Record<string, unknown>;
    visibilityRules: { dependsOnField: string; operator: string; value: string }[];
  }[];
}

export interface QuoteFormData {
  triggerLabelDefault: string;
  dialogTitle: string;
  dialogDescription: string;
  summaryHeading: string;
  summaryIntro: string;
  submitButtonLabel: string;
  successMessage: string;
  submissionEmailRecipients: string[];
  submissionEmailSubjectPrefix: string;
  steps: {
    id: string;
    indexLabel: string;
    navLabel: string;
    title: string;
    description?: string;
    visibilityRules: VisibilityRule[];
    fields: {
      id: string;
      name: string;
      type: string;
      label: string;
      helperText?: string;
      placeholder?: string;
      required: boolean;
      defaultValue?: string;
      includeInSummary: boolean;
      width: string;
      options: { label: string; value: string }[];
      validation: Record<string, unknown>;
      visibilityRules: { dependsOnField: string; operator: string; value: string }[];
    }[];
  }[];
}

function cleanText(value: string | undefined): string {
  return value?.trim() ?? "";
}

const getPayloadClient = cache(async () => getPayload({ config }));

export const getQuoteFormData = cache(async (): Promise<QuoteFormData> => {
  const { isEnabled: preview } = await draftMode();
  const payload = await getPayloadClient();

  try {
    const result = await payload.findGlobal({
      slug: "quoteForm",
      depth: 1,
      draft: preview,
    });

    if (!result) {
      return getDefaultQuoteFormData();
    }

    const doc = result as unknown as {
      triggerLabelDefault?: string;
      dialogTitle?: string;
      dialogDescription?: string;
      summaryHeading?: string;
      summaryIntro?: string;
      submitButtonLabel?: string;
      successMessage?: string;
      submissionEmailRecipients?: { email?: string }[];
      submissionEmailSubjectPrefix?: string;
      steps?: {
        id?: string;
        indexLabel?: string;
        navLabel?: string;
        title?: string;
        description?: string;
        visibilityRules?: {
          dependsOnField?: string;
          operator?: string;
          value?: string;
        }[];
        fields?: {
          id?: string;
          name?: string;
          type?: string;
          label?: string;
          helperText?: string;
          placeholder?: string;
          required?: boolean;
          defaultValue?: string;
          includeInSummary?: boolean;
          width?: string;
          options?: { label?: string; value?: string }[];
          validation?: {
            minLength?: number;
            maxLength?: number;
            minSelections?: number;
            maxSelections?: number;
            pattern?: string;
            allowedFileMimeTypes?: { mimeType?: string }[];
            maxFileSizeMb?: number;
            maxFiles?: number;
          };
          visibilityRules?: {
            dependsOnField?: string;
            operator?: string;
            value?: string;
          }[];
        }[];
      }[];
    };

    return {
      triggerLabelDefault: cleanText(doc.triggerLabelDefault) || "Get Quote",
      dialogTitle: cleanText(doc.dialogTitle) || "Get a Quote",
      dialogDescription:
        cleanText(doc.dialogDescription) ||
        "Shape a project brief in four short steps.",
      summaryHeading: cleanText(doc.summaryHeading) || "Quote Snapshot",
      summaryIntro: cleanText(doc.summaryIntro) || "Review your brief before submitting",
      submitButtonLabel: cleanText(doc.submitButtonLabel) || "Submit Brief",
      successMessage: cleanText(doc.successMessage) || "Quote request submitted successfully!",
      submissionEmailRecipients: (doc.submissionEmailRecipients ?? [])
        .map((r) => cleanText(r.email))
        .filter(Boolean),
      submissionEmailSubjectPrefix:
        cleanText(doc.submissionEmailSubjectPrefix) || "Quote Request",
      steps: (doc.steps ?? []).map((step) => ({
        id: cleanText(step.id),
        indexLabel: cleanText(step.indexLabel),
        navLabel: cleanText(step.navLabel),
        title: cleanText(step.title),
        description: cleanText(step.description),
        visibilityRules: (step.visibilityRules ?? []).map((rule) => ({
          dependsOnField: cleanText(rule.dependsOnField),
          operator: (rule.operator as VisibilityOperator) || "equals",
          value: cleanText(rule.value),
        })),
        fields: (step.fields ?? []).map((field) => ({
          id: cleanText(field.id),
          name: cleanText(field.name),
          type: (field.type as QuoteFieldType) || "text",
          label: cleanText(field.label),
          helperText: cleanText(field.helperText),
          placeholder: cleanText(field.placeholder),
          required: field.required ?? false,
          defaultValue: cleanText(field.defaultValue),
          includeInSummary: field.includeInSummary ?? false,
          width: (field.width as QuoteField["width"]) || "full",
          options: (field.options ?? []).map((opt) => ({
            label: cleanText(opt.label),
            value: cleanText(opt.value),
          })),
          validation: {
            minLength: field.validation?.minLength,
            maxLength: field.validation?.maxLength,
            minSelections: field.validation?.minSelections,
            maxSelections: field.validation?.maxSelections,
            pattern: cleanText(field.validation?.pattern),
            allowedFileMimeTypes: (field.validation?.allowedFileMimeTypes ?? []).map(
              (m) => m.mimeType
            ),
            maxFileSizeMb: field.validation?.maxFileSizeMb,
            maxFiles: field.validation?.maxFiles,
          },
          visibilityRules: (field.visibilityRules ?? []).map((rule) => ({
            dependsOnField: cleanText(rule.dependsOnField),
            operator: (rule.operator as VisibilityOperator) || "equals",
            value: cleanText(rule.value),
          })),
        })),
      })),
    };
  } catch {
    return getDefaultQuoteFormData();
  }
});

function getDefaultQuoteFormData(): QuoteFormData {
  return {
    triggerLabelDefault: "Get Quote",
    dialogTitle: "Project Brief",
    dialogDescription: "Share your project details and we will follow up.",
    summaryHeading: "Submission Summary",
    summaryIntro: "Review your details before sending.",
    submitButtonLabel: "Submit",
    successMessage: "Your request has been submitted.",
    submissionEmailRecipients: ["newbusiness@hellomonday.com"],
    submissionEmailSubjectPrefix: "Quote Request",
    steps: [
      {
        id: "contact",
        indexLabel: "01",
        navLabel: "Contact",
        title: "Contact Details",
        description: "How should we reach you?",
        visibilityRules: [],
        fields: [
          {
            id: "name",
            name: "name",
            type: "text",
            label: "Name",
            placeholder: "Your name",
            required: false,
            includeInSummary: true,
            width: "half",
            options: [],
            validation: {},
            visibilityRules: [],
          },
          {
            id: "email",
            name: "email",
            type: "email",
            label: "Email",
            placeholder: "you@company.com",
            required: true,
            includeInSummary: true,
            width: "half",
            options: [],
            validation: {},
            visibilityRules: [],
          },
          {
            id: "brief",
            name: "brief",
            type: "textarea",
            label: "Project Brief",
            placeholder: "What are you trying to build?",
            required: true,
            includeInSummary: false,
            width: "full",
            options: [],
            validation: {},
            visibilityRules: [],
          },
        ],
      },
    ],
  };
}
