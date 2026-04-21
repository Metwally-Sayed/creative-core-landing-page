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

function useStepItems(t: ReturnType<typeof useTranslations<"quote">>): StepItem[] {
  return [
    {
      id: "goals",
      index: "01",
      label: t("step01Label"),
      title: t("step01Title"),
      description: t("step01Description"),
    },
    {
      id: "scope",
      index: "02",
      label: t("step02Label"),
      title: t("step02Title"),
      description: t("step02Description"),
    },
    {
      id: "timeline",
      index: "03",
      label: t("step03Label"),
      title: t("step03Title"),
      description: t("step03Description"),
    },
    {
      id: "contact",
      index: "04",
      label: t("step04Label"),
      title: t("step04Title"),
      description: t("step04Description"),
    },
  ];
}

const GOAL_OPTIONS = [
  "Product Design",
  "Brand Refresh",
  "Website Launch",
  "Campaign Experience",
  "Design System",
] as const;

const SERVICE_OPTIONS = [
  "Strategy",
  "Branding",
  "Web Design",
  "Development",
  "Content",
  "Motion",
] as const;

const DELIVERABLE_OPTIONS = [
  "Landing Page",
  "Prototype",
  "Visual Identity",
  "Motion Toolkit",
  "Design System",
  "Launch Assets",
] as const;

const TIMELINE_OPTIONS = ["2-3 weeks", "4-6 weeks", "6-10 weeks", "Flexible"] as const;
const BUDGET_OPTIONS = ["< $5k", "$5-15k", "$15-30k", "$30k+", "Not sure"] as const;
const CONTACT_OPTIONS = ["email", "phone", "whatsapp"] as const;

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

function toggleValue(items: string[], value: string) {
  if (items.includes(value)) {
    return items.filter((entry) => entry !== value);
  }

  return [...items, value];
}

function formatList(items: string[]) {
  if (items.length === 0) {
    return "Not selected";
  }

  return items.join(", ");
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
        className
      )}
      {...props}
    />
  );
}

function SummaryCard({
  data,
  copied,
  onCopy,
}: {
  data: BriefData;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="site-card space-y-4 border-white/70 bg-white/82 p-4 md:p-5">
      <div>
        <p className="eyebrow">Live Summary</p>
        <h4 className="mt-2 text-[28px] leading-[1.05] text-[hsl(var(--primary))]">
          Quote Snapshot
        </h4>
      </div>

      <div className="site-divider" />

      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-[hsl(var(--muted-foreground))]">Goals</dt>
          <dd className="text-[hsl(var(--foreground))]/85">{formatList(data.goals)}</dd>
        </div>
        <div>
          <dt className="text-[hsl(var(--muted-foreground))]">Services</dt>
          <dd className="text-[hsl(var(--foreground))]/85">{formatList(data.services)}</dd>
        </div>
        <div>
          <dt className="text-[hsl(var(--muted-foreground))]">Deliverables</dt>
          <dd className="text-[hsl(var(--foreground))]/85">{formatList(data.deliverables)}</dd>
        </div>
        <div>
          <dt className="text-[hsl(var(--muted-foreground))]">Timeline</dt>
          <dd className="text-[hsl(var(--foreground))]/85">{data.timeline || "Not selected"}</dd>
        </div>
        <div>
          <dt className="text-[hsl(var(--muted-foreground))]">Budget</dt>
          <dd className="text-[hsl(var(--foreground))]/85">{data.budget || "Not selected"}</dd>
        </div>
        <div>
          <dt className="text-[hsl(var(--muted-foreground))]">Contact</dt>
          <dd className="text-[hsl(var(--foreground))]/85">
            {data.email || "No contact yet"}
            {data.name ? ` (${data.name})` : ""}
          </dd>
        </div>
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

function GoalsStep({
  data,
  onUpdate,
}: {
  data: BriefData;
  onUpdate: Dispatch<SetStateAction<BriefData>>;
}) {
  return (
    <div className="space-y-4">
      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          Goal Focus
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Select one or more outcomes for this project.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <StepChip
              key={goal}
              active={data.goals.includes(goal)}
              onClick={() => onUpdate((prev) => ({ ...prev, goals: toggleValue(prev.goals, goal) }))}
            >
              {goal}
            </StepChip>
          ))}
        </div>
      </section>

      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          Project Context
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Share the audience, challenge, or launch context behind the request.
        </p>
        <Textarea
          rows={4}
          value={data.context}
          onChange={(event) => onUpdate((prev) => ({ ...prev, context: event.target.value }))}
          placeholder="We need a premium launch site for a new product line..."
          className="mt-3 resize-none rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 placeholder:text-[hsl(var(--muted-foreground))]"
        />
      </section>
    </div>
  );
}

function ScopeStep({
  data,
  onUpdate,
}: {
  data: BriefData;
  onUpdate: Dispatch<SetStateAction<BriefData>>;
}) {
  return (
    <div className="space-y-4">
      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          Services
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Choose the service lanes you want included in the quote.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {SERVICE_OPTIONS.map((service) => {
            const active = data.services.includes(service);

            return (
              <button
                key={service}
                type="button"
                onClick={() => onUpdate((prev) => ({ ...prev, services: toggleValue(prev.services, service) }))}
                className={cn(
                  "rounded-[1.3rem] border p-3 text-left transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "border-transparent bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-soft)]"
                    : "border-[hsl(var(--border))]/60 bg-white/78 text-[hsl(var(--foreground))] hover:bg-white"
                )}
              >
                <span className="text-sm font-medium">{service}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          Deliverables
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Select the outputs you expect from this engagement.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {DELIVERABLE_OPTIONS.map((deliverable) => (
            <StepChip
              key={deliverable}
              active={data.deliverables.includes(deliverable)}
              onClick={() =>
                onUpdate((prev) => ({
                  ...prev,
                  deliverables: toggleValue(prev.deliverables, deliverable),
                }))
              }
            >
              {deliverable}
            </StepChip>
          ))}
        </div>
      </section>
    </div>
  );
}

function TimelineStep({
  data,
  onUpdate,
}: {
  data: BriefData;
  onUpdate: Dispatch<SetStateAction<BriefData>>;
}) {
  return (
    <div className="space-y-4">
      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          Timeline
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Pick the rough delivery window you have in mind.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TIMELINE_OPTIONS.map((option) => (
            <StepChip
              key={option}
              active={data.timeline === option}
              onClick={() => onUpdate((prev) => ({ ...prev, timeline: option }))}
            >
              {option}
            </StepChip>
          ))}
        </div>
      </section>

      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          Budget Signal
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Optional, but useful for keeping the proposal realistic.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {BUDGET_OPTIONS.map((option) => (
            <StepChip
              key={option}
              active={data.budget === option}
              onClick={() => onUpdate((prev) => ({ ...prev, budget: option }))}
            >
              {option}
            </StepChip>
          ))}
        </div>
        <Textarea
          rows={3}
          value={data.notes}
          onChange={(event) => onUpdate((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Launch dates, constraints, markets, or extra notes..."
          className="mt-3 resize-none rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 placeholder:text-[hsl(var(--muted-foreground))]"
        />
      </section>
    </div>
  );
}

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
  return (
    <div className="space-y-4">
      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          Contact Details
        </h5>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          We will prefill an email draft so your team can review it before sending.
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              Name
            </span>
            <Input
              value={data.name}
              onChange={(event) => onUpdate((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Your name"
              className="h-11 rounded-2xl border-[hsl(var(--border))]/70 bg-white/78"
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              Email
            </span>
            <Input
              value={data.email}
              onChange={(event) => onUpdate((prev) => ({ ...prev, email: event.target.value }))}
              placeholder="you@company.com"
              className={cn(
                "h-11 rounded-2xl border-[hsl(var(--border))]/70 bg-white/78",
                emailError ? "border-red-400 ring-2 ring-red-200" : ""
              )}
            />
            {emailError ? <p className="text-xs text-red-500">{emailError}</p> : null}
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-[hsl(var(--muted-foreground))]">
              Company
            </span>
            <Input
              value={data.company}
              onChange={(event) => onUpdate((prev) => ({ ...prev, company: event.target.value }))}
              placeholder="Company name"
              className="h-11 rounded-2xl border-[hsl(var(--border))]/70 bg-white/78"
            />
          </label>
        </div>
      </section>

      <section className="site-card-solid p-4 md:p-5">
        <h5 className="text-base font-medium text-[hsl(var(--foreground))] md:text-lg">
          Preferred Contact
        </h5>
        <div className="mt-3 flex flex-wrap gap-2">
          {CONTACT_OPTIONS.map((option) => (
            <StepChip
              key={option}
              active={data.contactMethod === option}
              onClick={() => onUpdate((prev) => ({ ...prev, contactMethod: option }))}
            >
              {option}
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
            Preparing draft...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4" />
            Submit Brief
          </>
        )}
      </Button>
    </div>
  );
}

export interface QuoteBriefDialogProps {
  triggerLabel?: string;
  triggerClassName?: string;
}

export default function QuoteBriefDialog({
  triggerLabel = "Get Quote",
  triggerClassName,
}: QuoteBriefDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<StepId>("goals");
  const [data, setData] = useState<BriefData>(INITIAL_DATA);
  const [copied, setCopied] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const activeIndex = STEP_ORDER.indexOf(activeStep);
  const activeItem = STEP_ITEMS.find((item) => item.id === activeStep) ?? STEP_ITEMS[0];

  const summaryText = useMemo(() => {
    return [
      "Hello Monday Quote Request",
      `Goals: ${formatList(data.goals)}`,
      `Context: ${data.context || "Not provided"}`,
      `Services: ${formatList(data.services)}`,
      `Deliverables: ${formatList(data.deliverables)}`,
      `Timeline: ${data.timeline || "Not selected"}`,
      `Budget: ${data.budget || "Not selected"}`,
      `Notes: ${data.notes || "None"}`,
      `Name: ${data.name || "Not provided"}`,
      `Email: ${data.email || "Not provided"}`,
      `Company: ${data.company || "Not provided"}`,
      `Preferred Contact: ${data.contactMethod || "Not selected"}`,
    ].join("\n");
  }, [data]);

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
    if (!nextOpen) {
      resetDialog();
    }
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
      setEmailError("Email is required.");
      return;
    }

    setEmailError("");
    setIsSubmitting(true);

    try {
      await navigator.clipboard.writeText(summaryText);
    } catch {
      // Best-effort clipboard support only.
    }

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
    if (activeIndex <= 0) {
      return;
    }

    const previousStep = STEP_ORDER[activeIndex - 1];
    if (previousStep) {
      setActiveStep(previousStep);
    }
  };

  const goNext = () => {
    if (activeIndex >= STEP_ORDER.length - 1) {
      return;
    }

    const nextStep = STEP_ORDER[activeIndex + 1];
    if (nextStep) {
      setActiveStep(nextStep);
    }
  };

  const renderStepContent = () => {
    if (activeStep === "goals") {
      return <GoalsStep data={data} onUpdate={setData} />;
    }

    if (activeStep === "scope") {
      return <ScopeStep data={data} onUpdate={setData} />;
    }

    if (activeStep === "timeline") {
      return <TimelineStep data={data} onUpdate={setData} />;
    }

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
          {triggerLabel}
        </button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-1.5rem)] sm:w-full !max-w-[1040px] overflow-hidden rounded-[2rem] border border-[hsl(var(--border))]/45 bg-[hsl(var(--background))]/96 p-0 shadow-[var(--shadow-float)] backdrop-blur-2xl"
        onInteractOutside={(e) => {
          const hasData =
            data.goals.length > 0 ||
            data.context !== "" ||
            data.services.length > 0 ||
            data.deliverables.length > 0 ||
            data.timeline !== "" ||
            data.company !== "" ||
            data.contactMethod !== "" ||
            data.email !== "";

          if (hasData) {
            const confirmDiscard = window.confirm(
              "Are you sure you want to close? Your quote request progress will be lost."
            );
            if (!confirmDiscard) {
              e.preventDefault();
            }
          }
        }}
      >
        <DialogTitle className="sr-only">Get a Quote</DialogTitle>
        <DialogDescription className="sr-only">
          Multi-step project brief builder used to prepare a quote request.
        </DialogDescription>

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(157,172,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,181,123,0.16),transparent_28%)]" />

        <div className="relative p-4 md:p-6">
          <header className="mb-5 border-b border-[hsl(var(--border))]/55 pb-4 md:mb-6 md:pb-5">
            <p className="eyebrow">Hello Monday</p>
            <h3 className="mt-2 text-[34px] leading-[1.06] text-[hsl(var(--primary))] md:text-[46px]">
              Get a Quote
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[hsl(var(--foreground))]/80 md:text-base">
              Shape a project brief in four short steps. On submit, we open a
              prefilled email draft to `newbusiness@hellomonday.com`.
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
                {STEP_ITEMS.map((step) => {
                  const active = step.id === activeStep;

                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => setActiveStep(step.id)}
                      className={cn(
                        "w-full rounded-[1.4rem] border p-3 text-left transition-all",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "border-transparent bg-[hsl(var(--primary))] text-white shadow-[var(--shadow-soft)]"
                          : "border-[hsl(var(--border))]/60 bg-white/80 text-[hsl(var(--foreground))] hover:bg-white"
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

            <main className="space-y-4">
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

              <section className="site-card-solid space-y-2 p-4 md:p-5">
                <p className="eyebrow">
                  Step {activeItem.index} of 0{STEP_ITEMS.length}
                </p>
                <h4 className="text-[30px] leading-[1.06] text-[hsl(var(--primary))] md:text-[36px]">
                  {activeItem.title}
                </h4>
                <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]/80 md:text-base">
                  {activeItem.description}
                </p>
              </section>

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

              <div className="flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-2xl border-[hsl(var(--border))]/70 bg-white/78 text-[hsl(var(--primary))] hover:bg-white disabled:opacity-40"
                  onClick={goBack}
                  disabled={activeIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                {activeStep !== "contact" ? (
                  <Button
                    type="button"
                    className="rounded-2xl bg-[hsl(var(--secondary))] px-5 text-[hsl(var(--secondary-foreground))] hover:bg-[hsl(var(--secondary))]/90"
                    onClick={goNext}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>

              {submitSuccess ? (
                <div className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))]/60 bg-white/80 px-3 py-2 text-sm text-[hsl(var(--foreground))]/85">
                  <CheckCircle2 className="h-4 w-4 text-[hsl(var(--secondary))]" />
                  <span>Email draft opened. The brief was also copied to your clipboard.</span>
                </div>
              ) : null}
            </main>

            <aside className="hidden lg:block">
              <div className="sticky top-3">
                <SummaryCard data={data} copied={copied} onCopy={handleCopy} />
              </div>
            </aside>
          </div>

          <div className="mt-4 lg:hidden">
            <details className="site-card border-white/70 bg-white/80 p-4">
              <summary className="cursor-pointer list-none text-sm font-medium text-[hsl(var(--foreground))]">
                Review Summary
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
