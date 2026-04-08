import "server-only";
import { draftMode } from "next/headers";
import { cache } from "react";

import { getPayload } from "payload";

import { studioLocations } from "@/lib/studio-locations";
import config from "@payload-config";

type UploadDoc = {
  id?: number | string;
  url?: string | null;
  thumbnailURL?: string | null;
};

type UploadValue = number | string | UploadDoc | null | undefined;

export interface NavItem {
  label: string;
  href: string;
  openInNewTab: boolean;
}

export interface ContactCard {
  label: string;
  sublabel: string;
  value: string;
  href?: string;
  copyToClipboard: boolean;
}

export interface LocationData {
  city: string;
  addressLines: string[];
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
}

export interface ShowQuoteCtaRules {
  hideOnWork: boolean;
  hideOnServices: boolean;
  hideOnAbout: boolean;
  hideOnProduct: boolean;
  hideOnProjects: boolean;
}

export interface SiteSettingsData {
  logoWordmarkPrimary?: { url: string };
  logoWordmarkSecondary?: { url: string };
  navItems: NavItem[];
  quoteTriggerLabel: string;
  mobileMenuLabel: string;
  storiesHref: string;
  showQuoteCtaRules: ShowQuoteCtaRules;
  contactCards: ContactCard[];
  locations: LocationData[];
  socialLinks: SocialLink[];
  privacyLabel: string;
  privacyHref: string;
  backToTopLabel: string;
}

type SiteSettingsDoc = {
  logoWordmarkPrimary?: UploadValue;
  logoWordmarkSecondary?: UploadValue;
  navItems?: {
    label?: string;
    href?: string;
    openInNewTab?: boolean;
  }[];
  quoteTriggerLabel?: string;
  mobileMenuLabel?: string;
  storiesHref?: string;
  showQuoteCtaRules?: Partial<ShowQuoteCtaRules>;
  contactCards?: {
    label?: string;
    sublabel?: string;
    value?: string;
    href?: string;
    copyToClipboard?: boolean;
  }[];
  locations?: {
    city?: string;
    addressLines?: { line?: string }[];
    href?: string;
  }[];
  socialLinks?: {
    label?: string;
    href?: string;
  }[];
  privacyLabel?: string;
  privacyHref?: string;
  backToTopLabel?: string;
};

const getPayloadClient = cache(async () => getPayload({ config }));

function cleanText(value: string | undefined): string {
  return value?.trim() ?? "";
}

function asUploadURL(upload: UploadValue): string {
  if (!upload || typeof upload === "number" || typeof upload === "string") {
    return "";
  }

  return upload.url ?? upload.thumbnailURL ?? "";
}

function getDefaultSiteSettingsData(): SiteSettingsData {
  return {
    navItems: [
      { label: "Work", href: "/work", openInNewTab: false },
      { label: "Services", href: "/services", openInNewTab: false },
      { label: "About", href: "/about", openInNewTab: false },
      { label: "Stories", href: "/work", openInNewTab: false },
      { label: "Product", href: "/product", openInNewTab: false },
    ],
    quoteTriggerLabel: "Get Quote",
    mobileMenuLabel: "Menu",
    storiesHref: "/work",
    showQuoteCtaRules: {
      hideOnWork: true,
      hideOnServices: true,
      hideOnAbout: true,
      hideOnProduct: true,
      hideOnProjects: false,
    },
    contactCards: [
      {
        label: "Want to collaborate?",
        sublabel: "Work with us",
        value: "newbusiness@hellomonday.com",
        href: "mailto:newbusiness@hellomonday.com",
        copyToClipboard: true,
      },
      {
        label: "Want to say hi?",
        sublabel: "General inquiries",
        value: "hello@hellomonday.com",
        href: "mailto:hello@hellomonday.com",
        copyToClipboard: true,
      },
      {
        label: "Want to join us?",
        sublabel: "Become a Mondayteer",
        value: "Apply here",
        href: "#careers",
        copyToClipboard: false,
      },
      {
        label: "Want to learn?",
        sublabel: "Become an intern",
        value: "Apply here",
        href: "#careers",
        copyToClipboard: false,
      },
    ],
    locations: studioLocations.map((location) => ({
      city: location.city,
      addressLines: location.address,
      href: location.href,
    })),
    socialLinks: [
      { label: "LinkedIn", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "Vimeo", href: "#" },
    ],
    privacyLabel: "Global Privacy Statement",
    privacyHref: "https://www.deptagency.com/en-nl/privacy-policy/",
    backToTopLabel: "Back to top",
  };
}

export const getSiteSettingsData = cache(async (): Promise<SiteSettingsData> => {
  const { isEnabled: preview } = await draftMode();
  const payload = await getPayloadClient();
  const fallback = getDefaultSiteSettingsData();

  try {
    const result = await payload.findGlobal({
      slug: "siteSettings",
      depth: 1,
      draft: preview,
    });

    const doc = result as SiteSettingsDoc | null;

    if (!doc) {
      return fallback;
    }

    const primaryLogo = asUploadURL(doc.logoWordmarkPrimary);
    const secondaryLogo = asUploadURL(doc.logoWordmarkSecondary);
    const storiesHref = cleanText(doc.storiesHref) || fallback.storiesHref;
    const navItems = (doc.navItems ?? [])
      .map((item) => ({
        label: cleanText(item.label),
        href:
          cleanText(item.href) ||
          (cleanText(item.label).toLowerCase() === "stories" ? storiesHref : ""),
        openInNewTab: item.openInNewTab ?? false,
      }))
      .filter((item) => item.label && item.href);

    const contactCards = (doc.contactCards ?? [])
      .map((card) => ({
        label: cleanText(card.label),
        sublabel: cleanText(card.sublabel),
        value: cleanText(card.value),
        href: cleanText(card.href),
        copyToClipboard: card.copyToClipboard ?? false,
      }))
      .filter((card) => card.label && card.sublabel && card.value);

    const locations = (doc.locations ?? [])
      .map((loc) => ({
        city: cleanText(loc.city),
        addressLines: (loc.addressLines ?? [])
          .map((line) => cleanText(line.line))
          .filter(Boolean),
        href: cleanText(loc.href),
      }))
      .filter((loc) => loc.city && loc.addressLines.length > 0);

    const socialLinks = (doc.socialLinks ?? [])
      .map((link) => ({
        label: cleanText(link.label),
        href: cleanText(link.href),
      }))
      .filter((link) => link.label && link.href);

    return {
      logoWordmarkPrimary: primaryLogo ? { url: primaryLogo } : undefined,
      logoWordmarkSecondary: secondaryLogo ? { url: secondaryLogo } : undefined,
      navItems: navItems.length > 0 ? navItems : fallback.navItems,
      quoteTriggerLabel: cleanText(doc.quoteTriggerLabel) || fallback.quoteTriggerLabel,
      mobileMenuLabel: cleanText(doc.mobileMenuLabel) || fallback.mobileMenuLabel,
      storiesHref,
      showQuoteCtaRules: {
        hideOnWork: doc.showQuoteCtaRules?.hideOnWork ?? fallback.showQuoteCtaRules.hideOnWork,
        hideOnServices:
          doc.showQuoteCtaRules?.hideOnServices ?? fallback.showQuoteCtaRules.hideOnServices,
        hideOnAbout:
          doc.showQuoteCtaRules?.hideOnAbout ?? fallback.showQuoteCtaRules.hideOnAbout,
        hideOnProduct:
          doc.showQuoteCtaRules?.hideOnProduct ?? fallback.showQuoteCtaRules.hideOnProduct,
        hideOnProjects:
          doc.showQuoteCtaRules?.hideOnProjects ?? fallback.showQuoteCtaRules.hideOnProjects,
      },
      contactCards: contactCards.length > 0 ? contactCards : fallback.contactCards,
      locations: locations.length > 0 ? locations : fallback.locations,
      socialLinks: socialLinks.length > 0 ? socialLinks : fallback.socialLinks,
      privacyLabel: cleanText(doc.privacyLabel) || fallback.privacyLabel,
      privacyHref: cleanText(doc.privacyHref) || fallback.privacyHref,
      backToTopLabel: cleanText(doc.backToTopLabel) || fallback.backToTopLabel,
    };
  } catch {
    return fallback;
  }
});
