"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Mail,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ButtonHTMLAttributes, Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
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
import { useDirection } from "@/hooks/useDirection";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepId = "goals" | "scope" | "timeline" | "contact";
type ContactMethod = "email" | "phone" | "whatsapp" | "";

type BriefData = {
  goals: string[];
  context: string;
  services: string[];
  deliverables: string[];
  timeline: string;
  budget: string;
  notes: string;
  name: string;
  email: string;
  company: string;
  contactMethod: ContactMethod;
};

type StepItem = {
  id: StepId;
  index: string;
  label: string;
  title: string;
  description: string;
};

// ─── Option maps (value → translation key) ───────────────────────────────────

const GOAL_OPTIONS: { value: string; tKey: string }[] = [
  { value: "Product Design",      tKey: "goalProductDesign" },
  { value: "Brand Refresh",       tKey: "goalBrandRefresh" },
  { value: "Website Launch",      tKey: "goalWebsiteLaunch" },
  { value: "Campaign Experience", tKey: "goalCampaignExperience" },
  { value: "Design System",       tKey: "goalDesignSystem" },
];

const SERVICE_OPTIONS: { value: string; tKey: string }[] = [
  { value: "Strategy",    tKey: "serviceStrategy" },
  { value: "Branding",    tKey: "serviceBranding" },
  { value: "Web Design",  tKey: "serviceWebDesign" },
  { value: "Development", tKey: "serviceDevelopment" },
  { value: "Content",     tKey: "serviceContent" },
  { value: "Motion",      tKey: "serviceMotion" },
];

const DELIVERABLE_OPTIONS: { value: string; tKey: string }[] = [
  { value: "Landing Page",     tKey: "deliverableLandingPage" },
  { value: "Prototype",        tKey: "deliverablePrototype" },
  { value: "Visual Identity",  tKey: "deliverableVisualIdentity" },
  { value: "Motion Toolkit",   tKey: "deliverableMotionToolkit" },
  { value: "Design System",    tKey: "deliverableDesignSystem" },
  { value: "Launch Assets",    tKey: "deliverableLaunchAssets" },
];

const TIMELINE_OPTIONS: { value: string; tKey: string }[] = [
  { value: "2-3 weeks",  tKey: "timelineTwoThree" },
  { value: "4-6 weeks",  tKey: "timelineFourSix" },
  { value: "6-10 weeks", tKey: "timelineSixTen" },
  { value: "Flexible",   tKey: "timelineFlexible" },
];

const BUDGET_OPTIONS: { value: string; tKey: string }[] = [
  { value: "< $5k",    tKey: "budgetUnder5k" },
  { value: "$5-15k",   tKey: "budget5_15k" },
  { value: "$15-30k",  tKey: "budget15_30k" },
  { value: "$30k+",    tKey: "budgetOver30k" },
  { value: "Not sure", tKey: "budgetNotSure" },
];

const CONTACT_OPTIONS: { value: ContactMethod; tKey: string }[] = [
  { value: "email",    tKey: "contactEmail" },
  { value: "phone",    tKey: "contactPhone" },
  { value: "whatsapp", tKey: "contactWhatsapp" },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const INITIAL_DATA: BriefData = {
  goals: [],
  context: "",
  services: [],
  deliverables: [],
  timeline: "",
  budget: "",
  notes: "",
  name: "",
  email: "",
  company: "",
  contactMethod: "",
};

const STEP_ORDER: StepId[] = ["goals", "scope", "timeline", "contact"];
const TRANSITION_EASE = [0.22, 1, 0.36, 1] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toggleValue(items: string[], value: string) {
  return items.includes(value)
    ? items.filter((e) => e !== value)
    : [...items, value];
}

function formatList(items: string[], notSelectedText: string) {
  return items.length === 0 ? notSelectedText : items.join(", ");
}

function useStepItems(t: ReturnType<typeof useTranslations<"quote">>): StepItem[] {
  return [
    { id: "goals",    index: "01", label: t("step01Label"), title: t("step01Title"), description: t("step01Description") },
    { id: "scope",    index: "02", label: t("step02Label"), title: t("step02Title"), description: t("step02Description") },
    { id: "timeline", index: "03", label: t("step03Label"), title: t("step03Title"), description: t("step03Description") },
    { id: "contact",  index: "04", label: t("step04Label"), title: t("step04Title"), description: t("step04Description") },
  ];
}

// ─── StepChip ─────────────────────────────────────────────────────────────────

function StepChip({
  active = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
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

// ─── SummaryCard ──────────────────────────────────────────────────────────────

function SummaryCard({ data, copied, onCopy }: { data: BriefData; copied: boolean; onCopy: () => void }) {
  const t = useTranslations("quote");
  const notSelected = t("notSelected");

  return (
    <div className="site-card space-y-4 border-white/70 bg-white/82 p-4 md:p-5">
      <div>
        <p className="eyebrow">{t("liveSummaryEyebrow")}</p>
        <h4 className="mt-2 text-[28px] leading-[1.05] text-[hsl(var(--primary))]">
          {t("summaryHeading")}
        </h4>
      </div>

      <div className="site-divider" />

      <dl className="space-y-3 text-sm">
        {[
          { label: t("summaryGoals"),       value: formatList(data.goals, notSelected) },
          { label: t("summaryServices"),    value: formatList(data.services, notSelected) },
          { label: t("summaryDeliverables"),value: formatList(data.deliverables, notSelected) },
          { label: t("summaryTimeline"),    value: data.timeline || notSelected },
          { label: t("summaryBudget"),      value: data.budget || notSelected },
          {
            label: t("summaryContact"),
            value: data.email
              ? `${data.email}${data.name ? ` (${data.name})` : ""}`
              : t("noContactYet"),
          },
        ].map(({ label, value }) => (
          <div key={label}>
            <dt className="text-[hsl(var(--muted-foreground))]">{label}</dt>
            <dd className="text-[hsl(var(--foreground))]/85">{value}</dd>
          </div>
        ))}
      </dl>

      <Button
        type="button"
        variant="outline"
        className="w-full rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 text-[hsl(var(--primary))] hover:bg-white"
        onClick={onCopy}
      >
        <Copy className="h-4 w-4" />
        {copied ? t("copied") : t("copyBrief")}
      </Button>
    </div>
  );
}

// ─── GoalsStep ────────────────────────────────────────────────────────────────

function GoalsStep({ data, onUpdate }: { data: BriefData; onUpdate: Dispatch<SetStateAction<BriefData>> }) {
  const t = useTranslations("quote");

  return (
    <div className="space-y-4">
      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          {t("goalFocusHeading")}
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t("goalFocusBody")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((opt) => (
            <StepChip
              key={opt.value}
              active={data.goals.includes(opt.value)}
              onClick={() => onUpdate((prev) => ({ ...prev, goals: toggleValue(prev.goals, opt.value) }))}
            >
              {t(opt.tKey as Parameters<typeof t>[0])}
            </StepChip>
          ))}
        </div>
      </section>

      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          {t("projectContextHeading")}
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t("projectContextBody")}</p>
        <Textarea
          rows={4}
          value={data.context}
          onChange={(e) => onUpdate((prev) => ({ ...prev, context: e.target.value }))}
          placeholder={t("projectContextPlaceholder")}
          className="mt-3 resize-none rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 placeholder:text-[hsl(var(--muted-foreground))]"
        />
      </section>
    </div>
  );
}

// ─── ScopeStep ────────────────────────────────────────────────────────────────

function ScopeStep({ data, onUpdate }: { data: BriefData; onUpdate: Dispatch<SetStateAction<BriefData>> }) {
  const t = useTranslations("quote");

  return (
    <div className="space-y-4">
      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          {t("servicesHeading")}
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t("servicesBody")}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SERVICE_OPTIONS.map((opt) => {
            const active = data.services.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onUpdate((prev) => ({ ...prev, services: toggleValue(prev.services, opt.value) }))}
                className={cn(
                  "rounded-[1.3rem] border p-3 text-start transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-transparent bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-soft)]"
                    : "border-[hsl(var(--border))]/60 bg-white/78 text-[hsl(var(--foreground))] hover:bg-white",
                )}
              >
                <span className="text-sm font-medium">{t(opt.tKey as Parameters<typeof t>[0])}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          {t("deliverablesHeading")}
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t("deliverablesBody")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DELIVERABLE_OPTIONS.map((opt) => (
            <StepChip
              key={opt.value}
              active={data.deliverables.includes(opt.value)}
              onClick={() => onUpdate((prev) => ({ ...prev, deliverables: toggleValue(prev.deliverables, opt.value) }))}
            >
              {t(opt.tKey as Parameters<typeof t>[0])}
            </StepChip>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── TimelineStep ─────────────────────────────────────────────────────────────

function TimelineStep({ data, onUpdate }: { data: BriefData; onUpdate: Dispatch<SetStateAction<BriefData>> }) {
  const t = useTranslations("quote");

  return (
    <div className="space-y-4">
      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          {t("timelineHeading")}
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t("timelineBody")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TIMELINE_OPTIONS.map((opt) => (
            <StepChip
              key={opt.value}
              active={data.timeline === opt.value}
              onClick={() => onUpdate((prev) => ({ ...prev, timeline: opt.value }))}
            >
              {t(opt.tKey as Parameters<typeof t>[0])}
            </StepChip>
          ))}
        </div>
      </section>

      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          {t("budgetHeading")}
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t("budgetBody")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((opt) => (
            <StepChip
              key={opt.value}
              active={data.budget === opt.value}
              onClick={() => onUpdate((prev) => ({ ...prev, budget: opt.value }))}
            >
              {t(opt.tKey as Parameters<typeof t>[0])}
            </StepChip>
          ))}
        </div>
        <Textarea
          rows={3}
          value={data.notes}
          onChange={(e) => onUpdate((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder={t("budgetPlaceholder")}
          className="mt-3 resize-none rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 placeholder:text-[hsl(var(--muted-foreground))]"
        />
      </section>
    </div>
  );
}

// ─── ContactStep ──────────────────────────────────────────────────────────────

function ContactStep({
  data,
  onUpdate,
  emailError,
  onSubmit,
  isSubmitting,
}: {
  data: BriefData;
  onUpdate: Dispatch<SetStateAction<BriefData>>;
  emailError?: string;
  onSubmit: () => void;
  isSubmitting: boolean;
}) {
  const t = useTranslations("quote");

  return (
    <div className="space-y-4">
      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          {t("contactDetailsHeading")}
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{t("contactDetailsBody")}</p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              {t("nameLabel")}
            </span>
            <Input
              value={data.name}
              onChange={(e) => onUpdate((prev) => ({ ...prev, name: e.target.value }))}
              placeholder={t("namePlaceholder")}
              className="h-11 rounded-2xl border-[hsl(var(--border))]/70 bg-white/78"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              {t("emailLabel")}
            </span>
            <Input
              type="email"
              value={data.email}
              onChange={(e) => onUpdate((prev) => ({ ...prev, email: e.target.value }))}
              placeholder={t("emailPlaceholder")}
              className={cn(
                "h-11 rounded-2xl border-[hsl(var(--border))]/70 bg-white/78",
                emailError ? "border-red-400 ring-2 ring-red-200" : "",
              )}
            />
            {emailError ? <p className="text-xs text-red-500">{emailError}</p> : null}
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              {t("companyLabel")}
            </span>
            <Input
              value={data.company}
              onChange={(e) => onUpdate((prev) => ({ ...prev, company: e.target.value }))}
              placeholder={t("companyPlaceholder")}
              className="h-11 rounded-2xl border-[hsl(var(--border))]/70 bg-white/78"
            />
          </label>
        </div>
      </section>

      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          {t("preferredContactHeading")}
        </h5>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONTACT_OPTIONS.map((opt) => (
            <StepChip
              key={opt.value}
              active={data.contactMethod === opt.value}
              onClick={() => onUpdate((prev) => ({ ...prev, contactMethod: opt.value }))}
            >
              {t(opt.tKey as Parameters<typeof t>[0])}
            </StepChip>
          ))}
        </div>
      </section>

      <Button
        type="button"
        className="h-11 rounded-2xl bg-[hsl(var(--secondary))] px-5 text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/90"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t("submittingLabel")}
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            {t("submitButton")}
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

export interface QuoteBriefDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function QuoteBriefDialog({ triggerLabel, triggerClassName }: QuoteBriefDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>("goals");
  const [data, setData] = useState<BriefData>(INITIAL_DATA);
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const t = useTranslations("quote");
  const tCommon = useTranslations("common");
  const dir = useDirection();
  const STEP_ITEMS = useStepItems(t);

  const activeIndex = STEP_ORDER.indexOf(activeStep);
  const activeItem = STEP_ITEMS.find((item) => item.id === activeStep) ?? STEP_ITEMS[0];

  const label = triggerLabel ?? tCommon("getQuote");

  // Back / Next chevron direction respects RTL
  const BackIcon  = dir === -1 ? ChevronRight : ChevronLeft;
  const NextIcon  = dir === -1 ? ChevronLeft  : ChevronRight;

  const summaryText = useMemo(() => {
    return [
      "Hello Monday Quote Request",
      `Goals: ${formatList(data.goals, "Not selected")}`,
      `Context: ${data.context || "Not provided"}`,
      `Services: ${formatList(data.services, "Not selected")}`,
      `Deliverables: ${formatList(data.deliverables, "Not selected")}`,
      `Timeline: ${data.timeline || "Not selected"}`,
      `Budget: ${data.budget || "Not selected"}`,
      `Notes: ${data.notes || "None"}`,
      `Name: ${data.name || "Not provided"}`,
      `Email: ${data.email || "Not provided"}`,
      `Company: ${data.company || "Not provided"}`,
      `Preferred Contact: ${data.contactMethod || "Not selected"}`,
    ].join("\n");
  }, [data]);

  const hasData =
    data.goals.length > 0 ||
    data.context !== "" ||
    data.services.length > 0 ||
    data.deliverables.length > 0 ||
    data.timeline !== "" ||
    data.company !== "" ||
    data.contactMethod !== "" ||
    data.email !== "";

  const resetDialog = () => {
    setActiveStep("goals");
    setData(INITIAL_DATA);
    setCopied(false);
    setEmailError("");
    setIsSubmitting(false);
    setSubmitSuccess(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) resetDialog();
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

  const handleSubmit = async () => {
    const email = data.email.trim();
    if (!email) {
      setEmailError(t("emailError"));
      return;
    }
    setEmailError("");
    setIsSubmitting(true);

    try {
      await navigator.clipboard.writeText(summaryText);
    } catch { /* best-effort */ }

    const subject = encodeURIComponent(
      `Quote Request${data.company ? ` - ${data.company}` : data.name ? ` - ${data.name}` : ""}`
    );
    const body = encodeURIComponent(summaryText);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      window.location.href = `mailto:newbusiness@hellomonday.com?subject=${subject}&body=${body}`;
    }, 320);
  };

  const goBack = () => {
    const prev = STEP_ORDER[activeIndex - 1];
    if (prev) setActiveStep(prev);
  };

  const goNext = () => {
    const next = STEP_ORDER[activeIndex + 1];
    if (next) setActiveStep(next);
  };

  const renderStepContent = () => {
    if (activeStep === "goals")    return <GoalsStep    data={data} onUpdate={setData} />;
    if (activeStep === "scope")    return <ScopeStep    data={data} onUpdate={setData} />;
    if (activeStep === "timeline") return <TimelineStep data={data} onUpdate={setData} />;
    return (
      <ContactStep
        data={data}
        onUpdate={setData}
        emailError={emailError}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button type="button" className={cn("btn-primary", triggerClassName)}>
          {label}
        </button>
      </DialogTrigger>

      <DialogContent
        dir={dir === -1 ? "rtl" : "ltr"}
        showCloseButton={false}
        className="w-[calc(100vw-1.5rem)] sm:w-full !max-w-[1040px] overflow-hidden rounded-[2rem] border border-[hsl(var(--border))]/45 bg-[hsl(var(--background))]/96 p-0 shadow-[var(--shadow-float)] backdrop-blur-2xl"
        onInteractOutside={(e) => {
          if (hasData) {
            const confirmDiscard = window.confirm(t("discardConfirm"));
            if (!confirmDiscard) e.preventDefault();
          }
        }}
      >
        <DialogTitle className="sr-only">{t("dialogTitle")}</DialogTitle>
        <DialogDescription className="sr-only">{t("dialogDescription")}</DialogDescription>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(157,172,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,181,123,0.16),transparent_28%)]" />

        <div className="relative p-4 md:p-6">
          {/* Header */}
          <header className="mb-5 border-b border-[hsl(var(--border))]/55 pb-4 md:mb-6 md:pb-5">
            <p className="eyebrow">{t("brandEyebrow")}</p>
            <h3 className="mt-2 text-[34px] leading-[1.06] text-[hsl(var(--primary))] md:text-[46px]">
              {t("dialogTitle")}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[hsl(var(--foreground))]/80 md:text-base">
              {t("headerIntro")}
            </p>

            <DialogClose asChild>
              <button
                type="button"
                aria-label={t("closeAriaLabel")}
                className="absolute end-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[hsl(var(--border))]/60 bg-white/82 text-[hsl(var(--foreground))]/75 transition-colors hover:text-[hsl(var(--primary))]"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogClose>
          </header>

          {/* Body grid */}
          <div className="grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)_280px] lg:gap-5">
            {/* Desktop step nav */}
            <aside className="hidden lg:block">
              <nav aria-label={t("quoteStepsNavLabel")} className="space-y-2">
                {STEP_ITEMS.map((step) => {
                  const active = step.id === activeStep;
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={cn(
                        "w-full rounded-[1.4rem] border p-3 text-start transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-transparent bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-soft)]"
                          : "border-[hsl(var(--border))]/60 bg-white/80 text-[hsl(var(--foreground))] hover:bg-white",
                      )}
                    >
                      <p className={cn("text-xs font-medium uppercase tracking-[0.14em]", active ? "text-white/65" : "text-[hsl(var(--muted-foreground))]")}>
                        {step.index}
                      </p>
                      <p className="mt-1 text-sm font-medium">{step.label}</p>
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main content */}
            <main className="space-y-4">
              {/* Mobile chip row */}
              <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {STEP_ITEMS.map((step) => (
                  <StepChip
                    key={step.id}
                    active={step.id === activeStep}
                    onClick={() => setActiveStep(step.id)}
                    className="whitespace-nowrap"
                  >
                    {step.index} {step.label}
                  </StepChip>
                ))}
              </div>

              {/* Step header */}
              <section className="site-card-solid space-y-2 p-4 md:p-5">
                <p className="eyebrow">
                  {t("stepIndicator", { index: activeItem.index })}
                </p>
                <h4 className="text-[30px] leading-[1.06] text-[hsl(var(--primary))] md:text-[36px]">
                  {activeItem.title}
                </h4>
                <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]/80 md:text-base">
                  {activeItem.description}
                </p>
              </section>

              {/* Animated step body */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: TRANSITION_EASE }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>

              {/* Back / Next */}
              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 text-[hsl(var(--primary))] hover:bg-white disabled:opacity-40"
                  onClick={goBack}
                  disabled={activeIndex === 0}
                >
                  <BackIcon className="h-4 w-4" />
                  {t("backButton")}
                </Button>

                {activeStep !== "contact" ? (
                  <Button
                    type="button"
                    className="rounded-2xl bg-[hsl(var(--secondary))] px-5 text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/90"
                    onClick={goNext}
                  >
                    {t("nextButton")}
                    <NextIcon className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>

              {submitSuccess ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))]/60 bg-white/80 px-3 py-2 text-sm text-[hsl(var(--foreground))]/85">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--secondary))]" />
                  <span>{t("successMessage")}</span>
                </div>
              ) : null}
            </main>

            {/* Desktop summary */}
            <aside className="hidden lg:block">
              <div className="sticky top-3">
                <SummaryCard data={data} copied={copied} onCopy={handleCopy} />
              </div>
            </aside>
          </div>

          {/* Mobile summary accordion */}
          <div className="mt-4 lg:hidden">
            <details className="site-card border-white/70 bg-white/80 p-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-[hsl(var(--foreground))]">
                {t("reviewSummary")}
              </summary>
              <div className="mt-3">
                <SummaryCard data={data} copied={copied} onCopy={handleCopy} />
              </div>
            </details>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
