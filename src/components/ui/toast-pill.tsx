interface ToastPillProps {
  message: string | null;
  toastKey: number;
}

export function ToastPill({ message, toastKey }: ToastPillProps) {
  if (!message) return null;

  return (
    <div
      key={toastKey}
      className="pointer-events-none fixed bottom-[104px] left-1/2 z-20 max-w-[85%] -translate-x-1/2 text-balance rounded-full bg-foreground px-5 py-2.5 text-center text-sm font-bold text-background"
      style={{ animation: "rg-toast 1.8s ease forwards" }}
    >
      {message}
    </div>
  );
}
