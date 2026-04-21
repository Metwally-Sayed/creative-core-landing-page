import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p", "h2", "h3", "h4", "a", "strong", "em", "ul", "ol", "li", "blockquote"];
const ALLOWED_ATTR = ["href", "target", "rel"];

// Restrict href to safe schemes
const SAFE_URI_REGEXP = /^(https?:|mailto:|\/|#)/i;

interface Props {
  html: string;
}

export default function RichTextSection({ html }: Props) {
  const purify = DOMPurify;

  // After sanitization: enforce rel on blank-target links + strip unsafe hrefs
  purify.addHook("afterSanitizeAttributes", (node) => {
    if (node.tagName === "A") {
      if (node.getAttribute("target") === "_blank") {
        node.setAttribute("rel", "noopener noreferrer");
      }
      const href = node.getAttribute("href");
      if (href && !SAFE_URI_REGEXP.test(href)) {
        node.removeAttribute("href");
      }
    }
  });

  const clean = purify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });

  // Remove hook after use to avoid accumulation across calls
  purify.removeAllHooks();

  if (!clean) return null;

  return (
    <section className="py-16 px-5 md:px-20">
      <div
        className="mx-auto max-w-3xl prose prose-neutral"
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    </section>
  );
}
