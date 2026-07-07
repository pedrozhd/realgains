# Redesign Dashboard — Satoshi + Soft UI (piloto no Figma)

## Objetivo

Validar visualmente, no Figma, um novo estilo visual para o RealGains — fonte
Satoshi e linguagem Soft UI (neumorfismo claro) — usando a tela de Dashboard
como piloto. O app hoje usa tema escuro fixo (preto puro), fonte Public Sans e
estilo shadcn "base-nova" minimalista/flat.

Arquivo Figma: `RealGains - New`
(`https://www.figma.com/design/6qadg9NepuGrQltdfSVMEy/RealGains---New`).
O arquivo está vazio — este piloto começa do zero, não adapta algo existente.

## Escopo

**Dentro do escopo agora:**
- Tokens de fundação (cores, sombra, raio, tipografia) no Figma.
- Montagem da tela de Dashboard no Figma usando esses tokens.

**Fora do escopo agora (fica para depois da aprovação deste piloto):**
- Demais telas do app (Meu Treino, Histórico/Exercícios, Registro, Login).
- Implementação no código (Next.js/Tailwind). O Figma é a etapa anterior;
  código só começa depois que o piloto visual for aprovado.

## Fluxo de trabalho

1. Criar tokens essenciais no Figma (variáveis de cor, estilos de sombra,
   escala de raio, estilos de texto com Satoshi).
2. Montar a tela de Dashboard no Figma usando esses tokens.
3. Revisar visualmente com o usuário (screenshot) e ajustar.
4. Só depois de aprovado: planejar a extensão para as demais telas e a
   implementação no código (fora deste spec).

## Fundações visuais (tokens)

### Cores
- Fundo: `#EEF0F3` (cinza-claro neutro).
- Superfície de card: mesmo tom do fundo — a diferenciação visual vem da
  sombra dupla, não de uma cor de superfície distinta (soft UI clássico).
- Texto principal: `#2A2D34` (nunca preto puro).
- Texto secundário/muted: `#6B7280`.
- Acento (CTA, destaque, estados ativos): coral `#FF6B4A`, foreground branco.
- Tendência positiva ("subiu"): verde `#22C55E`.
- Tendência negativa ("caiu"): vermelho `#EF4444`.
  (Verde/vermelho ficam reservados para indicar tendência; o coral fica
  reservado para CTA/destaque — evita os dois significados competirem pela
  mesma cor.)

### Sombra (soft UI)
- Elevada (padrão dos cards e botões): sombra clara
  (`rgba(255,255,255,.8)`) na diagonal superior-esquerda + sombra escura
  (`rgba(163,177,198,.5)`) na inferior-direita, blur generoso.
- Pressionada (estado ativo/toque): variante inset das mesmas cores.

### Raio
- Cards: ~20px.
- Elementos internos (botões, rows): ~16px.
- Nav e badges: pill (full).

### Tipografia (Satoshi)
- Títulos e números grandes (ex.: volume semanal): Satoshi Black/Bold.
- Corpo: Satoshi Medium/Regular.
- Eyebrows/legendas (ex.: "TREINO DE HOJE"): Satoshi Bold, uppercase,
  letter-spacing maior, cor muted.

## Composição da tela Dashboard (piloto)

- **Header**: saudação grande ("Olá, {nome} 👋") em Satoshi Bold + subtítulo
  muted ("Bora treinar hoje?"); avatar circular à direita como botão elevado
  (sombra dupla) com a inicial do nome.
- **Card "Treino de hoje"**: elevado; eyebrow em coral ("TREINO DE HOJE");
  título grande com o nome do treino; subtítulo muted com contagem de
  exercícios; CTA "Iniciar registro" em coral sólido com sombra própria.
- **Lista de exercícios**: rows mais discretos (sombra sutil, quase plano)
  para não competir visualmente com o card principal — nome do exercício,
  última série (muted), seta de tendência colorida, chevron.
- **Card "Volume semanal"**: elevado; eyebrow; número grande + "kg";
  indicador de tendência (seta + %); sparkline na cor da tendência.
- **Bottom nav**: pill flutuante elevado com 4 abas (Dashboard, Registro,
  Meu Treino, Histórico); a aba ativa ganha um "chip" levemente pressionado;
  ícone da aba ativa em coral.

## Critério de aprovação

O usuário revisa o screenshot da tela de Dashboard montada no Figma com os
tokens acima. Aprovado = segue para planejar as demais telas e a
implementação em código (spec/plano separados). Ajustes = itera nesta mesma
tela antes de estender o padrão.
