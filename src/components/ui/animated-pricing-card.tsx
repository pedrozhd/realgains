import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const Cross = () => (
  <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 11L118.899 119M11.101 119L119 11"
      stroke="currentColor"
      strokeWidth="14"
      strokeLinecap="round"
    />
  </svg>
);

interface AnimatedPricingCardProps {
  children: ReactNode;
  ctaHref: string;
  ctaLabel: string;
  className?: string;
}

/** Card de preço com decoração animada (cruzes girando) — usa as cores/sombra
 * do design system em vez das cores fixas do componente original, pra não
 * destoar do resto da LP. */
export function AnimatedPricingCard({ children, ctaHref, ctaLabel, className }: AnimatedPricingCardProps) {
  return (
    <article
      className={cn(
        "shadow-soft-elevated relative flex w-full max-w-sm flex-col gap-8 overflow-hidden rounded-2xl bg-primary p-7 text-primary-foreground",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 text-primary-foreground/15">
        <div className="absolute top-0 -left-8 animate-[spin_9s_linear_infinite]">
          <Cross />
        </div>
        <div className="absolute top-1/2 -right-10 animate-[spin_9s_linear_infinite]">
          <Cross />
        </div>
        <div className="absolute top-[85%] -left-6 animate-[spin_9s_linear_infinite]">
          <Cross />
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-6">{children}</div>

      <a
        href={ctaHref}
        className="relative z-10 flex h-12 w-full items-center justify-center rounded-xl bg-card text-[15px] font-bold text-foreground"
      >
        {ctaLabel}
      </a>
    </article>
  );
}

export function PricingCardEyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[12px] font-bold tracking-wide uppercase opacity-80", className)}>{children}</p>;
}

export function PricingCardPrice({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("text-5xl font-extrabold tracking-tight", className)}>{children}</div>;
}

export function PricingCardParagraph({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[14px] leading-relaxed opacity-90", className)}>{children}</p>;
}
