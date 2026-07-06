import { Frown, Meh, Smile } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Qualidade } from "@/lib/types";

const QUALIDADE_ICON: Record<Qualidade, typeof Smile> = {
  boa: Smile,
  razoavel: Meh,
  ruim: Frown,
};

const QUALIDADE_COLOR: Record<Qualidade, string> = {
  boa: "text-success",
  razoavel: "text-warning",
  ruim: "text-destructive",
};

interface QualidadeIconProps {
  qualidade: Qualidade;
  size?: number;
  className?: string;
}

export function QualidadeIcon({ qualidade, size = 14, className }: QualidadeIconProps) {
  const Icon = QUALIDADE_ICON[qualidade];
  return <Icon size={size} className={cn(QUALIDADE_COLOR[qualidade], className)} />;
}
