import Link from "next/link";
import type { ReactNode } from "react";

import type { HomepageBlock, LexicalNode, LexicalValue } from "@/lib/cms-homepage";

interface RichTextContentRendererProps {
  block: HomepageBlock;
}

const TEXT_FORMAT = {
  bold: 1,
  italic: 1 << 1,
  strikethrough: 1 << 2,
  underline: 1 << 3,
  code: 1 << 4,
};

function applyTextFormatting(text: string, format?: number | null): ReactNode {
  let content: ReactNode = text;

  if (!format) {
    return content;
  }

  if (format & TEXT_FORMAT.code) {
    content = <code className="rounded bg-[hsl(var(--accent))]/8 px-1.5 py-0.5 text-[0.95em]">{content}</code>;
  }

  if (format & TEXT_FORMAT.underline) {
    content = <span className="underline decoration-[hsl(var(--secondary))]/60 underline-offset-4">{content}</span>;
  }

  if (format & TEXT_FORMAT.strikethrough) {
    content = <span className="line-through">{content}</span>;
  }

  if (format & TEXT_FORMAT.italic) {
    content = <em>{content}</em>;
  }

  if (format & TEXT_FORMAT.bold) {
    content = <strong>{content}</strong>;
  }

  return content;
}

function renderLexicalChildren(nodes: LexicalNode[] | null | undefined): ReactNode[] {
  return (nodes ?? []).map((node, index) => renderLexicalNode(node, `${node.type ?? "node"}-${index}`));
}

function renderLexicalNode(node: LexicalNode, key: string): ReactNode {
  const children = renderLexicalChildren(node.children);
  const text = node.text ?? "";

  switch (node.type) {
    case "heading": {
      const headingClass = {
        h1: "text-5xl lg:text-7xl",
        h2: "text-4xl lg:text-6xl",
        h3: "text-3xl lg:text-5xl",
        h4: "text-2xl lg:text-4xl",
      }[node.tag ?? "h2"] || "text-3xl lg:text-5xl";

      return (
        <h3 key={key} className={`mt-8 font-serif text-[hsl(var(--accent))] ${headingClass}`}>
          {children}
        </h3>
      );
    }
    case "paragraph":
      return (
        <p key={key} className="mt-6 max-w-2xl text-xl text-muted-foreground">
          {children.length > 0 ? children : null}
        </p>
      );
    case "list": {
      const Component = node.listType === "number" ? "ol" : "ul";
      const listClass =
        node.listType === "number"
          ? "mt-6 list-decimal space-y-3 pl-6 text-lg text-muted-foreground"
          : "mt-6 list-disc space-y-3 pl-6 text-lg text-muted-foreground";

      return (
        <Component key={key} className={listClass}>
          {children}
        </Component>
      );
    }
    case "listitem":
      return <li key={key}>{children}</li>;
    case "quote":
      return (
        <blockquote
          key={key}
          className="mt-8 border-l-2 border-[hsl(var(--secondary))] pl-6 font-serif text-2xl italic leading-relaxed text-[hsl(var(--accent))]"
        >
          {children}
        </blockquote>
      );
    case "link": {
      const href = node.url || node.fields?.url || "#";
      return (
        <a
          key={key}
          href={href}
          className="text-[hsl(var(--secondary))] underline decoration-[hsl(var(--secondary))]/60 underline-offset-4"
        >
          {children}
        </a>
      );
    }
    case "linebreak":
      return <br key={key} />;
    case "text":
      return <span key={key}>{applyTextFormatting(text, node.format)}</span>;
    default:
      if (text) {
        return <span key={key}>{applyTextFormatting(text, node.format)}</span>;
      }

      return <span key={key}>{children}</span>;
  }
}

function renderRichText(value: HomepageBlock["richText"]): ReactNode {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return <p className="mt-6 max-w-2xl text-xl text-muted-foreground">{value}</p>;
  }

  const lexical = value as LexicalValue;
  return renderLexicalChildren(lexical.root?.children);
}

export default function RichTextContentRenderer({ block }: RichTextContentRendererProps) {
  const eyebrow = String(block.eyebrow || "");
  const heading = String(block.heading || "");
  const primaryCtaLabel = String(block.primaryCtaLabel || "");
  const primaryCtaHref = String(block.primaryCtaHref || "#");
  const secondaryCtaLabel = String(block.secondaryCtaLabel || "");
  const secondaryCtaHref = String(block.secondaryCtaHref || "#");
  const layoutVariant = String(block.layoutVariant || "centered");
  const richTextContent = renderRichText(block.richText);

  const layoutClasses = {
    centered: "text-center [&_p]:mx-auto [&_ul]:mx-auto [&_ol]:mx-auto [&_blockquote]:mx-auto",
    left: "text-left",
    split: "grid gap-10 md:grid-cols-2 md:items-start text-left",
  }[layoutVariant] || "text-center";

  const ctaAlignment =
    layoutVariant === "centered" ? "justify-center" : "justify-start";

  return (
    <section className="site-section px-5 py-24 lg:px-20">
      <div className={`site-shell max-w-[1400px] ${layoutClasses}`}>
        {(eyebrow || heading || richTextContent) && (
          <div className="mb-12">
            {eyebrow && <p className="eyebrow text-secondary">{eyebrow}</p>}
            {heading && (
              <h2 className="mt-4 text-5xl text-accent lg:text-7xl">
                {heading}
              </h2>
            )}
            {richTextContent}
          </div>
        )}

        {(primaryCtaLabel || secondaryCtaLabel) && (
          <div className={`flex flex-wrap gap-4 ${ctaAlignment}`}>
            {primaryCtaLabel && (
              <Link href={primaryCtaHref} className="btn-primary">
                {primaryCtaLabel}
              </Link>
            )}
            {secondaryCtaLabel && (
              <Link href={secondaryCtaHref} className="btn-outline">
                {secondaryCtaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
