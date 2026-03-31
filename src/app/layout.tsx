import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import PageLoadingBar from "@/components/ui/PageLoadingBar";
import Header from "@/components/Header";
import Footer from "@/components/sections/Footer";
import LenisProvider from "@/components/ui/LenisProvider";
import PageTransition from "@/components/ui/PageTransition";
import { AnimatePresence } from "framer-motion";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hello Monday / Dept.",
  description: "Reference-driven motion study of the Hello Monday homepage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <LenisProvider>
          <PageLoadingBar />
          <div aria-hidden className="site-ambient fixed inset-0 -z-10 overflow-hidden" />
          <div className="relative z-10 flex min-h-full flex-col">
            <Header />
            <main className="flex-1 flex flex-col">
              <AnimatePresence mode="wait">
                <PageTransition>
                  {children}
                </PageTransition>
              </AnimatePresence>
            </main>
            <Footer />
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
