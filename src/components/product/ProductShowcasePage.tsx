"use client";

import { AnimatePresence, motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import QuoteBriefDialog from "@/components/QuoteBriefDialog";
import { cn } from "@/lib/utils";

type Collaboration = {
  name: string;
  projectCount: string;
  tag: string;
  summary: string;
  videoUrl: string;
};

type Testimonial = {
  body: string;
  author: string;
  role: string;
};

const HERO_VIDEO_URL =
  "https://videos.ctfassets.net/9uhkiji6mhey/4OVP1nwGH2c9BT5xbGeDr0/b5dcaf7807d8d76081477a652dcf0cd3/Stabilized_2.mp4";

const CONTACT_PHOTO_URL =
  "https://images.ctfassets.net/9uhkiji6mhey/28Q3fQaesKeoJJg72arVRJ/5ce181620b561a682ae409294335085b/Andreas_Photo.jpg?q=85";

const INTRO_PARAGRAPHS = [
  "Our product practice started by helping global teams refine the tools millions of people touch every day, then carried that same rigor into entirely new ideas.",
  "Since then we have partnered with startups and established product organizations to invent, prototype, launch, and continuously sharpen digital experiences.",
  "We are as comfortable turning a sketch into a lovable minimum viable release as we are pressure-testing a new opportunity, always with a human lens and a little theatre.",
];

const COLLABORATIONS: Collaboration[] = [
  {
    name: "Google",
    projectCount: "24 projects",
    tag: "Platform ecosystems",
    summary:
      "A decade of work across research, maps, privacy, and family products, where the challenge was making massive systems feel simple and human.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/5bYXoYyctrYNPssf6YH2s4/2fdda839e8a270b53a448e54a3bd7eae/hm-preview-google.mp4",
  },
  {
    name: "Strava",
    projectCount: "2 projects",
    tag: "Personalized storytelling",
    summary:
      "Turning performance data into an emotional annual recap that made each athlete feel seen, not just measured.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/7HeBTw9zPw4N9VXvmeBiPe/6ded6576282b063e4caec3fea65d08b5/product-preview-strava.mp4",
  },
  {
    name: "YouTube",
    projectCount: "11 projects",
    tag: "Launch and optimization",
    summary:
      "Concepting, shipping, and refining product moments for creators and audiences inside one of the world's largest platforms.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/1NYbSaz5M0Jp9DkynZ453k/ed8799ebbbcdd31f883e72e7c12ccef4/hm-preview-youtube.mp4",
  },
  {
    name: "Landrover",
    projectCount: "2 projects",
    tag: "Connected navigation",
    summary:
      "Designing a navigation concept for remote terrain where confidence, clarity, and exploration had to coexist.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/4qsXoksM17wRV0fpNjljlV/ccd03f4befd4281aec440a2bf709df81/hm-preview-land-rover.mp4",
  },
  {
    name: "META",
    projectCount: "3 projects",
    tag: "AI product futures",
    summary:
      "Early-stage product definition, prototyping, and interface design for AI-powered experiences across social surfaces.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/3nUxWo0QcwwwGWhjDbJDuZ/90ceca1e49cae6ef527c47230e32ceb2/product-preview-fb.mp4",
  },
  {
    name: "T-Mobile",
    projectCount: "3 projects",
    tag: "Physical plus digital",
    summary:
      "A product concept aimed at giving people healthier boundaries with the devices they carry every day.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/4yCrzgFCfQktQo4a0PYvdb/a903be912d56e8732ac44c0715bd4e27/hm-preview-t-mobile.mp4",
  },
  {
    name: "NPE",
    projectCount: "2 projects",
    tag: "Rapid experimentation",
    summary:
      "Concepting and prototyping experimental product directions fast enough to keep pace with a research-heavy team.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/6bAHyHjosnd13ltjnGWWyu/84f3350a401b4e963af55ebfa73ba053/product-preview-npe.mp4",
  },
  {
    name: "Intel",
    projectCount: "2 projects",
    tag: "Applied sports tech",
    summary:
      "Translating spatial tracking technology into an interface athletes and trainers could actually use under pressure.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/2ozFelttudQ1JzYDtZhkEs/dedcdcd1e97262e27e80d5eb823dec21/hm-preview-intel.mp4",
  },
  {
    name: "Samsung",
    projectCount: "2 projects",
    tag: "Future experience design",
    summary:
      "Helping define fresh product directions for connected devices and the interactions around them.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/5aZtW3coXzky1p7xyj0u0K/9bc8de5ca6a8e768863660f5a77aed47/product-preview-samsung.mp4",
  },
  {
    name: "Naver",
    projectCount: "2 projects",
    tag: "Commerce discovery",
    summary:
      "A fashion-led product concept for a discovery engine where browsing had to feel both fast and aspirational.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/2y4NOUM1Qa2cTxScbEGrNK/23a1b5fe86969dca0889b36711a13121/hm-preview-naver.mp4",
  },
  {
    name: "LEGO",
    projectCount: "2 projects",
    tag: "Playful education",
    summary:
      "Initiatives and product ideas for younger audiences where delight had to survive real-world constraints.",
    videoUrl:
      "https://videos.ctfassets.net/9uhkiji6mhey/7p9AtNAqFRUKvRSWM6xwCE/8afb3b22dbfb56f1cb2a67c698a0596b/hm-preview-lego-edu.mp4",
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    body:
      "\"They may look gentle, but they become a wonder weapon when a company needs a bold product idea sharpened into something real.\"",
    author: "Philipp Thesen",
    role: "Senior VP of Design, Deutsche Telekom AG",
  },
  {
    body:
      "\"Their product instinct is remarkably sharp, and they step into a team with almost no friction at all.\"",
    author: "Andy Dahley",
    role: "Head of Product and Design",
  },
  {
    body:
      "\"Working with them felt like strapping a rocket booster onto the thinking, not just polishing the interface.\"",
    author: "Mike Cleron",
    role: "Director at Google",
  },
  {
    body:
      "\"The team moved quickly, stayed adaptive, and brought a level of creativity that made the final experience materially better.\"",
    author: "Team Strava",
    role: "Year in Sport partners",
  },
];

function CollaborationPreview({
  item,
  compact = false,
}: {
  item: Collaboration;
  compact?: boolean;
}) {
  return (
    <motion.div
      key={item.name}
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -18, filter: "blur(10px)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-5"
    >
      <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#0f0f0f] shadow-[0_32px_80px_rgba(0,0,0,0.35)]">
        <div className={cn("relative overflow-hidden", compact ? "aspect-[1.15]" : "aspect-[0.86]")}>
          <video
            className="h-full w-full object-cover"
            src={item.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,6,0.04)_0%,rgba(6,6,6,0.14)_100%)]" />
        </div>
      </div>

      <div className="rounded-[1.6rem] border border-white/8 bg-white/[0.03] p-5 text-white/62">
        <div className="mb-3 flex items-center justify-between gap-4 text-[0.68rem] uppercase tracking-[0.28em] text-white/34">
          <span>{item.projectCount}</span>
          <span>{item.tag}</span>
        </div>
        <p className="text-[0.98rem] leading-[1.7]">{item.summary}</p>
      </div>
    </motion.div>
  );
}

export default function ProductShowcasePage() {
  const t = useTranslations("productPage");
  const [activeCollaboration, setActiveCollaboration] = useState(0);
  const [activeQuote, setActiveQuote] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const heroRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 24,
    mass: 0.45,
  });

  const mediaY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 90]);
  const mediaScale = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [1, 1] : [1.02, 1.12]);
  const titleY = useTransform(smoothProgress, [0, 1], prefersReducedMotion ? [0, 0] : [0, 72]);
  const introOpacity = useTransform(smoothProgress, [0, 0.7], [1, 0.7]);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveQuote((current) => (current + 1) % TESTIMONIALS.length);
    }, 5400);

    return () => window.clearInterval(interval);
  }, [prefersReducedMotion]);

  const activeItem = COLLABORATIONS[activeCollaboration];
  const activeTestimonial = TESTIMONIALS[activeQuote];

  return (
    <div className="relative overflow-hidden bg-[#161514] text-[#f5efe6]">
      <section ref={heroRef} className="relative isolate overflow-hidden px-5 pt-[7.75rem] lg:px-20 lg:pt-[9.5rem]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_34%),radial-gradient(circle_at_82%_18%,rgba(255,186,124,0.14),transparent_24%),linear-gradient(180deg,#181716_0%,#161514_100%)]"
        />

        <div className="site-shell relative max-w-[1220px] px-0">
          <div className="relative overflow-hidden rounded-[2.1rem] border border-white/8 bg-[#0f0f0f] shadow-[0_40px_90px_rgba(0,0,0,0.42)]">
            <motion.div style={{ y: mediaY, scale: mediaScale }} className="absolute inset-0">
              <video
                className="h-full w-full object-cover"
                src={HERO_VIDEO_URL}
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              />
            </motion.div>
            <div className="pointer-events-none relative aspect-[16/9] bg-[linear-gradient(180deg,rgba(8,8,8,0.16)_0%,rgba(8,8,8,0.4)_72%,rgba(8,8,8,0.68)_100%)]" />
          </div>

          <motion.div style={{ y: titleY }} className="relative z-10 mx-auto -mt-14 max-w-[16rem] pb-8 text-center sm:-mt-[4.5rem] sm:max-w-[22rem] md:-mt-24 md:max-w-[36rem] lg:max-w-[43rem] lg:pb-2">
            {["A booster", "rocket for", "digital product", "teams"].map((line, index) => (
              <motion.span
                key={line}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.8,
                  delay: 0.18 + index * 0.08,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="block font-serif text-[clamp(3.45rem,8vw,6.6rem)] leading-[0.88] tracking-[-0.07em] text-[#f3eee6]"
              >
                {line}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.section
        style={{ opacity: introOpacity }}
        className="relative border-b border-white/6 px-5 pb-20 pt-6 lg:px-20 lg:pb-24 lg:pt-10"
      >
        <div className="site-shell max-w-[1220px] px-0">
          <div className="grid gap-8 lg:grid-cols-[7rem_minmax(0,1fr)] lg:gap-14">
            <p className="pt-1 text-[0.7rem] uppercase tracking-[0.34em] text-white/30">{t("sectionLabel")}</p>

            <div className="space-y-6 text-[1.06rem] leading-[1.8] text-white/68 md:text-[1.12rem]">
              {INTRO_PARAGRAPHS.map((paragraph, index) => (
                <motion.p
                  key={paragraph}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  className="max-w-[52rem]"
                >
                  {paragraph}
                </motion.p>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <section className="relative px-5 py-[4.5rem] lg:px-20 lg:py-24">
        <div className="site-shell max-w-[1260px] px-0">
          <div className="mb-10 grid gap-3 border-b border-white/6 pb-4 text-[0.73rem] text-white/36 md:grid-cols-[minmax(0,1fr)_auto_auto]">
            <span>{t("ourWorkLabel")}</span>
            <span>
              {t("featuredCollaborations")} <span className="mx-2 opacity-40">/</span> {t("products")}
            </span>
            <Link href="/work" className="inline-flex items-center gap-2 transition-colors hover:text-white">
              {t("viewAllCases")} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,1fr)_22rem] xl:gap-16">
            <div className="border-y border-white/6">
              {COLLABORATIONS.map((item, index) => {
                const isActive = index === activeCollaboration;

                return (
                  <motion.button
                    key={item.name}
                    type="button"
                    initial={{ opacity: 0, y: 22 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.45, delay: index * 0.03 }}
                    onMouseEnter={() => setActiveCollaboration(index)}
                    onFocus={() => setActiveCollaboration(index)}
                    onClick={() => setActiveCollaboration(index)}
                    className="group relative block w-full border-b border-white/6 px-0 py-6 text-start last:border-b-0 md:py-8"
                  >
                    <div className="grid gap-4 md:grid-cols-[7rem_minmax(0,1fr)] md:gap-8 xl:grid-cols-[7rem_minmax(0,1fr)_8rem]">
                      <p className="pt-2 text-[0.7rem] uppercase tracking-[0.24em] text-white/28">
                        {item.projectCount}
                      </p>

                      <div>
                        <div className="flex flex-wrap items-end justify-between gap-4">
                          <h2
                            className={cn(
                              "font-serif text-[clamp(3.3rem,9vw,6rem)] leading-[0.9] tracking-[-0.07em] transition-colors duration-500",
                              isActive ? "text-white" : "text-white/24 group-hover:text-white/68"
                            )}
                          >
                            {item.name}
                          </h2>
                          <span
                            className={cn(
                              "hidden text-[0.68rem] uppercase tracking-[0.28em] transition-colors md:block",
                              isActive ? "text-white/42" : "text-white/16 group-hover:text-white/34"
                            )}
                          >
                            {item.tag}
                          </span>
                        </div>

                        <AnimatePresence initial={false}>
                          {isActive ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <p className="max-w-[38rem] pt-4 text-[0.98rem] leading-[1.75] text-white/62">
                                {item.summary}
                              </p>

                              <div className="pt-6 xl:hidden">
                                <CollaborationPreview item={item} compact />
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>

                      <div className="hidden items-start justify-end pt-2 xl:flex">
                        <span
                          className={cn(
                            "text-[0.68rem] uppercase tracking-[0.28em] transition-colors",
                            isActive ? "text-white/44" : "text-white/10"
                          )}
                        >
                          {isActive ? t("previewLive") : ""}
                        </span>
                      </div>
                    </div>

                    {isActive ? (
                      <motion.span
                        layoutId="product-active-line"
                        className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,rgba(255,255,255,0.52)_0%,rgba(255,255,255,0.16)_48%,rgba(255,255,255,0)_100%)]"
                      />
                    ) : null}
                  </motion.button>
                );
              })}
            </div>

            <div className="hidden xl:block">
              <div className="sticky top-28">
                <AnimatePresence mode="wait">
                  <CollaborationPreview item={activeItem} />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/6 bg-[#1c1a19] px-5 py-20 lg:px-20 lg:py-24">
        <div className="site-shell max-w-[1200px] px-0">
          <p className="mb-10 text-[0.7rem] uppercase tracking-[0.34em] text-white/28">{t("quotesLabel")}</p>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeQuote}
              initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -22, filter: "blur(12px)" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[68rem]"
            >
              <blockquote className="font-serif text-[clamp(2.2rem,4.8vw,4.75rem)] leading-[1.03] tracking-[-0.05em] text-white">
                {activeTestimonial.body}
              </blockquote>
              <p className="mt-7 text-sm text-white/56">
                <span className="me-2 inline-block h-2.5 w-2.5 rounded-full bg-white" />
                {activeTestimonial.author} — {activeTestimonial.role}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-12 flex flex-wrap gap-4">
            {TESTIMONIALS.map((item, index) => (
              <button
                key={item.author}
                type="button"
                onClick={() => setActiveQuote(index)}
                className="group flex items-center gap-2"
                aria-label={`Show quote from ${item.author}`}
              >
                <span className="relative block h-[2px] w-12 overflow-hidden rounded-full bg-white/12">
                  {index === activeQuote ? (
                    <motion.span
                      key={activeQuote}
                      initial={prefersReducedMotion ? false : { scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 5.4,
                        ease: "linear",
                      }}
                      className="absolute inset-0 origin-start rounded-full bg-white"
                    />
                  ) : (
                    <span className="absolute inset-0 rounded-full bg-white/22" />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-20 lg:py-24">
        <div className="site-shell max-w-[1220px] px-0">
          <div className="mb-12 space-y-3">
            <p className="text-[0.7rem] uppercase tracking-[0.34em] text-white/28">{t("contactLabel")}</p>
            <h2 className="max-w-[28rem] font-serif text-[clamp(3rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.06em] text-white">
              {t("contactHeading")}
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(21rem,0.72fr)] lg:gap-16">
            <div className="space-y-8">
              <div className="max-w-[34rem] space-y-5 text-[1.04rem] leading-[1.8] text-white/66">
                <p>{t("contactBody")}</p>
                <a
                  href="mailto:product@hellomonday.com"
                  className="inline-flex items-center gap-3 border-b border-white/22 pb-2 font-serif text-[1.5rem] text-white transition-colors hover:text-[#f6c38f]"
                >
                  product@hellomonday.com
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>

              <QuoteBriefDialog
                triggerLabel={t("startBriefButton")}
                triggerClassName="inline-flex h-[3.25rem] rounded-full border border-white/12 bg-white/[0.04] px-6 text-[0.72rem] uppercase tracking-[0.28em] text-white transition-colors hover:bg-white/[0.08]"
              />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55 }}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#211f1e]"
            >
              <div className="relative aspect-[1.08] overflow-hidden">
                <img
                  src={CONTACT_PHOTO_URL}
                  alt="Andreas Anderskou"
                  className="h-full w-full object-cover grayscale"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.04)_0%,rgba(10,10,10,0.2)_100%)]" />
              </div>

              <div className="space-y-2 p-6 text-white">
                <p className="font-serif text-[1.45rem]">Andreas Anderskou</p>
                <p className="text-sm text-white/56">{t("managingPartnerTitle")}</p>
                <a
                  href="mailto:andreas@hellomonday.com"
                  className="inline-flex items-center gap-2 pt-3 text-sm text-white/78 transition-colors hover:text-[#f6c38f]"
                >
                  andreas@hellomonday.com
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
