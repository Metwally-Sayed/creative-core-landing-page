"use client";

import type { CSSProperties } from 'react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowUp } from 'lucide-react';
import { usePathname } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import type { Location } from '@/lib/locations-data';
import LocaleSwitch from '@/components/LocaleSwitch';

interface ContactItem {
  label: string;
  sublabel: string;
  value: string;
  href?: string;
}

function AnimatedLink({ href, children, className = "" }: { href: string; children: React.ReactNode; className?: string }) {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group flex items-center gap-2 ${className}`}
    >
      <motion.span
        animate={{
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.5,
          width: isHovered ? 10 : 0,
        }}
        transition={{ duration: 0.22 }}
        className="inline-block h-2.5 rounded-full bg-[hsl(var(--secondary))] origin-left"
      />
      <span className="transition-opacity group-hover:opacity-80">{children}</span>
    </a>
  );
}

function LocationCard({ location }: { location: Location }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={location.map_url || undefined}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center mb-2">
        <motion.span
          animate={{
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1 : 0.5,
            width: isHovered ? 10 : 0,
            marginRight: isHovered ? 8 : 0,
          }}
          transition={{ duration: 0.22 }}
          className="inline-block h-2.5 rounded-full bg-[hsl(var(--secondary))] origin-left"
        />
        <h4 className="font-serif text-lg text-[color:var(--footer-fg)] transition-opacity group-hover:opacity-80">
          {location.name}
        </h4>
      </div>
      {(location.address_lines ?? []).map((line, i) => (
        <p key={i} className="text-sm text-[color:var(--footer-muted)]">
          {line}
        </p>
      ))}
    </a>
  );
}

function ContactCard({ item }: { item: ContactItem }) {
  const tFooter = useTranslations("footer");
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (item.value.includes('@')) {
      e.preventDefault();
      navigator.clipboard.writeText(item.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col">
      <p className="mb-4 text-xs tracking-wider text-[color:var(--footer-muted)] opacity-80">{item.label}</p>
      <a
        href={item.href}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group block border-t border-[color:var(--footer-border)] pt-6"
      >
        <p className="mb-2 text-sm text-[color:var(--footer-muted)]">{item.sublabel}</p>
        <div className="flex items-center gap-2">
          <motion.span
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.5,
              width: isHovered ? 10 : 0,
            }}
            transition={{ duration: 0.22 }}
            className="inline-block h-2.5 rounded-full bg-[hsl(var(--secondary))] origin-left"
          />
          <span className="font-serif text-[1.15rem] leading-tight text-[color:var(--footer-fg)] transition-opacity group-hover:opacity-80 md:text-xl lg:text-2xl">
            {item.value}
          </span>
          {copied && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-xs text-[hsl(var(--secondary))] ms-2"
            >
              <Check className="w-3 h-3" />
              {tFooter("copied")}
            </motion.span>
          )}
        </div>
      </a>
    </div>
  );
}

export default function Footer({ locations }: { locations: Location[] }) {
  const tFooter = useTranslations("footer");
  const pathname = usePathname() || '';
  const isProductPage = pathname.startsWith('/product');

  const contactItems: ContactItem[] = [
    {
      label: tFooter("collaborateLabel"),
      sublabel: tFooter("collaborateSublabel"),
      value: 'newbusiness@hellomonday.com',
      href: 'mailto:newbusiness@hellomonday.com',
    },
    {
      label: tFooter("generalLabel"),
      sublabel: tFooter("generalSublabel"),
      value: 'hello@hellomonday.com',
      href: 'mailto:hello@hellomonday.com',
    },
    {
      label: tFooter("careersLabel"),
      sublabel: tFooter("careersSublabel"),
      value: tFooter("applyHere"),
      href: '#careers',
    },
    {
      label: tFooter("internshipsLabel"),
      sublabel: tFooter("internshipsSublabel"),
      value: tFooter("applyHere"),
      href: '#careers',
    },
  ];

  const footerThemeStyles = {
    '--footer-bg': isProductPage ? '#f3efe6' : 'hsl(var(--accent))',
    '--footer-fg': isProductPage ? 'hsl(var(--accent))' : '#ffffff',
    '--footer-muted': isProductPage ? 'hsl(var(--accent) / 0.62)' : 'rgba(255,255,255,0.62)',
    '--footer-link': isProductPage ? 'hsl(var(--accent) / 0.42)' : 'rgba(255,255,255,0.4)',
    '--footer-border': isProductPage ? 'hsl(var(--accent) / 0.14)' : 'rgba(255,255,255,0.14)',
  } as CSSProperties;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer
        className="bg-[var(--footer-bg)] text-[color:var(--footer-fg)] px-5 pb-0 pt-16 lg:px-20 lg:pt-32"
        id="contact"
        style={footerThemeStyles}
      >
        <div className="site-shell max-w-[1240px] mx-auto px-0 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">
            {/* Logo/Illustration */}
            <div className="lg:col-span-4 flex items-center justify-center lg:items-start lg:pt-8 text-[color:var(--footer-fg)]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <svg
                viewBox="0 0 120 140"
                className="w-24 h-auto"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Person at computer illustration */}
                <ellipse cx="60" cy="25" rx="15" ry="18" />
                <path d="M45 20 Q45 5 60 5 Q75 5 75 20" fill="hsl(var(--secondary))" />
                <line x1="60" y1="43" x2="60" y2="55" />
                <path d="M40 55 Q35 80 40 100 L40 120" />
                <path d="M80 55 Q85 80 80 100 L80 120" />
                <ellipse cx="40" cy="125" rx="8" ry="5" />
                <ellipse cx="80" cy="125" rx="8" ry="5" />
                <path d="M35 70 Q25 85 30 95" />
                <path d="M85 70 Q95 85 90 95" />
                <rect x="45" y="50" width="30" height="25" rx="2" />
                <line x1="50" y1="58" x2="70" y2="58" />
                <line x1="50" y1="65" x2="65" y2="65" />
                <rect x="35" y="75" width="50" height="8" rx="2" />
              </svg>
            </motion.div>
          </div>

            {/* Contact and Maps Column */}
            <div className="lg:col-span-8 flex flex-col gap-24">
              {/* Contact Info Grid */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.2
                    }
                  }
                }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-16 lg:gap-x-24"
              >
                {contactItems.map((item) => (
                  <motion.div
                    key={item.label}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                    }}
                  >
                    <ContactCard item={item} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Locations */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.4
                    }
                  }
              }}
              >
                <p className="mb-6 text-sm text-[color:var(--footer-link)] uppercase tracking-[0.2em]">{tFooter("ourWorlds")}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-16 gap-y-16 lg:gap-x-24">
                  {locations.map((location) => (
                    <motion.div
                      key={location.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                      }}
                    >
                      <LocationCard location={location} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 border-t border-[color:var(--footer-border)] pt-12">
                <div className="flex gap-8">
                  {['LinkedIn', 'Instagram', 'Twitter', 'Vimeo'].map((platform) => (
                    <a
                      key={platform}
                      href="#"
                      className="text-xs font-bold uppercase tracking-widest text-[color:var(--footer-link)] transition-colors hover:text-[color:var(--footer-fg)]"
                    >
                      {platform}
                    </a>
                  ))}
                </div>
                <div className="flex items-center gap-6">
                  <LocaleSwitch />
                  <AnimatedLink
                    href="https://www.deptagency.com/en-nl/privacy-policy/"
                    className="text-xs text-[color:var(--footer-link)] hover:text-[color:var(--footer-fg)]"
                  >
                    {tFooter("globalPrivacy")}
                  </AnimatedLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      
        {/* Animated Back to Top Button */}
        <div className="w-full flex justify-center mt-16 md:mt-24 relative z-10 overflow-hidden">
          <motion.button 
            initial={{ y: "100%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: false, margin: "50px" }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            onClick={scrollToTop}
            className="relative flex items-center justify-center w-[280px] sm:w-[400px] md:w-[524px] h-[30px] sm:h-[43px] md:h-[55px] group cursor-pointer focus:outline-none"
          >
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 524 55" className="absolute inset-0 w-full h-full text-[#020509] transition-colors group-hover:text-[#000000]">
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <path d="M0,55 C107.57331,55 172.397965,0 261.914001,0 C351.430038,0 418.082695,55 524.041347,55 C630,55 -108,55 0,55 Z" className="bulge" fill="currentColor"></path>
              </g>
            </svg>
            <span className="relative z-10 text-white text-[10px] md:text-xs tracking-[0.15em] font-medium flex items-center gap-2 mt-1 md:mt-2 transition-transform group-hover:-translate-y-0.5">
              {tFooter("backToTop")}
              <ArrowUp className="w-3 h-3" strokeWidth={3} />
            </span>
          </motion.button>
        </div>
      </footer>
    </>
  );
}
