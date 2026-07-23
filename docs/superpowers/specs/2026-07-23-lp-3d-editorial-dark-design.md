# LP 3D editorial + recolor dark do site — Design

Data: 2026-07-23
Status: aprovado (design), aguardando revisão da spec

## Objetivo

Reestruturar totalmente a landing page do RealGains para uma experiência
scroll-driven em 3D (iPhone girando conforme o scroll, no estilo do protótipo
`teste_animation`), e migrar a paleta do **site inteiro** para um tema
**dark-only editorial** (fundo quase-preto + acento verde-limão ácido).

Referência de origem: protótipo Vite/vanilla em `teste_animation.zip`
(Three.js + GSAP ScrollTrigger + modelo `iphone.glb` com Draco).

## Decisões (fechadas no brainstorming)

1. **Escopo da cor:** site inteiro migra para a paleta escura.
2. **Animação 3D:** portar o 3D completo (Three.js + GSAP + `iphone.glb`).
   Mantém o modelo iPhone da referência (ciente da ressalva "uso ilustrativo").
3. **App interno (dashboard/treino/registro/login):** **apenas recolor** —
   mantém o layout e o neumorfismo Soft UI atuais. Só a LP carrega o visual
   editorial novo.
4. **Tema:** **dark-only**. Remove o tema claro e o toggle.
5. **Conteúdo da LP:** experiência 3D dos 4 painéis + seções readaptadas
   ("como funciona", "benefícios", "preço") no novo estilo editorial dark +
   CTA final + footer.
6. O formulário de waitlist continua **real** (Supabase), só re-estilizado.

## Paleta (dark-only)

Substitui os tokens em `src/app/globals.css`. `:root` passa a ser a paleta
escura única (a regra `.dark` deixa de ser necessária, mas ver "Estratégia de
tema" abaixo).

| Token | Valor | Origem / nota |
|---|---|---|
| `--background` | `#08090b` | fundo da referência (quase-preto) |
| `--card` | `#111317` | superfície elevada (mockup da ref usa `#16181c` p/ card interno) |
| `--foreground` | `#ededed` | texto principal |
| `--muted-foreground` | `#8a8f94` | texto secundário/dim |
| `--secondary` / `--muted` / `--accent` | `#16181c` | superfícies neutras |
| `--primary` | `#d6ff3f` | verde-limão ácido (acento) |
| `--primary-foreground` | `#08090b` | texto sobre o limão |
| `--border` | `#23262b` | borda fina |
| `--input` | `#2a2d33` | |
| `--ring` | `#d6ff3f` | foco |
| `--chart-1` | `#d6ff3f` | série de destaque |
| `--chart-2..5` | cinzas | `#8a8f94 → #23262b` |
| `--destructive` | `#f87171` | mantém (erro) |
| `--success` | `#d6ff3f` | passa a ser o mesmo limão (progresso = acento) |
| `--warning` | `#f59e0b` | mantém |
| `--info` | `#38bdf8` | mantém |

- `themeColor` do `viewport` em `layout.tsx` passa de `#15171b` → `#08090b`.
- Sombras neumórficas: **mantidas**. As variáveis `--shadow-soft-*` do modo
  escuro atual (highlight `rgba(255,255,255,0.04)`, sombra `rgba(0,0,0,0.6)`)
  já funcionam sobre fundo escuro. Em `#08090b` puro o relevo fica sutil; para
  preservar a legibilidade do neumorfismo nas telas internas, `--card`/
  superfícies usam `#111317`/`#16181c` (levemente acima do fundo), mantendo o
  contraste highlight/sombra que "esculpe" os cards.
- Fonte **Satoshi mantida** (identidade do app; combina com o editorial dark).

### Estratégia de tema (remoção do claro)

Duas opções equivalentes; escolhida a **A** por menor risco:

- **A. Baked dark:** manter o app sempre com a classe `.dark` no `<html>` e
  mover os valores da paleta nova para a regra `.dark` (e/ou `:root`), sem
  tocar em cada `dark:` espalhado. `ThemeInitScript` passa a sempre aplicar
  `dark`; `ThemeProvider`/`useTheme` são removidos ou reduzidos a no-op.
- B. Remover a classe e colapsar tudo em `:root` (exige varrer usos de
  variante `dark:`). Mais invasivo — descartado.

Concretamente:
- `src/lib/theme.tsx`: remover `ThemeProvider`/`useTheme`/`toggleTheme`.
  `ThemeInitScript` simplificado para sempre adicionar `dark` (mantém o
  padrão anti-flash já documentado).
- `src/app/layout.tsx`: remover o wrapper `<ThemeProvider>`; manter
  `ThemeInitScript`. `<html>` fica com `.dark` garantido.
- `src/components/layout/app-header.tsx`: remover o botão de toggle
  (linhas ~75/91) e o import de `useTheme`.

## Dependências e assets

- Adicionar ao `package.json`: `three`, `gsap`. Dev: `@types/three`.
- Copiar para `public/`:
  - `public/models/iphone.glb`
  - `public/draco/draco_decoder.js|.wasm`, `public/draco/draco_wasm_wrapper.js`
- Origem: `teste_animation/public/*` (já extraído no scratchpad).

## Landing page (`src/app/page.tsx`)

Estrutura nova (de cima para baixo):

1. **Loader** — "REALGAINS" + barra de progresso ligada ao carregamento do
   `.glb` (via `onProgress` do GLTFLoader). Some com fade quando o modelo
   carrega.
2. **Nav fixo** — logo "RealGains" + link real **Entrar** → `/dashboard`.
   (A ref usa `mix-blend-mode: difference` e `pointer-events: none`; aqui o
   link precisa ser clicável, então o nav tem `pointer-events` normal.)
3. **Stage 3D** — canvas `sticky top-0 h-screen` sobre um trilho de `400vh`.
   iPhone 3D girando/transladando no scroll (timeline GSAP com `scrub`).
   4 painéis absolutos, um por "tela" de 100vh, com reveal ao entrar:
   - Painel 0 (hook): "Cada treino, um degrau." + scroll hint.
   - Painel 1 (problema): "No seu celular. Na sua mochila. No seu treino."
   - Painel 2 (jornada): "Registre a carga. A gente calcula o resto."
   - Painel 3 (solução): "Quem registra, evolui mais rápido." + stats
     (+12% carga / 0 planilhas perdidas).
   - A tela do iPhone renderiza o mockup do dashboard via `CanvasTexture`
     (código de `screen-texture.js`, já nas cores da paleta nova).
   - **Indicador de progresso** de scroll (barra fina fixa) — recomendado
     pelo padrão "Scroll-Triggered Storytelling".
4. **Como funciona** — 3 passos (copy atual reaproveitada), estilo flat
   editorial dark (superfície `--card`, borda fina, sem sombra neumórfica).
5. **Benefícios** — 6 itens (copy atual), grid flat dark, ícones Lucide.
6. **Preço** — card "R$ 0 · beta" readaptado ao editorial dark.
7. **CTA final** — `WaitlistForm` (Supabase) re-estilizado; âncora `#waitlist`.
8. **Footer** — logo + copyright.

### Componentização

- `src/components/marketing/landing-3d-stage.tsx` (**client**): dono do canvas,
  dos 4 painéis, e de toda a lógica Three.js/GSAP. Encapsula:
  - `initScene(canvas, {onProgress})` — cena, luzes, loader Draco/GLTF,
    restyle de materiais, `applyScreenMockup`.
  - `setupScrollAnimation`, `setupPanelReveals`.
  - **Cleanup** no unmount: `renderer.dispose()`, `cancelAnimationFrame`,
    `ScrollTrigger.getAll().forEach(t => t.kill())`, `gsap` context revert,
    remover listener de `resize`.
- Módulos utilitários portados (podem viver junto do componente):
  `scene.ts`, `screen-texture.ts` (TS a partir dos `.js` da referência).
- As seções 4–8 como componentes de seção (server components) compostos em
  `page.tsx`. `page.tsx` importa o `Landing3DStage` (client) + seções.
- O loader pode ser parte do `Landing3DStage` (precisa do progresso do load).

### Acessibilidade / motion (crítico)

O padrão de scroll-jacking + parallax é sinalizado como risco de enjoo
(severidade alta). Portanto:

- **Respeitar `prefers-reduced-motion: reduce`**: quando ativo, **não**
  inicializar Three.js/ScrollTrigger. Fallback: renderizar os 4 painéis
  empilhados verticalmente (layout estático legível) com uma imagem estática
  do celular (reaproveitar `public/marketing/dashboard-preview.png`) no lugar
  do canvas 3D. Assim quem prefere menos movimento também não baixa o
  decoder Draco (~1 MB) nem o `.glb`. A checagem é feita no client, antes de
  montar o `Landing3DStage`.
- `html { scroll-behavior: smooth }` para a âncora do CTA.
- Easing: entrada `ease-out`, saída `ease-in`; animar 1–2 elementos por painel.
- Contraste: corpo de texto em `--foreground` (`#ededed`), reservando
  `--muted-foreground` (`#8a8f94`) para legendas/labels — evitar cinza-sobre-
  cinza em texto longo.
- Nav/CTA: alvos ≥44px; foco visível (`--ring`).

### Performance

- `three`/`gsap` só entram no bundle da rota `/` (client component isolado);
  as seções abaixo permanecem server-rendered.
- Draco decoder (~1 MB) e `.glb` (~226 KB) carregam sob demanda; loader cobre
  a espera.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` (como na ref).
- Reservar espaço do canvas (sticky full-screen) — sem CLS.

## App interno (dashboard/treino/registro/login)

- **Apenas recolor**, herdado dos tokens. Nenhuma reestruturação de layout.
- Auditar cores hardcoded que escapam dos tokens (ex.: `bg-white` usado na LP
  antiga; verificar telas internas por `#fff`/`bg-white`/hex soltos).
- Remover o botão de toggle de tema do `app-header.tsx`.

## Verificação

Tarefa visual/3D — sem TDD para a animação. Critérios de aceite:

- `next build` passa sem erros de tipo/lint.
- `next dev`: LP carrega, loader → iPhone aparece e anima no scroll, 4 painéis
  revelam, sem erros no console.
- `prefers-reduced-motion: reduce`: LP cai no layout estático empilhado (sem
  scroll-jacking).
- Waitlist ainda posta no Supabase (comportamento do `WaitlistForm` intacto).
- Telas internas (dashboard/treino/registro/login) abrem coerentes na paleta
  nova; neumorfismo ainda legível; sem toggle de tema.
- Sem resquício de tema claro (nenhum flash branco no load).

## Fora de escopo

- Achatar o neumorfismo das telas internas (fica para spec futura, se desejado).
- Trocar o modelo 3D por um livre de licença.
- Alterar a lógica de dados do app (só cor/estilo/LP).

## Notas de implementação

- **AGENTS.md:** esta versão do Next tem breaking changes — ler o guia
  relevante em `node_modules/next/dist/docs/` antes de escrever código
  (client components, `next/dynamic`, `next/image`, fonts, viewport/metadata).
- Portar `scene.js`/`screen-texture.js` quase verbatim, adaptando imports e
  paths (`/models/iphone.glb`, `/draco/`) que já batem com `public/`.
