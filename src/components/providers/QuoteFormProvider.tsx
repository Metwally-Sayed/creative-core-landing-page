"use client";

import { createContext, useContext } from "react";

import type { QuoteFormData } from "@/lib/cms-quote-form";

const QuoteFormContext = createContext<QuoteFormData | null>(null);

export function QuoteFormProvider({
  children,
  data,
}: {
  children: React.ReactNode;
  data: QuoteFormData;
}) {
  return <QuoteFormContext.Provider value={data}>{children}</QuoteFormContext.Provider>;
}

export function useQuoteForm() {
  const value = useContext(QuoteFormContext);

  if (!value) {
    throw new Error("QuoteFormProvider is required for QuoteBriefDialog.");
  }

  return value;
}
