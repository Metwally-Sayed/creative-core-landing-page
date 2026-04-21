import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["p", "h2", "h3", "h4", "a", "strong", "em", "ul", "ol", "li", "blockquote"];
const ALLOWED_ATTR = ["href", "target", "rel"];

interface Props {
  html: string;
}

export default function RichTextSection({ html }: Props) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
  });

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
