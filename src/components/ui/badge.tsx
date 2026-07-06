import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        primary: "",
        secondary: "",
        success: "",
        warning: "",
        info: "",
        destructive: "",
        mono: "",
      },
      appearance: {
        light: "border-transparent",
        solid: "border-transparent",
        stroke: "bg-transparent",
      },
    },
    compoundVariants: [
      { variant: "primary", appearance: "light", class: "bg-primary/10 text-primary" },
      { variant: "primary", appearance: "solid", class: "bg-primary text-primary-foreground" },
      { variant: "primary", appearance: "stroke", class: "border-primary/30 text-primary" },

      { variant: "secondary", appearance: "light", class: "bg-secondary/60 text-secondary-foreground" },
      { variant: "secondary", appearance: "solid", class: "bg-secondary text-secondary-foreground" },
      { variant: "secondary", appearance: "stroke", class: "border-border text-secondary-foreground" },

      { variant: "success", appearance: "light", class: "bg-success/10 text-success" },
      { variant: "success", appearance: "solid", class: "bg-success text-success-foreground" },
      { variant: "success", appearance: "stroke", class: "border-success/30 text-success" },

      { variant: "warning", appearance: "light", class: "bg-warning/10 text-warning" },
      { variant: "warning", appearance: "solid", class: "bg-warning text-warning-foreground" },
      { variant: "warning", appearance: "stroke", class: "border-warning/30 text-warning" },

      { variant: "info", appearance: "light", class: "bg-info/10 text-info" },
      { variant: "info", appearance: "solid", class: "bg-info text-info-foreground" },
      { variant: "info", appearance: "stroke", class: "border-info/30 text-info" },

      { variant: "destructive", appearance: "light", class: "bg-destructive/10 text-destructive" },
      { variant: "destructive", appearance: "solid", class: "bg-destructive text-destructive-foreground" },
      { variant: "destructive", appearance: "stroke", class: "border-destructive/30 text-destructive" },

      { variant: "mono", appearance: "light", class: "bg-foreground/10 text-foreground" },
      { variant: "mono", appearance: "solid", class: "bg-foreground text-background" },
      { variant: "mono", appearance: "stroke", class: "border-border text-foreground" },
    ],
    defaultVariants: {
      variant: "primary",
      appearance: "light",
    },
  }
)

function Badge({
  className,
  variant = "primary",
  appearance = "light",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant, appearance }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
      appearance,
    },
  })
}

export { Badge, badgeVariants }
