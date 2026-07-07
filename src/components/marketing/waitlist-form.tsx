"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

interface WaitlistFormProps {
  className?: string;
  helperText?: string;
}

type Status = "idle" | "enviando" | "sucesso" | "erro";

export function WaitlistForm({ className, helperText }: WaitlistFormProps) {
  const inputId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("enviando");
    setMensagemErro(null);

    const supabase = createClient();
    const { error } = await supabase.from("waitlist").insert({ email: email.trim().toLowerCase() });

    if (error) {
      // Violação de unique (e-mail já na lista) não é um erro pro usuário ver.
      if (error.code === "23505") {
        setStatus("sucesso");
        return;
      }
      setStatus("erro");
      setMensagemErro("Não deu pra entrar na lista agora — tenta de novo.");
      return;
    }

    setStatus("sucesso");
  }

  if (status === "sucesso") {
    return (
      <p className={`text-[15px] font-bold text-primary ${className ?? ""}`}>
        Você entrou na lista! Avisamos por e-mail assim que o beta abrir.
      </p>
    );
  }

  return (
    <div className={className}>
      <form onSubmit={onSubmit} className="flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor={inputId} className="sr-only">
          Seu e-mail
        </label>
        <Input
          id={inputId}
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="shadow-soft-elevated h-12 rounded-xl border-none bg-card px-4 text-base sm:flex-1"
        />
        <Button
          type="submit"
          disabled={status === "enviando"}
          className="shadow-soft-elevated h-12 shrink-0 rounded-xl px-6 text-[15px] font-bold"
        >
          {status === "enviando" ? "Enviando..." : "Entrar na lista"}
        </Button>
      </form>
      {mensagemErro && <p className="mt-1.5 text-[13px] text-destructive">{mensagemErro}</p>}
      {helperText && !mensagemErro && (
        <p className="mt-1.5 text-[13px] text-muted-foreground">{helperText}</p>
      )}
    </div>
  );
}
