import type { Metadata } from "next";
import { Suspense } from "react";
import { AnimatePresence } from "framer-motion";
import { Inter, Playfair_Display } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/sections/Footer";
import { QuoteFormProvider } from "@/components/providers/QuoteFormProvider";
import LenisProvider from "@/components/ui/LenisProvider";
import PageLoadingBar from "@/components/ui/PageLoadingBar";
import PageTransition from "@/components/ui/PageTransition";
import { getQuoteFormData } from "@/lib/cms-quote-form";
import { getSiteSettingsData } from "@/lib/cms-site-settings";
import "../globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Creative Core",
  description: "Reference-driven motion study of the Creative Core website.",
};

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [siteSettings, quoteForm] = await Promise.all([
    getSiteSettingsData(),
    getQuoteFormData(),
  ]);

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full overflow-x-clip">
        <QuoteFormProvider data={quoteForm}>
          <LenisProvider>
            <Suspense fallback={null}>
              <PageLoadingBar />
            </Suspense>
            <div aria-hidden className="site-ambient fixed inset-0 -z-10 overflow-hidden" />
            <div className="relative z-10 flex min-h-full flex-col overflow-x-clip">
              <Header siteSettings={siteSettings} />
              <main className="flex flex-1 flex-col overflow-x-clip">
                <AnimatePresence mode="wait">
                  <PageTransition>{children}</PageTransition>
                </AnimatePresence>
              </main>
              <Footer siteSettings={siteSettings} />
            </div>
          </LenisProvider>
        </QuoteFormProvider>
      </body>
    </html>
  );
}
