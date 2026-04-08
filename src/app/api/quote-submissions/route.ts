import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

interface SubmissionPayload {
  answers: Record<string, unknown>;
  summaryText: string;
  sourcePage: string;
  submitterName: string;
  submitterEmail: string;
  submitterCompany: string;
  preferredContactMethod: string;
}

interface ValidationError {
  id: string;
  message: string;
}

type VisibilityRule = {
  dependsOnField?: string;
  operator?: string;
  value?: string;
};

type QuoteField = {
  id?: string;
  name?: string;
  type?: string;
  label?: string;
  includeInSummary?: boolean;
  required?: boolean;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    minSelections?: number;
    maxSelections?: number;
    maxFiles?: number;
    maxFileSizeMb?: number;
    allowedFileMimeTypes?: Array<string | { mimeType?: string | null }>;
  };
  visibilityRules?: VisibilityRule[];
};

type QuoteStep = {
  id?: string;
  fields?: QuoteField[];
  visibilityRules?: VisibilityRule[];
};

type QuoteFormDoc = {
  steps?: QuoteStep[];
  submissionEmailRecipients?: { email?: string | null }[];
  submissionEmailSubjectPrefix?: string | null;
};

const SUPPORTED_FIELD_TYPES = new Set([
  "text",
  "textarea",
  "email",
  "phone",
  "singleSelect",
  "multiSelect",
  "radio",
  "checkboxGroup",
  "fileUpload",
]);

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseUploadedFiles(formData: FormData): Record<string, File[]> {
  const filesByField: Record<string, File[]> = {};

  for (const [key, value] of formData.entries()) {
    if (!(value instanceof File) || value.size <= 0) {
      continue;
    }

    if (key.startsWith("file:")) {
      const fieldName = key.slice(5);
      if (!fieldName) {
        continue;
      }

      filesByField[fieldName] = [...(filesByField[fieldName] ?? []), value];
      continue;
    }

    // Backward compatibility with old client payloads.
    if (key === "files") {
      filesByField.__legacy__ = [...(filesByField.__legacy__ ?? []), value];
    }
  }

  return filesByField;
}

function getAllowedFileUploadFieldKeys(
  quoteForm: QuoteFormDoc,
  answers: Record<string, unknown>,
) {
  const allowedFieldKeys = new Set<string>();

  for (const step of quoteForm.steps ?? []) {
    if (!isStepVisible(step, answers)) {
      continue;
    }

    for (const field of step.fields ?? []) {
      if (field.type !== "fileUpload" || !isFieldVisible(field, answers)) {
        continue;
      }

      const fieldName = String(field.name ?? "").trim();
      const fieldId = String(field.id ?? "").trim();

      if (fieldName) {
        allowedFieldKeys.add(fieldName);
      }

      if (fieldId) {
        allowedFieldKeys.add(fieldId);
      }
    }
  }

  return allowedFieldKeys;
}

function sanitizeUploadedFiles(
  filesByField: Record<string, File[]>,
  allowedFieldKeys: Set<string>,
) {
  const filteredFilesByField: Record<string, File[]> = {};

  for (const [fieldKey, files] of Object.entries(filesByField)) {
    if (allowedFieldKeys.has(fieldKey)) {
      filteredFilesByField[fieldKey] = files;
    }
  }

  return filteredFilesByField;
}

function isBlank(value: unknown) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return !String(value ?? "").trim();
}

function matchesVisibilityRule(value: unknown, rule: VisibilityRule) {
  const operator = rule.operator ?? "equals";
  const expected = String(rule.value ?? "").trim();

  if (operator === "isEmpty") {
    return isBlank(value);
  }

  if (operator === "isNotEmpty") {
    return !isBlank(value);
  }

  if (Array.isArray(value)) {
    const values = value.map((item) => String(item).trim());

    if (operator === "includes") {
      return values.includes(expected);
    }

    if (operator === "notIncludes") {
      return !values.includes(expected);
    }

    return false;
  }

  const current = String(value ?? "").trim();

  if (operator === "equals") {
    return current === expected;
  }

  if (operator === "notEquals") {
    return current !== expected;
  }

  if (operator === "includes") {
    return current.includes(expected);
  }

  if (operator === "notIncludes") {
    return !current.includes(expected);
  }

  return true;
}

function isStepVisible(step: QuoteStep, answers: Record<string, unknown>) {
  const rules = step.visibilityRules ?? [];
  if (rules.length === 0) {
    return true;
  }

  return rules.every((rule) =>
    matchesVisibilityRule(answers[rule.dependsOnField ?? ""], rule),
  );
}

function isFieldVisible(field: QuoteField, answers: Record<string, unknown>) {
  const rules = field.visibilityRules ?? [];
  if (rules.length === 0) {
    return true;
  }

  return rules.every((rule) =>
    matchesVisibilityRule(answers[rule.dependsOnField ?? ""], rule),
  );
}

function getFieldFiles(field: QuoteField, filesByField: Record<string, File[]>) {
  const byName = field.name ? filesByField[field.name] : undefined;
  const byId = field.id ? filesByField[field.id] : undefined;
  return byName ?? byId ?? filesByField.__legacy__ ?? [];
}

function mapAllowedMimeTypes(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (typeof item === "string") {
        return item.trim();
      }

      if (item && typeof item === "object" && "mimeType" in item) {
        return String((item as { mimeType?: string }).mimeType ?? "").trim();
      }

      return "";
    })
    .filter(Boolean);
}

function validateSubmission(
  quoteForm: QuoteFormDoc,
  answers: Record<string, unknown>,
  filesByField: Record<string, File[]>,
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const step of quoteForm.steps || []) {
    if (!isStepVisible(step, answers)) {
      continue;
    }

    for (const field of step.fields || []) {
      if (!isFieldVisible(field, answers)) {
        continue;
      }

      const fieldName = field.name || field.id || "field";
      const fieldId = field.id || fieldName;
      const value = answers[fieldName] ?? answers[field.id ?? ""];
      const val = field.validation || {};
      const fieldFiles = field.type === "fileUpload" ? getFieldFiles(field, filesByField) : [];
      const fieldType = field.type ?? "text";

      if (!SUPPORTED_FIELD_TYPES.has(fieldType)) {
        errors.push({
          id: fieldId,
          message: `Unsupported field type in schema: ${fieldType}`,
        });
        continue;
      }

      // 1. Required Check
      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        if (field.type !== "fileUpload") {
          errors.push({ id: fieldId, message: `${field.label || fieldName} is required` });
          continue;
        }
      }

      // 2. Type-specific validation
      if (value) {
        if (field.type === "text" || field.type === "textarea" || field.type === "email" || field.type === "phone") {
          const strValue = String(value);
          if (val.minLength && strValue.length < val.minLength) {
            errors.push({ id: fieldId, message: `Minimum length is ${val.minLength} characters` });
          }
          if (val.maxLength && strValue.length > val.maxLength) {
            errors.push({ id: fieldId, message: `Maximum length is ${val.maxLength} characters` });
          }
          if (val.pattern) {
            try {
              const regex = new RegExp(val.pattern);
              if (!regex.test(strValue)) {
                errors.push({ id: fieldId, message: "Invalid format" });
              }
            } catch {
              console.error(`Invalid regex pattern in CMS for field ${fieldId}:`, val.pattern);
            }
          }
        }

        if (field.type === "multiSelect" || field.type === "checkboxGroup") {
          const arrValue = Array.isArray(value) ? value : [value];
          if (val.minSelections && arrValue.length < val.minSelections) {
            errors.push({ id: fieldId, message: `Please select at least ${val.minSelections} options` });
          }
          if (val.maxSelections && arrValue.length > val.maxSelections) {
            errors.push({ id: fieldId, message: `Please select no more than ${val.maxSelections} options` });
          }
        }
      }

      // 3. File Upload Checks
      if (field.type === "fileUpload") {
        if (field.required && fieldFiles.length === 0) {
          errors.push({ id: fieldId, message: `${field.label || fieldName} is required` });
        }
        if (fieldFiles.length > 0) {
          if (val.maxFiles && fieldFiles.length > val.maxFiles) {
            errors.push({ id: fieldId, message: `Maximum ${val.maxFiles} files allowed` });
          }

          const allowedMimes = mapAllowedMimeTypes(val.allowedFileMimeTypes);

          for (const file of fieldFiles) {
            if (val.maxFileSizeMb && file.size > val.maxFileSizeMb * 1024 * 1024) {
              errors.push({
                id: fieldId,
                message: `File ${file.name} exceeds ${val.maxFileSizeMb}MB limit`,
              });
            }
            if (allowedMimes.length > 0 && !allowedMimes.includes(file.type)) {
              errors.push({ id: fieldId, message: `File type ${file.type} is not allowed` });
            }
          }
        }
      }
    }
  }

  return errors;
}

function formatSummaryValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }

  return String(value ?? "").trim();
}

function buildSummaryText(quoteForm: QuoteFormDoc, answers: Record<string, unknown>) {
  const lines: string[] = [];

  for (const step of quoteForm.steps ?? []) {
    if (!isStepVisible(step, answers)) {
      continue;
    }

    for (const field of step.fields ?? []) {
      if (!field.includeInSummary || !isFieldVisible(field, answers)) {
        continue;
      }

      const fieldName = field.name || field.id || "";
      if (!fieldName) {
        continue;
      }

      const value = answers[fieldName] ?? answers[field.id ?? ""];
      const formatted = formatSummaryValue(value);

      if (!formatted) {
        continue;
      }

      lines.push(`${field.label || fieldName}: ${formatted}`);
    }
  }

  return lines.join("\n");
}

function pickVisibleAnswers(quoteForm: QuoteFormDoc, answers: Record<string, unknown>) {
  const visibleAnswers: Record<string, unknown> = {};

  for (const step of quoteForm.steps ?? []) {
    if (!isStepVisible(step, answers)) {
      continue;
    }

    for (const field of step.fields ?? []) {
      if (!isFieldVisible(field, answers)) {
        continue;
      }

      const key = field.name || field.id || "";
      if (!key) {
        continue;
      }

      const value = answers[key] ?? answers[field.id ?? ""];
      if (typeof value === "undefined") {
        continue;
      }

      visibleAnswers[key] = value;
    }
  }

  return visibleAnswers;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config });
    const formData = await req.formData();

    const rawAnswers = asString(formData.get("answers"));
    let parsedAnswers: Record<string, unknown> = {};

    if (rawAnswers) {
      try {
        parsedAnswers = JSON.parse(rawAnswers) as Record<string, unknown>;
      } catch {
        return NextResponse.json(
          { error: "Invalid answers payload" },
          { status: 400 }
        );
      }
    }

    const body: SubmissionPayload = {
      answers: parsedAnswers,
      summaryText: asString(formData.get("summaryText")),
      sourcePage: asString(formData.get("sourcePage")),
      submitterName: asString(formData.get("submitterName")),
      submitterEmail: asString(formData.get("submitterEmail")),
      submitterCompany: asString(formData.get("submitterCompany")),
      preferredContactMethod: asString(formData.get("preferredContactMethod")),
    };

    const {
      answers,
      summaryText,
      sourcePage,
      submitterName,
      submitterEmail,
      submitterCompany,
      preferredContactMethod,
    } = body;

    if (!submitterEmail) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const quoteForm = (await payload.findGlobal({
      slug: "quoteForm",
      depth: 0,
      draft: false,
    })) as QuoteFormDoc;
    const uploadedFilesByField = parseUploadedFiles(formData);
    const allowedFileUploadFieldKeys = getAllowedFileUploadFieldKeys(quoteForm, answers);
    const filesByField = sanitizeUploadedFiles(
      uploadedFilesByField,
      allowedFileUploadFieldKeys,
    );

    // Server-Side Validation
    const validationErrors = validateSubmission(quoteForm, answers, filesByField);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          errors: validationErrors 
        },
        { status: 400 }
      );
    }

    const recipients =
      (quoteForm.submissionEmailRecipients ?? [])
        .map((recipient: { email?: string | null }) =>
          typeof recipient?.email === "string" ? recipient.email.trim() : ""
        )
        .filter(Boolean) || [];

    const recipientList =
      recipients.length > 0 ? recipients : ["newbusiness@hellomonday.com"];
    const subjectPrefix =
      typeof quoteForm.submissionEmailSubjectPrefix === "string" &&
      quoteForm.submissionEmailSubjectPrefix.trim()
        ? quoteForm.submissionEmailSubjectPrefix.trim()
        : "Quote Request";
    const attachments: Array<number | string> = [];
    const uploadedAttachmentRefs: string[] = [];

    for (const [fieldName, files] of Object.entries(filesByField)) {
      for (const file of files) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const attachment = await payload.create({
          collection: "quote-attachments",
          overrideAccess: true,
          data: {
            alt: file.name,
            fieldName,
          },
          file: {
            data: buffer,
            mimetype: file.type,
            name: file.name,
            size: file.size,
          },
        });

        if (typeof attachment.id === "number" || typeof attachment.id === "string") {
          attachments.push(attachment.id);
          uploadedAttachmentRefs.push(
            `- ${file.name} (${fieldName}) -> attachment:${String(attachment.id)}`,
          );
        }
      }
    }

    const visibleAnswers = pickVisibleAnswers(quoteForm, answers);
    const normalizedSummary =
      buildSummaryText(quoteForm, visibleAnswers) ||
      summaryText ||
      JSON.stringify(visibleAnswers, null, 2);

    const submission = await payload.create({
      collection: "quote-submissions",
      overrideAccess: true,
      data: {
        status: "new",
        sourcePage: sourcePage || "/",
        submittedAt: new Date().toISOString(),
        submitterName: submitterName || "Website Lead",
        submitterEmail,
        submitterCompany: submitterCompany || "",
        preferredContactMethod:
          preferredContactMethod || String(answers.contactMethod ?? "").trim(),
        answers: visibleAnswers,
        summaryText: normalizedSummary,
        attachments,
        notificationState: "pending",
      },
    });

    if (attachments.length > 0) {
      for (const attachmentId of attachments) {
        await payload.update({
          collection: "quote-attachments",
          id: attachmentId,
          overrideAccess: true,
          data: {
            submission: submission.id,
          },
        });
      }
    }

    const attachmentSummary =
      uploadedAttachmentRefs.length > 0
        ? `\n\nAttachments:\n${uploadedAttachmentRefs.join("\n")}`
        : "";

    try {
      await payload.sendEmail({
        to: recipientList,
        subject: `${subjectPrefix}${
          submitterCompany ? ` - ${submitterCompany}` : submitterName ? ` - ${submitterName}` : ""
        }`,
        replyTo: submitterEmail,
        text: `Submission ID: ${String(submission.id)}\nSource: ${sourcePage || "/"}\nPreferred Contact: ${preferredContactMethod || "N/A"}\n\n${normalizedSummary}${attachmentSummary}`,
      });

      await payload.update({
        collection: "quote-submissions",
        id: submission.id,
        overrideAccess: true,
        data: {
          notificationState: "sent",
        },
      });
    } catch (emailError) {
      console.error("Quote notification error:", emailError);

      await payload.update({
        collection: "quote-submissions",
        id: submission.id,
        overrideAccess: true,
        data: {
          notificationState: "failed",
        },
      });
    }

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
    });
  } catch (error) {
    console.error("Quote submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit quote request" },
      { status: 500 }
    );
  }
}
