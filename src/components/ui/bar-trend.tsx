import { cn } from "@/lib/utils";

export type BarTrendPoint = {
  label?: string;
  value: number;
};

type BarTrendProps = {
  ariaLabel?: string;
  className?: string;
  data: readonly BarTrendPoint[];
  glow?: boolean;
  height?: number;
  width?: number;
};

const BAR_GAP = 4;
const MIN_BAR_HEIGHT = 3;

/**
 * Gráfico de barras pequeno, irmão do Sparkline (mesma convenção de props),
 * mas como componente separado: a entrada "cresce de baixo" das barras é
 * diferente o bastante da revelação em clip-path de uma linha pra não valer
 * a pena um "modo barras" dentro do Sparkline. A última barra (mais recente)
 * sai destacada em `fill-primary`; as demais em tom neutro.
 */
export function BarTrend({
  ariaLabel = "Gráfico de barras",
  className,
  data,
  glow = false,
  height = 64,
  width = 220,
}: BarTrendProps) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const barWidth = (width - BAR_GAP * (data.length - 1)) / data.length;

  return (
    <svg
      aria-label={ariaLabel}
      className={cn("block h-auto w-full overflow-visible", className)}
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      {data.map((d, i) => {
        const isLast = i === data.length - 1;
        const barHeight = Math.max(MIN_BAR_HEIGHT, ((d.value - min) / range) * height);
        const x = i * (barWidth + BAR_GAP);
        const y = height - barHeight;
        const rx = Math.min(barWidth / 3, 4);
        return (
          <g key={i}>
            {isLast && glow ? (
              <rect className="fill-primary opacity-40 blur-[4px]" height={barHeight} rx={rx} width={barWidth} x={x} y={y} />
            ) : null}
            <rect
              className={isLast ? "fill-primary" : "fill-muted-foreground/25"}
              height={barHeight}
              rx={rx}
              width={barWidth}
              x={x}
              y={y}
            />
          </g>
        );
      })}
    </svg>
  );
}
