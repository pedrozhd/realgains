import Link from "next/link";

interface AppHeaderProps {
  variant: "dashboard" | "title" | "back";
  title?: string;
  backHref?: string;
  onBack?: () => void;
  userName?: string;
  onAvatarClick?: () => void;
}

export function AppHeader({
  variant,
  title,
  backHref = "/",
  onBack,
  userName = "Você",
  onAvatarClick,
}: AppHeaderProps) {
  if (variant === "dashboard") {
    const inicial = userName.trim().charAt(0).toUpperCase();
    return (
      <header className="flex flex-none items-center justify-between px-5 pt-5 pb-3.5">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight">Olá, {userName} 👋</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Bora treinar hoje?</p>
        </div>
        <button
          type="button"
          onClick={onAvatarClick}
          aria-label="Conta"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[15px] font-bold"
        >
          {inicial}
        </button>
      </header>
    );
  }

  if (variant === "back") {
    const backButtonClassName = "-ml-1 flex h-9 w-9 shrink-0 items-center justify-center text-xl";
    return (
      <header className="flex flex-none items-center gap-2 px-5 pt-5 pb-3.5">
        {onBack ? (
          <button type="button" onClick={onBack} aria-label="Voltar" className={backButtonClassName}>
            ←
          </button>
        ) : (
          <Link href={backHref} aria-label="Voltar" className={backButtonClassName}>
            ←
          </Link>
        )}
        <h1 className="flex-1 truncate text-[17px] font-bold tracking-tight">{title}</h1>
      </header>
    );
  }

  return (
    <header className="flex flex-none items-center justify-between px-5 pt-5 pb-3.5">
      <h1 className="text-lg font-extrabold tracking-tight">{title}</h1>
    </header>
  );
}
