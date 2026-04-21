interface MetricItem {
  label: string;
  value: string;
}

interface Props {
  heading?: string;
  items?: MetricItem[];
}

export default function MetricsSection({ heading, items = [] }: Props) {
  return (
    <section className="py-20 px-5 md:px-20 bg-background">
      <div className="mx-auto max-w-7xl">
        {heading && (
          <h2 className="mb-12 font-serif text-3xl font-bold md:text-4xl">{heading}</h2>
        )}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {items.map((item, i) => (
            <div key={i} className="flex flex-col gap-2">
              <span className="font-serif text-4xl font-bold text-[hsl(var(--secondary))] md:text-5xl">
                {item.value}
              </span>
              <span className="text-sm text-foreground/60 uppercase tracking-wider">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
