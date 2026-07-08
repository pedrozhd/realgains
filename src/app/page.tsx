import Image from "next/image";
import Link from "next/link";
import { Calendar, Hand, Lock, Target, TrendingUp, Zap } from "lucide-react";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import {
  AnimatedPricingCard,
  PricingCardEyebrow,
  PricingCardParagraph,
  PricingCardPrice,
} from "@/components/ui/animated-pricing-card";
import { SoftCard } from "@/components/ui/soft-card";

const PASSOS = [
  {
    numero: "1",
    titulo: "Monte seu treino",
    descricao: "Estruture seus dias e exercícios do seu jeito, sem modelos fixos.",
  },
  {
    numero: "2",
    titulo: "Registre a série",
    descricao: "Carga, reps e qualidade em três toques, entre uma série e outra.",
  },
  {
    numero: "3",
    titulo: "Veja a evolução",
    descricao: "Gráfico de carga por exercício e volume semanal, sem esforço.",
  },
];

const BENEFICIOS = [
  {
    icon: TrendingUp,
    titulo: "Progressão real",
    descricao: "Todo exercício com seu próprio histórico de carga, sem se perder em planilhas.",
  },
  {
    icon: Hand,
    titulo: "Toques grandes",
    descricao: "Interface pensada pra registrar suado, entre séries, sem precisão de laboratório.",
  },
  {
    icon: Calendar,
    titulo: "Seu treino, sua ordem",
    descricao: "Monte a divisão que quiser, sem forçar PPL, Upper/Lower ou qualquer modelo.",
  },
  {
    icon: Target,
    titulo: "Qualidade da série",
    descricao: "Marque se a série foi boa, razoável ou ruim: contexto que a carga sozinha não dá.",
  },
  {
    icon: Zap,
    titulo: "Rápido de verdade",
    descricao: "Registrar uma série leva menos tempo do que descansar entre elas.",
  },
  {
    icon: Lock,
    titulo: "Seus dados",
    descricao: "Seu histórico fica com você, sem redes sociais, sem feed, sem distração.",
  },
];

const BENEFICIOS_BETA = [
  "Registro ilimitado de séries",
  "Histórico e gráficos por exercício",
  "Treinos e dias sem limite",
  "Acesso antecipado a novidades",
];

export default function LandingPage() {
  return (
    <div>
      <header className="bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-lg font-extrabold tracking-tight">RealGains</span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-[13px] font-semibold text-muted-foreground">
              Dashboard
            </Link>
            <a
              href="#waitlist"
              className="shadow-soft-subtle rounded-full bg-card px-4 py-2 text-[13px] font-bold text-foreground"
            >
              Entrar na lista
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-background">
        <div aria-hidden className="bg-grid-fade absolute inset-0" />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 py-8 md:grid-cols-2 md:gap-16 md:py-16">
          <div>
            <span className="shadow-soft-subtle inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-[12px] font-bold text-primary">
              Em breve · lista de espera aberta
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Progressão de carga, sem planilha.
            </h1>
            <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">
              Registre carga, reps e qualidade da série em segundos. O RealGains mostra exatamente onde você evoluiu
              e onde estagnou.
            </p>
            <WaitlistForm
              className="mt-6 max-w-md"
              helperText="Sem spam. Um único e-mail quando o app abrir."
            />
          </div>

          <div className="relative mx-auto w-full max-w-[280px] justify-self-center md:justify-self-end">
            <div className="shadow-soft-elevated overflow-hidden rounded-[2rem] bg-card">
              <Image
                src="/marketing/dashboard-preview.png"
                alt="Tela inicial do RealGains mostrando o treino do dia e o volume semanal"
                width={390}
                height={844}
                className="h-auto w-full"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center md:py-20">
          <p className="text-[12px] font-bold tracking-wide text-primary uppercase">Como funciona</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Três passos. Toda vez.</h2>

          <div className="mt-10 grid gap-4 text-left md:grid-cols-3">
            {PASSOS.map((passo) => (
              <SoftCard key={passo.numero} as="div" className="p-6">
                <span className="shadow-soft-subtle flex h-8 w-8 items-center justify-center rounded-full bg-background text-[13px] font-bold text-primary">
                  {passo.numero}
                </span>
                <h3 className="mt-4 text-[17px] font-bold tracking-tight">{passo.titulo}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{passo.descricao}</p>
              </SoftCard>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center md:py-20">
          <p className="text-[12px] font-bold tracking-wide text-primary uppercase">Por que o RealGains</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Feito pra usar dentro da academia.</h2>

          <div className="mt-10 grid gap-8 text-left sm:grid-cols-2 md:grid-cols-3">
            {BENEFICIOS.map((beneficio) => (
              <div key={beneficio.titulo}>
                <span className="shadow-soft-subtle flex h-10 w-10 items-center justify-center rounded-xl bg-card text-primary">
                  <beneficio.icon size={20} />
                </span>
                <h3 className="mt-3 text-[15px] font-bold tracking-tight">{beneficio.titulo}</h3>
                <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{beneficio.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center md:py-20">
          <p className="text-[12px] font-bold tracking-wide text-primary uppercase">Preço</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight">Grátis durante o beta.</h2>

          <AnimatedPricingCard
            ctaHref="#waitlist"
            ctaLabel="Garantir acesso ao beta"
            className="mx-auto mt-10 text-left"
          >
            <div>
              <PricingCardEyebrow>Beta</PricingCardEyebrow>
              <PricingCardPrice className="mt-1">R$ 0</PricingCardPrice>
              <PricingCardParagraph className="mt-1">enquanto durar o beta fechado</PricingCardParagraph>
            </div>

            <ul className="flex flex-col gap-2 text-[14px]">
              {BENEFICIOS_BETA.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </AnimatedPricingCard>
        </div>
      </section>

      <section id="waitlist" className="scroll-mt-6 bg-primary/10">
        <div className="mx-auto max-w-6xl px-6 py-16 text-center md:py-20">
          <h2 className="mx-auto max-w-[26ch] text-3xl font-extrabold tracking-tight">
            Pare de perder sua progressão em prints e planilhas.
          </h2>
          <p className="mx-auto mt-3 max-w-[40ch] text-[15px] text-muted-foreground">
            Entre na lista e seja avisado assim que o RealGains abrir.
          </p>
          <WaitlistForm className="mx-auto mt-6 max-w-md" />
        </div>
      </section>

      <footer className="bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 py-8 text-center text-[13px] text-muted-foreground">
          <span className="font-bold text-foreground">RealGains</span>
          <span>© 2026 RealGains. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
