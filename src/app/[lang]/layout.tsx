import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import {
  Inter,
  Playfair_Display,
  IBM_Plex_Sans_Arabic,
  Noto_Naskh_Arabic,
} from "next/font/google";
import { AnimatePresence } from "framer-motion";
import { isLocale, localeDirection, locales } from "@/i18n/config";
import PageLoadingBar from "@/components/ui/PageLoadingBar";
import Header from "@/components/Header";
import Footer from "@/components/sections/Footer";
import { getLocations } from "@/lib/locations-data";
import { getSettings } from "@/lib/page-data";
import { getNavLinks } from "@/lib/nav-data";
import LenisProvider from "@/components/ui/LenisProvider";
import PageTransition from "@/components/ui/PageTransition";
import "../globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

const notoNaskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-noto-naskh",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: settings.seo_title || settings.site_name || "Creative Core",
    description: settings.seo_description || "Brand strategy, identity, content, and 3D visuals that convert.",
    openGraph: settings.seo_og_image_url
      ? { images: [settings.seo_og_image_url] }
      : undefined,
  };
}

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  setRequestLocale(lang);
  const messages = await getMessages();
  const [locations, settings, navLinks] = await Promise.all([
    getLocations(),
    getSettings(),
    getNavLinks(),
  ]);
  const dir = localeDirection[lang];

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${inter.variable} ${playfair.variable} ${plexArabic.variable} ${notoNaskh.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <NextIntlClientProvider messages={messages} locale={lang}>
          <LenisProvider>
            <Suspense fallback={null}>
              <PageLoadingBar />
            </Suspense>
            <div aria-hidden className="site-ambient fixed inset-0 -z-10 overflow-hidden" />
            <div className="relative z-10 flex min-h-full flex-col">
              <Header navLinks={navLinks} settings={settings} />
              <main className="flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                  <PageTransition>
                    {children}
                  </PageTransition>
                </AnimatePresence>
              </main>
              <Footer locations={locations} settings={settings} />
            </div>
          </LenisProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
