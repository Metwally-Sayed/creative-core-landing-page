import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  logoUrl?: string;
  siteName?: string;
  inverted?: boolean;
  neutral?: boolean;
  className?: string;
};

export default function BrandLogo({
  logoUrl,
  siteName = "Hello Monday",
  inverted = false,
  neutral = false,
  className = "",
}: Props) {
  const colorClass = inverted
    ? "text-white"
    : neutral
      ? "text-black"
      : "text-[hsl(var(--accent))]";

  if (logoUrl) {
    return (
      <div className={cn("relative h-32 w-auto min-w-[14rem] max-w-[28rem]", className)}>
        <Image
          src={logoUrl}
          alt={siteName}
          fill
          sizes="224px"
          className="object-contain object-left"
          style={{ filter: inverted ? "brightness(0) invert(1)" : undefined }}
        />
      </div>
    );
  }

  const lines = siteName.includes("/")
    ? [siteName.split("/")[0].trim(), `/ ${siteName.split("/").slice(1).join("/").trim()}`]
    : [siteName];

  return (
    <span
      className={cn(
        "flex flex-col leading-[0.9] tracking-[0.08em] uppercase transition-colors duration-300",
        colorClass,
        className,
      )}
    >
      {lines.map((line, i) => (
        <span key={i} className="text-[1.05rem] font-black">
          {line}
        </span>
      ))}
    </span>
  );
}
