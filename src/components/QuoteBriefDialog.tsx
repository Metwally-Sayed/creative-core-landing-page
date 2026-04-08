"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ButtonHTMLAttributes } from "react";

import { useQuoteForm } from "@/components/providers/QuoteFormProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  QuoteField,
  QuoteFieldType,
  QuoteFormData,
  QuoteStep,
  VisibilityRule,
} from "@/lib/cms-quote-form";
import { cn } from "@/lib/utils";

type FieldValue = string | string[] | File[];
type FormState = Record<string, FieldValue>;
type FieldErrors = Record<string, string>;

const TRANSITION_EASE = [0.22, 1, 0.36, 1] as const;

function toggleArrayValue(items: string[], value: string) {
  if (items.includes(value)) {
    return items.filter((item) => item !== value);
  }

  return [...items, value];
}

function isBlank(value: FieldValue | undefined) {
  if (Array.isArray(value)) {
    return value.length === 0;
  }

  return !String(value ?? "").trim();
}

function formatFieldValue(value: FieldValue | undefined) {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "Not provided";
    }

    if (value[0] instanceof File) {
      return (value as File[]).map((file) => file.name).join(", ");
    }

    return (value as string[]).join(", ");
  }

  return String(value ?? "").trim() || "Not provided";
}

function buildInitialState(form: QuoteFormData): FormState {
  const initialState: FormState = {};

  for (const step of form.steps) {
    for (const field of step.fields) {
      if (field.type === "multiSelect" || field.type === "checkboxGroup") {
        initialState[field.name] = field.defaultValue
          ? field.defaultValue
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : [];
        continue;
      }

      if (field.type === "fileUpload") {
        initialState[field.name] = [];
        continue;
      }

      initialState[field.name] = field.defaultValue ?? "";
    }
  }

  return initialState;
}

function matchesVisibilityRule(value: FieldValue | undefined, rule: VisibilityRule) {
  if (rule.operator === "isEmpty") {
    return isBlank(value);
  }

  if (rule.operator === "isNotEmpty") {
    return !isBlank(value);
  }

  if (Array.isArray(value)) {
    const stringValues = value
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim());

    if (rule.operator === "includes") {
      return stringValues.includes(rule.value);
    }

    if (rule.operator === "notIncludes") {
      return !stringValues.includes(rule.value);
    }

    return false;
  }

  const stringValue = String(value ?? "").trim();

  if (rule.operator === "equals") {
    return stringValue === rule.value;
  }

  if (rule.operator === "notEquals") {
    return stringValue !== rule.value;
  }

  if (rule.operator === "includes") {
    return stringValue.includes(rule.value);
  }

  if (rule.operator === "notIncludes") {
    return !stringValue.includes(rule.value);
  }

  return true;
}

function isFieldVisible(field: QuoteField, state: FormState) {
  if (!field.visibilityRules || field.visibilityRules.length === 0) {
    return true;
  }

  return field.visibilityRules.every((rule) =>
    matchesVisibilityRule(state[rule.dependsOnField], rule),
  );
}

function isStepVisible(step: QuoteStep, state: FormState) {
  if (!step.visibilityRules || step.visibilityRules.length === 0) {
    return true;
  }

  return step.visibilityRules.every((rule) =>
    matchesVisibilityRule(state[rule.dependsOnField], rule),
  );
}

function validateField(field: QuoteField, value: FieldValue | undefined) {
  if (field.required && isBlank(value)) {
    return `${field.label} is required.`;
  }

  if (Array.isArray(value)) {
    if (field.type === "fileUpload") {
      const files = value as File[];

      if (
        typeof field.validation.maxFiles === "number" &&
        field.validation.maxFiles > 0 &&
        files.length > field.validation.maxFiles
      ) {
        return `${field.label} allows up to ${field.validation.maxFiles} files.`;
      }

      if (
        typeof field.validation.maxFileSizeMb === "number" &&
        field.validation.maxFileSizeMb > 0 &&
        files.some((file) => file.size > field.validation.maxFileSizeMb! * 1024 * 1024)
      ) {
        return `${field.label} files must stay under ${field.validation.maxFileSizeMb}MB.`;
      }

      if (
        field.validation.allowedFileMimeTypes &&
        field.validation.allowedFileMimeTypes.length > 0 &&
        files.some((file) => !field.validation.allowedFileMimeTypes?.includes(file.type))
      ) {
        return `${field.label} accepts only approved file types.`;
      }

      return null;
    }

    const values = value as string[];

    if (
      typeof field.validation.minSelections === "number" &&
      values.length < field.validation.minSelections
    ) {
      return `${field.label} requires at least ${field.validation.minSelections} selections.`;
    }

    if (
      typeof field.validation.maxSelections === "number" &&
      values.length > field.validation.maxSelections
    ) {
      return `${field.label} allows up to ${field.validation.maxSelections} selections.`;
    }

    return null;
  }

  const stringValue = String(value ?? "").trim();

  if (
    typeof field.validation.minLength === "number" &&
    stringValue.length < field.validation.minLength &&
    stringValue.length > 0
  ) {
    return `${field.label} must be at least ${field.validation.minLength} characters.`;
  }

  if (
    typeof field.validation.maxLength === "number" &&
    stringValue.length > field.validation.maxLength
  ) {
    return `${field.label} must stay under ${field.validation.maxLength} characters.`;
  }

  if (field.type === "email" && stringValue) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(stringValue)) {
      return "Enter a valid email address.";
    }
  }

  if (field.validation.pattern && stringValue) {
    try {
      const pattern = new RegExp(field.validation.pattern);

      if (!pattern.test(stringValue)) {
        return `${field.label} has an invalid format.`;
      }
    } catch {
      return null;
    }
  }

  return null;
}

function fieldWidthClass(width: QuoteField["width"]) {
  if (width === "half") {
    return "md:col-span-1 xl:col-span-1";
  }

  if (width === "third") {
    return "md:col-span-1 xl:col-span-1";
  }

  return "md:col-span-2 xl:col-span-3";
}

function StepChip({
  active = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={cn(
        "min-h-10 rounded-full border px-3 text-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-transparent bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-soft)]"
          : "border-[hsl(var(--border))]/60 bg-white/78 text-[hsl(var(--foreground))]/85 hover:bg-white",
        className,
      )}
      {...props}
    />
  );
}

function SummaryCard({
  copied,
  onCopy,
  summaryHeading,
  summaryIntro,
  summaryItems,
}: {
  copied: boolean;
  onCopy: () => void;
  summaryHeading: string;
  summaryIntro: string;
  summaryItems: Array<{ label: string; value: string }>;
}) {
  return (
    <div className="site-card space-y-4 border-white/70 bg-white/82 p-4 md:p-5">
      <div>
        <p className="eyebrow">Live Summary</p>
        <h4 className="mt-2 text-[28px] leading-[1.05] text-[hsl(var(--primary))]">
          {summaryHeading}
        </h4>
        <p className="mt-2 text-sm text-[hsl(var(--foreground))]/80">{summaryIntro}</p>
      </div>

      <div className="site-divider" />

      <dl className="space-y-3 text-sm">
        {summaryItems.length > 0 ? (
          summaryItems.map((item) => (
            <div key={item.label}>
              <dt className="text-[hsl(var(--muted-foreground))]">{item.label}</dt>
              <dd className="text-[hsl(var(--foreground))]/85">{item.value}</dd>
            </div>
          ))
        ) : (
          <div>
            <dt className="text-[hsl(var(--muted-foreground))]">Summary</dt>
            <dd className="text-[hsl(var(--foreground))]/85">
              No fields are marked for summary yet.
            </dd>
          </div>
        )}
      </dl>

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 text-[hsl(var(--primary))] hover:bg-white"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4" />
        {copied ? "Copied" : "Copy Brief"}
      </Button>
    </div>
  );
}

export interface QuoteBriefDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function QuoteBriefDialog({
  triggerLabel,
  triggerClassName,
}: QuoteBriefDialogProps) {
  const form = useQuoteForm();
  const initialState = useMemo(() => buildInitialState(form), [form]);
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>(initialState);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [activeStepId, setActiveStepId] = useState(form.steps[0]?.id ?? "");

  const visibleSteps = useMemo(
    () =>
      form.steps
        .filter((step) => isStepVisible(step, formState))
        .map((step) => ({
          ...step,
          fields: step.fields.filter((field) => isFieldVisible(field, formState)),
        }))
        .filter((step) => step.fields.length > 0),
    [form.steps, formState],
  );

  useEffect(() => {
    setFormState(initialState);
    setActiveStepId(form.steps[0]?.id ?? "");
    setErrors({});
    setCopied(false);
    setSubmitSuccess(false);
    setIsSubmitting(false);
    setSubmitError("");
  }, [form, initialState]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (!visibleSteps.some((step) => step.id === activeStepId)) {
      setActiveStepId(visibleSteps[0]?.id ?? form.steps[0]?.id ?? "");
    }
  }, [activeStepId, form.steps, open, visibleSteps]);

  const activeIndex = visibleSteps.findIndex((step) => step.id === activeStepId);
  const activeStep =
    visibleSteps[activeIndex] ?? visibleSteps[0] ?? form.steps[0] ?? null;

  const summaryItems = useMemo(() => {
    const items: Array<{ label: string; value: string }> = [];

    for (const step of visibleSteps) {
      for (const field of step.fields) {
        if (!field.includeInSummary) {
          continue;
        }

        const value = formState[field.name];

        if (isBlank(value)) {
          continue;
        }

        items.push({
          label: field.label,
          value: formatFieldValue(value),
        });
      }
    }

    return items;
  }, [formState, visibleSteps]);

  const summaryText = useMemo(() => {
    const lines = [form.dialogTitle];

    for (const step of visibleSteps) {
      const stepLines = step.fields
        .filter((field) => field.includeInSummary)
        .map((field) => {
          const value = formState[field.name];
          return isBlank(value) ? null : `${field.label}: ${formatFieldValue(value)}`;
        })
        .filter((line): line is string => Boolean(line));

      if (stepLines.length === 0) {
        continue;
      }

      lines.push("", step.title);
      lines.push(...stepLines);
    }

    return lines.join("\n");
  }, [form.dialogTitle, formState, visibleSteps]);

  const resetDialog = () => {
    setFormState(initialState);
    setActiveStepId(form.steps[0]?.id ?? "");
    setCopied(false);
    setErrors({});
    setIsSubmitting(false);
    setSubmitSuccess(false);
    setSubmitError("");
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);

    if (!nextOpen) {
      resetDialog();
    }
  };

  const updateFieldValue = (field: QuoteField, value: FieldValue) => {
    setFormState((current) => ({
      ...current,
      [field.name]: value,
    }));

    setErrors((current) => {
      if (!current[field.name]) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors[field.name];
      return nextErrors;
    });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  };

  const validateVisibleFields = () => {
    const nextErrors: FieldErrors = {};

    for (const step of visibleSteps) {
      for (const field of step.fields) {
        const error = validateField(field, formState[field.name]);

        if (error) {
          nextErrors[field.name] = error;
        }
      }
    }

    return nextErrors;
  };

  const handleSubmit = async () => {
    const nextErrors = validateVisibleFields();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);

      const firstErroredStep = visibleSteps.find((step) =>
        step.fields.some((field) => nextErrors[field.name]),
      );

      if (firstErroredStep) {
        setActiveStepId(firstErroredStep.id);
      }

      return;
    }

    setErrors({});
    setIsSubmitting(true);
    setSubmitError("");

    const primaryContact = visibleSteps
      .flatMap((step) => step.fields)
      .find((field) => field.type === "email");
    const contactValue = primaryContact ? formState[primaryContact.name] : "";
    const contactEmail = Array.isArray(contactValue) ? "" : String(contactValue ?? "").trim();
    const companyField = visibleSteps
      .flatMap((step) => step.fields)
      .find((field) => field.name === "company");
    const nameField = visibleSteps
      .flatMap((step) => step.fields)
      .find((field) => field.name === "name");
    const companyValue =
      companyField && !Array.isArray(formState[companyField.name])
        ? String(formState[companyField.name] ?? "").trim()
        : "";
    const nameValue =
      nameField && !Array.isArray(formState[nameField.name])
        ? String(formState[nameField.name] ?? "").trim()
        : "";

    const answers: Record<string, unknown> = {};
    const payload = new FormData();

    for (const step of visibleSteps) {
      for (const field of step.fields) {
        const value = formState[field.name];

        if (field.type === "fileUpload") {
          const selectedFiles = Array.isArray(value)
            ? value.filter((item): item is File => item instanceof File)
            : [];

          answers[field.name] = selectedFiles.map((file) => file.name);
          for (const file of selectedFiles) {
            payload.append(`file:${field.name}`, file);
          }
          continue;
        }

        answers[field.name] = Array.isArray(value)
          ? value.filter((item): item is string => typeof item === "string")
          : String(value ?? "").trim();
      }
    }

    payload.set("answers", JSON.stringify(answers));
    payload.set("summaryText", summaryText);
    payload.set("sourcePage", window.location.pathname || "/");
    payload.set("submitterName", nameValue);
    payload.set("submitterEmail", contactEmail);
    payload.set("submitterCompany", companyValue);
    payload.set(
      "preferredContactMethod",
      Array.isArray(formState.contactMethod) ? "" : String(formState.contactMethod ?? "").trim(),
    );

    try {
      const response = await fetch("/api/quote-submissions", {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const result = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;

        throw new Error(result?.error || "Failed to submit quote request.");
      }

      setIsSubmitting(false);
      setSubmitSuccess(true);
    } catch (error) {
      setIsSubmitting(false);
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit quote request.",
      );
    }
  };

  const goBack = () => {
    if (activeIndex <= 0) {
      return;
    }

    const previousStep = visibleSteps[activeIndex - 1];

    if (previousStep) {
      setActiveStepId(previousStep.id);
    }
  };

  const goNext = () => {
    if (activeIndex >= visibleSteps.length - 1) {
      return;
    }

    const nextStep = visibleSteps[activeIndex + 1];

    if (nextStep) {
      setActiveStepId(nextStep.id);
    }
  };

  const renderFieldControl = (field: QuoteField) => {
    const value = formState[field.name];
    const error = errors[field.name];

    if (field.type === "textarea") {
      return (
        <Textarea
          rows={4}
          value={Array.isArray(value) ? "" : String(value ?? "")}
          onChange={(event) => updateFieldValue(field, event.target.value)}
          placeholder={field.placeholder}
          className={cn(
            "mt-2 resize-none rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 placeholder:text-[hsl(var(--muted-foreground))]",
            error ? "border-red-400 ring-2 ring-red-200" : "",
          )}
        />
      );
    }

    if (field.type === "singleSelect" || field.type === "radio") {
      const selectedValue = Array.isArray(value) ? "" : String(value ?? "");

      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {field.options.map((option) => (
            <StepChip
              key={option.value}
              active={selectedValue === option.value}
              onClick={() => updateFieldValue(field, option.value)}
            >
              {option.label}
            </StepChip>
          ))}
        </div>
      );
    }

    if (field.type === "multiSelect" || field.type === "checkboxGroup") {
      const selectedValues = Array.isArray(value)
        ? value.filter((item): item is string => typeof item === "string")
        : [];

      return (
        <div className="mt-3 flex flex-wrap gap-2">
          {field.options.map((option) => (
            <StepChip
              key={option.value}
              active={selectedValues.includes(option.value)}
              onClick={() =>
                updateFieldValue(field, toggleArrayValue(selectedValues, option.value))
              }
            >
              {option.label}
            </StepChip>
          ))}
        </div>
      );
    }

    if (field.type === "fileUpload") {
      const files = Array.isArray(value)
        ? value.filter((item): item is File => item instanceof File)
        : [];

      return (
        <div className="mt-3 space-y-3">
          <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--border))]/70 bg-white/78 px-4 py-3 text-sm text-[hsl(var(--foreground))]/85">
            <Upload className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span>
              {files.length > 0
                ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                : field.placeholder || "Choose file attachments"}
            </span>
            <Input
              type="file"
              className="hidden"
              multiple={field.validation.maxFiles !== 1}
              onChange={(event) => updateFieldValue(field, Array.from(event.target.files ?? []))}
            />
          </label>
          {files.length > 0 ? (
            <ul className="space-y-1 text-sm text-[hsl(var(--foreground))]/80">
              {files.map((file) => (
                <li key={file.name}>{file.name}</li>
              ))}
            </ul>
          ) : null}
        </div>
      );
    }

    const inputType: Record<QuoteFieldType, string> = {
      text: "text",
      textarea: "text",
      email: "email",
      phone: "tel",
      singleSelect: "text",
      multiSelect: "text",
      radio: "text",
      checkboxGroup: "text",
      fileUpload: "file",
    };

    return (
      <Input
        type={inputType[field.type]}
        value={Array.isArray(value) ? "" : String(value ?? "")}
        onChange={(event) => updateFieldValue(field, event.target.value)}
        placeholder={field.placeholder}
        className={cn(
          "mt-2 h-11 rounded-2xl border-[hsl(var(--border))]/70 bg-white/78",
          error ? "border-red-400 ring-2 ring-red-200" : "",
        )}
      />
    );
  };

  if (!activeStep) {
    return null;
  }

  const hasData = Object.values(formState).some((value) => !isBlank(value));

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className={cn("btn-primary", triggerClassName)}>
          {triggerLabel || form.triggerLabelDefault}
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-1.5rem)] sm:w-full !max-w-[1040px] overflow-hidden rounded-[2rem] border border-[hsl(var(--border))]/45 bg-[hsl(var(--background))]/96 p-0 shadow-[var(--shadow-float)] backdrop-blur-2xl"
        onInteractOutside={(event) => {
          if (!hasData) {
            return;
          }

          const confirmDiscard = window.confirm(
            "Are you sure you want to close? Your quote request progress will be lost.",
          );

          if (!confirmDiscard) {
            event.preventDefault();
          }
        }}
      >
        <DialogTitle className="sr-only">{form.dialogTitle}</DialogTitle>
        <DialogDescription className="sr-only">
          Multi-step project brief builder used to prepare a quote request.
        </DialogDescription>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(157,172,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,181,123,0.16),transparent_28%)]" />

        <div className="relative p-4 md:p-6">
          <header className="mb-5 border-b border-[hsl(var(--border))]/55 pb-4 md:mb-6 md:pb-5">
            <p className="eyebrow">Hello Monday</p>
            <h3 className="mt-2 text-[34px] leading-[1.06] text-[hsl(var(--primary))] md:text-[46px]">
              {form.dialogTitle}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[hsl(var(--foreground))]/80 md:text-base">
              {form.dialogDescription}
            </p>

            <DialogClose asChild>
              <button
                type="button"
                aria-label="Close quote dialog"
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))]/60 bg-white/82 text-[hsl(var(--foreground))]/75 transition-colors hover:text-[hsl(var(--primary))]"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </header>

          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:gap-5">
            <aside className="hidden lg:block">
              <nav aria-label="Quote steps" className="space-y-2">
                {visibleSteps.map((step, index) => {
                  const active = step.id === activeStep.id;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStepId(step.id)}
                      className={cn(
                        "w-full rounded-[1.4rem] border p-3 text-left transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-transparent bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-soft)]"
                          : "border-[hsl(var(--border))]/60 bg-white/80 text-[hsl(var(--foreground))] hover:bg-white",
                      )}
                    >
                      <p
                        className={cn(
                          "text-xs font-medium uppercase tracking-[0.14em]",
                          active ? "text-white/65" : "text-[hsl(var(--muted-foreground))]",
                        )}
                      >
                        {step.indexLabel || String(index + 1).padStart(2, "0")}
                      </p>
                      <p className="mt-1 text-sm font-medium">{step.navLabel || step.title}</p>
                    </button>
                  );
                })}
              </nav>
            </aside>

            <main className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {visibleSteps.map((step, index) => (
                  <StepChip
                    key={step.id}
                    active={step.id === activeStep.id}
                    onClick={() => setActiveStepId(step.id)}
                    className="whitespace-nowrap"
                  >
                    {(step.indexLabel || String(index + 1).padStart(2, "0"))} {step.navLabel || step.title}
                  </StepChip>
                ))}
              </div>

              <section className="site-card-solid space-y-2 p-4 md:p-5">
                <p className="eyebrow">
                  Step {activeStep.indexLabel || String(activeIndex + 1).padStart(2, "0")} of{" "}
                  {String(visibleSteps.length).padStart(2, "0")}
                </p>
                <h4 className="text-[30px] leading-[1.06] text-[hsl(var(--primary))] md:text-[36px]">
                  {activeStep.title}
                </h4>
                {activeStep.description ? (
                  <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]/80 md:text-base">
                    {activeStep.description}
                  </p>
                ) : null}
              </section>

              <AnimatePresence mode="wait" initial={false}>
                <motion.section
                  key={activeStep.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: TRANSITION_EASE }}
                  className="site-card-solid p-4 md:p-5"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {activeStep.fields.map((field) => (
                      <div key={field.id || field.name} className={fieldWidthClass(field.width)}>
                        <label className="space-y-1.5">
                          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
                            {field.label}
                            {field.required ? " *" : ""}
                          </span>
                          {field.helperText ? (
                            <p className="text-sm text-[hsl(var(--foreground))]/70">
                              {field.helperText}
                            </p>
                          ) : null}
                          {renderFieldControl(field)}
                          {errors[field.name] ? (
                            <p className="text-xs text-red-500">{errors[field.name]}</p>
                          ) : null}
                        </label>
                      </div>
                    ))}
                  </div>
                </motion.section>
              </AnimatePresence>

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 text-[hsl(var(--primary))] hover:bg-white disabled:opacity-40"
                  onClick={goBack}
                  disabled={activeIndex <= 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                {activeIndex < visibleSteps.length - 1 ? (
                  <Button
                    type="button"
                    className="rounded-2xl bg-[hsl(var(--secondary))] px-5 text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/90"
                    onClick={goNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="h-11 rounded-2xl bg-[hsl(var(--secondary))] px-5 text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/90"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        {form.submitButtonLabel}
                      </>
                    )}
                  </Button>
                )}
              </div>

              {submitSuccess ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))]/60 bg-white/80 px-3 py-2 text-sm text-[hsl(var(--foreground))]/85">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--secondary))]" />
                  <span>{form.successMessage}</span>
                </div>
              ) : null}

              {submitError ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  <span>{submitError}</span>
                </div>
              ) : null}
            </main>

            <aside className="hidden lg:block">
              <div className="sticky top-3">
                <SummaryCard
                  copied={copied}
                  onCopy={handleCopy}
                  summaryHeading={form.summaryHeading}
                  summaryIntro={form.summaryIntro}
                  summaryItems={summaryItems}
                />
              </div>
            </aside>
          </div>

          <div className="mt-4 lg:hidden">
            <details className="site-card border-white/70 bg-white/80 p-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-[hsl(var(--foreground))]">
                Review Summary
              </summary>
              <div className="mt-3">
                <SummaryCard
                  copied={copied}
                  onCopy={handleCopy}
                  summaryHeading={form.summaryHeading}
                  summaryIntro={form.summaryIntro}
                  summaryItems={summaryItems}
                />
              </div>
            </details>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
