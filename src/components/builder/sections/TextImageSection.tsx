interface Props {
  eyebrow?: string;
  title?: string;
  body?: string[];
  image_url?: string;
  image_alt?: string;
  image_layout?: "left" | "right";
  tone?: "light" | "navy";
}

export default function TextImageSection({
  eyebrow,
  title,
  body = [],
  image_url,
  image_alt,
  image_layout = "right",
  tone = "light",
}: Props) {
  const isNavy = tone === "navy";
  const imageFirst = image_layout === "left";

  return (
    <section
      className={`py-20 px-5 md:px-20 ${isNavy ? "bg-[hsl(var(--accent))] text-white" : "bg-background text-foreground"}`}
    >
      <div className="mx-auto max-w-7xl">
        <div className={`grid grid-cols-1 items-center gap-12 md:grid-cols-2`}>
          <div className={imageFirst ? "md:order-2" : ""}>
            {eyebrow && (
              <p className={`mb-3 text-xs font-bold uppercase tracking-widest ${isNavy ? "text-white/60" : "text-[hsl(var(--secondary))]"}`}>
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mb-6 font-serif text-3xl font-bold leading-snug md:text-4xl">
                {title}
              </h2>
            )}
            {body.map((paragraph, i) => (
              <p key={i} className={`mb-4 text-base leading-relaxed ${isNavy ? "text-white/80" : "text-foreground/80"}`}>
                {paragraph}
              </p>
            ))}
          </div>
          {image_url && (
            <div className={`overflow-hidden rounded-xl ${imageFirst ? "md:order-1" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image_url}
                alt={image_alt ?? ""}
                className="w-full object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
