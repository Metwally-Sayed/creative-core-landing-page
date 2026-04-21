"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

import QuoteBriefDialog from "@/components/QuoteBriefDialog";
import type { FaqItemDb } from "@/lib/faq-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export default function FaqQuoteSection({ faqItems }: { faqItems: FaqItemDb[] }) {
  const t = useTranslations("faq");
  const [activeFaqId, setActiveFaqId] = useState<string>(faqItems[0]?.id ?? "");
  const [openFaq, setOpenFaq] = useState<string | undefined>(faqItems[0]?.id);

  const activeFaq = useMemo(
    () => faqItems.find((item) => item.id === activeFaqId) ?? faqItems[0],
    [activeFaqId, faqItems]
  );

  if (!activeFaq) return null;

  return (
    <section id="faq" className="site-section px-5 lg:px-20 pb-32">
      <div className="site-shell max-w-[1400px] px-0">
        <div className="mb-20 space-y-6">
          <p className="eyebrow text-secondary">{t("eyebrow")}</p>
          <h2 className="max-w-4xl text-5xl leading-[1.05] text-accent md:text-6xl lg:text-7xl">
            {t("title")} <br />
            <span className="text-muted-foreground/40 italic">{t("titleItalic")}</span>
          </h2>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Accordion
              type="single"
              collapsible
              value={openFaq}
              onValueChange={(value) => {
                setOpenFaq(value);
                if (value) {
                  setActiveFaqId(value);
                }
              }}
              className="space-y-4"
            >
              {faqItems.map((item, index) => {
                const isActive = activeFaqId === item.id;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                    }}
                    className={cn(
                      "site-card-solid px-6 transition-all duration-500",
                      isActive ? "ring-1 ring-accent/10 shadow-xl ltr:translate-x-2 rtl:-translate-x-2" : "opacity-60 grayscale hover:grayscale-0 hover:opacity-100"
                    )}
                  >
                    <AccordionItem value={item.id} className="border-0">
                      <AccordionTrigger
                        onFocus={() => setActiveFaqId(item.id)}
                        onMouseEnter={() => setActiveFaqId(item.id)}
                        className="py-6 text-left text-lg font-medium text-accent hover:no-underline md:text-2xl"
                      >
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-6 pt-2 text-base leading-relaxed text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                );
              })}
            </Accordion>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="site-card-navy sticky top-32 overflow-hidden p-8 lg:p-12 rounded-[2.5rem]"
          >
            <div className="pointer-events-none absolute inset-y-0 start-0 w-24 bg-gradient-to-e from-white/5 to-transparent" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFaq.id}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div>
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-secondary/60">
                    Insight Spotlight
                  </p>
                  <h3 className="text-4xl lg:text-5xl leading-[1.1] text-white font-serif italic">
                    {activeFaq.question}
                  </h3>
                </div>

                <p className="text-lg leading-relaxed text-white/60">
                  {activeFaq.preview}
                </p>

                {activeFaq.deliverables?.length ? (
                  <div className="space-y-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">
                      Standard Deliverables
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {activeFaq.deliverables.map((deliverable) => (
                        <li 
                          key={deliverable} 
                          className="px-4 py-2 rounded-full border border-white/10 text-xs text-white/80 bg-white/5"
                        >
                          {deliverable}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="pt-8 border-t border-white/10">
                  <p className="mb-6 text-sm text-white/50 italic">
                    "We value clarity and outcomes over billable hours."
                  </p>
                  <QuoteBriefDialog
                    triggerLabel={t("ctaButton")}
                    triggerClassName="w-full h-14 rounded-full bg-secondary text-secondary-foreground font-bold uppercase tracking-widest hover:scale-105 transition-transform"
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
