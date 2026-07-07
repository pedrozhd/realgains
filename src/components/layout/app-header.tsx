"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SHORTCUT_URL = "https://www.icloud.com/shortcuts/18a689496c094ec1a4391e4e4df70a60";

interface AppHeaderProps {
  variant: "dashboard" | "title" | "back";
  title?: string;
  backHref?: string;
  onBack?: () => void;
  userName?: string;
  onAvatarClick?: () => void;
}

function ShortcutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-2xl bg-card">
        <DialogHeader>
          <DialogTitle>Atalho do RealGains</DialogTitle>
        </DialogHeader>
        <p className="rounded-xl bg-background px-3 py-2.5 text-[13px] leading-relaxed text-muted-foreground">
          Antes de usar, cadastre pelo menos um treino na aba &ldquo;Meu Treino&rdquo; e defina sua semana. Sem
          isso o atalho não encontra o treino de hoje.
        </p>
        <ol className="flex flex-col gap-2.5 text-[13px] leading-relaxed">
          <li>
            <strong className="text-foreground">1.</strong> Toque em &ldquo;Instalar atalho&rdquo; abaixo, isso abre
            o app Atalhos do iPhone.
          </li>
          <li>
            <strong className="text-foreground">2.</strong> No RealGains, toque no seu avatar → &ldquo;Token do
            Shortcut&rdquo; → Copiar.
          </li>
          <li>
            <strong className="text-foreground">3.</strong> No app Atalhos, toque nos &ldquo;•••&rdquo; do atalho pra
            abrir a edição e cole o token no primeiro campo.
          </li>
          <li>
            <strong className="text-foreground">4.</strong> Toque no botão de compartilhar e escolha &ldquo;Adicionar
            à Tela de Início&rdquo;.
          </li>
          <li>
            <strong className="text-foreground">5.</strong> Pronto, toque no ícone na tela de início pra ver o
            treino de hoje e registrar uma série sem abrir o app.
          </li>
        </ol>
        <Button
          render={<a href={SHORTCUT_URL} target="_blank" rel="noreferrer" />}
          nativeButton={false}
          className="shadow-soft-elevated mt-1 h-11 w-full rounded-xl"
        >
          Instalar atalho
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function AppHeader({
  variant,
  title,
  backHref = "/",
  onBack,
  userName = "Você",
  onAvatarClick,
}: AppHeaderProps) {
  const [shortcutOpen, setShortcutOpen] = useState(false);

  if (variant === "dashboard") {
    const inicial = userName.trim().charAt(0).toUpperCase();
    return (
      <header className="flex flex-none items-center justify-between px-5 pt-5 pb-3.5">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight">Olá{userName ? `, ${userName}` : ""}</h1>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Bora treinar hoje?</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShortcutOpen(true)}
            aria-label="Adicionar Shortcuts"
            className="shadow-soft-elevated flex h-10 w-10 items-center justify-center rounded-full bg-card text-primary"
          >
            <Zap size={16} />
          </button>
          <button
            type="button"
            onClick={onAvatarClick}
            aria-label="Conta"
            className="shadow-soft-elevated flex h-10 w-10 items-center justify-center rounded-full bg-card text-[15px] font-bold"
          >
            {inicial}
          </button>
        </div>

        <ShortcutDialog open={shortcutOpen} onOpenChange={setShortcutOpen} />
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
