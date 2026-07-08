import * as React from "react";
import { cn } from "@/lib/utils";

interface SoftCardProps extends React.HTMLAttributes<HTMLElement> {
  /** "elevated" (padrão) pra cards de conteúdo, "subtle" pra superfícies mais discretas (rows, listas). */
  elevation?: "elevated" | "subtle";
  as?: "div" | "section" | "button";
  /** Só relevante quando `as="button"`. */
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

/**
 * Superfície "soft UI" compartilhada — cantos arredondados, bg-card e a
 * sombra neumórfica do app. Substitui o `rounded-2xl bg-card shadow-soft-*`
 * que estava reimplementado à mão em cada card.
 */
export function SoftCard({ elevation = "elevated", as: Tag = "section", className, ...props }: SoftCardProps) {
  return (
    <Tag
      className={cn(
        "rounded-2xl bg-card",
        elevation === "elevated" ? "shadow-soft-elevated" : "shadow-soft-subtle",
        className,
      )}
      {...props}
    />
  );
}
