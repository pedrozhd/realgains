# LP 3D editorial + recolor dark — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reestruturar a landing page do RealGains como experiência scroll-driven em 3D (iPhone girando no scroll, Three.js + GSAP) e migrar o site inteiro para um tema dark-only editorial (fundo quase-preto + acento verde-limão ácido).

**Architecture:** Recolor via tokens em `globals.css` (mantendo a classe `.dark` sempre ligada — "baked dark") e remoção do toggle de tema. A LP passa a ter um wrapper client (`landing-hero.tsx`) que checa `prefers-reduced-motion` e, via `next/dynamic` com `ssr:false`, carrega o palco 3D (`landing-3d-stage.tsx`) — ou cai num fallback estático. `page.tsx` continua server component, compondo nav + hero + seções editoriais + footer.

**Tech Stack:** Next.js 16.2.10 (App Router), React 19.2, Tailwind v4, shadcn/@base-ui, Satoshi, Three.js, GSAP (ScrollTrigger), Supabase.

## Global Constraints

- Next.js 16 App Router. **`ssr:false` no `next/dynamic` só é permitido dentro de Client Component** — nunca em `page.tsx` (server). Fonte: `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`.
- **Dark-only "baked":** a classe `.dark` fica SEMPRE no `<html>` (dezenas de componentes usam variantes `dark:`). Não remover a classe; apenas atualizar os valores do bloco `.dark` em `globals.css` e remover o toggle.
- Todo texto de UI em **pt-BR** (código e comentários também em pt-BR, seguindo o codebase).
- Paleta exata (dark): `--background:#08090b`, `--card:#111317`, `--foreground:#ededed`, `--muted-foreground:#8a8f94`, superfícies neutras `#16181c`, `--primary:#d6ff3f`, `--primary-foreground:#08090b`, `--border:#23262b`, `--ring:#d6ff3f`.
- **Respeitar `prefers-reduced-motion: reduce`**: sem esse modo → experiência 3D; com esse modo → fallback estático (não carrega Three.js/Draco).
- Antes de usar APIs do Next (dynamic, image, fonts, metadata/viewport), consultar `node_modules/next/dist/docs/`.
- Commits frequentes, um por task.
- Sem testes unitários para o 3D/visual — a verificação é `npm run build` + checagens `grep` + inspeção manual no `npm run dev`. Isso é intencional para uma feature visual.

---

### Task 1: Recolor dos tokens + baked dark + CSS estrutural da LP

**Files:**
- Modify: `src/app/globals.css` (bloco `.dark`, `@layer base`, novos blocos de estilo da LP)

**Interfaces:**
- Consumes: nada.
- Produces: classes CSS `.rg-stage`, `.rg-canvas`, `.rg-panel`, `.rg-panel__inner`, `.rg-panel__inner--right`, `.rg-loader`, `.rg-loader__bar`, `.rg-loader__bar-fill`, `.rg-scroll-progress`, `.rg-scroll-progress__fill`, keyframe `rg-scroll-line`; tokens dark atualizados.

- [ ] **Step 1: Atualizar o bloco `.dark` para a nova paleta**

Em `src/app/globals.css`, substituir o CONTEÚDO do bloco `.dark { ... }` (linhas ~105-151) por:

```css
.dark {
  --background: #08090b;
  --foreground: #ededed;
  --card: #111317;
  --card-foreground: #ededed;
  --popover: #111317;
  --popover-foreground: #ededed;
  --primary: #d6ff3f;
  --primary-foreground: #08090b;
  --secondary: #16181c;
  --secondary-foreground: #ededed;
  --muted: #16181c;
  --muted-foreground: #8a8f94;
  --accent: #16181c;
  --accent-foreground: #ededed;
  --destructive: #f87171;
  --destructive-foreground: #1a1112;
  --success: #d6ff3f;
  --success-foreground: #08090b;
  --warning: #f59e0b;
  --warning-foreground: #1a1508;
  --info: #38bdf8;
  --info-foreground: #06171f;
  --border: #23262b;
  --input: #2a2d33;
  --ring: #d6ff3f;
  --chart-1: #d6ff3f;
  --chart-2: #8a8f94;
  --chart-3: #5a6068;
  --chart-4: #3a3e45;
  --chart-5: #23262b;
  --sidebar: #08090b;
  --sidebar-foreground: #ededed;
  --sidebar-primary: #d6ff3f;
  --sidebar-primary-foreground: #08090b;
  --sidebar-accent: #16181c;
  --sidebar-accent-foreground: #ededed;
  --sidebar-border: #23262b;
  --sidebar-ring: #d6ff3f;
  /* Neumorfismo escuro: realce quase imperceptível + sombra preta. Mantido. */
  --shadow-soft-hi: rgba(255, 255, 255, 0.04);
  --shadow-soft-hi-subtle: rgba(255, 255, 255, 0.025);
  --shadow-soft-lo: rgba(0, 0, 0, 0.6);
  --shadow-soft-lo-subtle: rgba(0, 0, 0, 0.45);
}
```

(O bloco `:root` — tema claro — fica intocado. Como `ThemeInitScript` aplica `.dark` antes da pintura e o toggle é removido, o claro nunca aparece; deixá-lo evita mexer nos muitos utilitários `dark:` do app.)

- [ ] **Step 2: `scroll-behavior: smooth` + respeito a reduced-motion na base**

Dentro de `@layer base`, no seletor `html`, acrescentar `scroll-behavior: smooth;`. Logo após o bloco `html, body`, adicionar:

```css
  @media (prefers-reduced-motion: reduce) {
    html {
      scroll-behavior: auto;
    }
  }
```

- [ ] **Step 3: Adicionar o CSS estrutural da LP 3D**

No fim de `src/app/globals.css`, acrescentar:

```css
/* ===== Landing 3D (scroll-driven) ===== */
.rg-stage {
  position: relative;
  height: 400vh;
}
.rg-canvas {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  display: block;
}
.rg-panel {
  position: absolute;
  left: 0;
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  pointer-events: none;
}
.rg-panel[data-panel="0"] { top: 0; }
.rg-panel[data-panel="1"] { top: 100vh; }
.rg-panel[data-panel="2"] { top: 200vh; }
.rg-panel[data-panel="3"] { top: 300vh; }
.rg-panel__inner {
  max-width: 560px;
  padding: 0 6vw;
  opacity: 0;
  transform: translateY(24px);
}
.rg-panel__inner--right {
  margin-left: auto;
  text-align: right;
  align-items: flex-end;
  display: flex;
  flex-direction: column;
}

/* Loader */
.rg-loader {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: var(--background);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
}
.rg-loader__word {
  font-size: 0.85rem;
  letter-spacing: 0.35em;
  color: var(--muted-foreground);
}
.rg-loader__bar {
  width: 160px;
  height: 2px;
  background: var(--border);
  overflow: hidden;
  border-radius: 2px;
}
.rg-loader__bar-fill {
  width: 0%;
  height: 100%;
  background: var(--primary);
}

/* Indicador de progresso do scroll (barra fina no topo) */
.rg-scroll-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  z-index: 30;
  background: transparent;
  pointer-events: none;
}
.rg-scroll-progress__fill {
  height: 100%;
  width: 0%;
  background: var(--primary);
}

@keyframes rg-scroll-line {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

- [ ] **Step 4: Verificar que compila**

Run: `npm run build`
Expected: build conclui sem erro de CSS/TS. (Nesta task a LP antiga ainda existe; ok.)

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "Recolore tokens para tema dark editorial e adiciona CSS da LP 3D"
```

---

### Task 2: Baked dark — simplificar `theme.tsx` e `layout.tsx`

**Files:**
- Modify: `src/lib/theme.tsx` (remover Provider/useTheme, manter só o init script)
- Modify: `src/app/layout.tsx` (remover `ThemeProvider`, ajustar `themeColor`)

**Interfaces:**
- Consumes: nada.
- Produces: export `ThemeInitScript` (React component, sem props). Remove os exports `ThemeProvider`, `useTheme`, tipo `Theme`, `ThemeContextValue`.

- [ ] **Step 1: Reescrever `src/lib/theme.tsx`**

Substituir o arquivo inteiro por:

```tsx
const STORAGE_KEY = "realgains-theme";

/**
 * O app é dark-only (não há mais toggle). Este script roda antes da hidratação
 * e garante a classe "dark" no <html> de cara, evitando qualquer flash do tema
 * claro (que segue definido em :root só como fallback morto). Mantém a limpeza
 * de qualquer valor legado salvo no localStorage.
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    document.documentElement.classList.add("dark");
    if (localStorage.getItem("${STORAGE_KEY}")) localStorage.removeItem("${STORAGE_KEY}");
  } catch (e) {}
})();
`;

/**
 * Script inline "puro" dispararia o warning de dev do React sobre <script>
 * renderizado por componente — a correção documentada pra essa versão do Next
 * é a troca de `type` server/client + suppressHydrationWarning (ver
 * node_modules/next/dist/docs/.../preventing-flash-before-hydration.md).
 */
export function ThemeInitScript() {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
```

- [ ] **Step 2: Ajustar `src/app/layout.tsx`**

Trocar o import da linha 3:

```tsx
import { ThemeInitScript } from "@/lib/theme";
```

Trocar `themeColor` (linha 16) para:

```tsx
  themeColor: "#08090b",
```

Substituir o corpo do `<body>` (linhas 26-29) por (remove o wrapper `ThemeProvider`, mantém o filho direto):

```tsx
      <body className="min-h-full flex flex-col bg-background">
        <ThemeInitScript />
        {children}
      </body>
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: pode falhar APENAS em `src/components/layout/app-header.tsx` (ainda importa `useTheme`) — isso é corrigido na Task 3. Nenhum outro arquivo deve acusar erro de `theme`.

- [ ] **Step 4: Commit**

```bash
git add src/lib/theme.tsx src/app/layout.tsx
git commit -m "Torna o app dark-only e remove o ThemeProvider"
```

---

### Task 3: Remover o toggle de tema do header

**Files:**
- Modify: `src/components/layout/app-header.tsx` (remover botão de toggle e import `useTheme`; remover ícones `Moon`/`Sun`)

**Interfaces:**
- Consumes: nada (deixa de consumir `useTheme`).
- Produces: `AppHeader` inalterado na assinatura.

- [ ] **Step 1: Remover imports de tema**

Na linha 5, trocar:

```tsx
import { Moon, Sun, Zap } from "lucide-react";
```

por:

```tsx
import { Zap } from "lucide-react";
```

Remover totalmente a linha 8 (`import { useTheme } from "@/lib/theme";`).

- [ ] **Step 2: Remover o uso do hook e o botão de toggle**

Remover a linha 75 (`const { toggleTheme } = useTheme();`).

Remover o bloco do botão de toggle (o comentário nas linhas 86-88 e o `<button>` das linhas 89-97 — o que contém `onClick={toggleTheme}`, `aria-label="Alternar tema"` e os ícones `<Sun.../>`/`<Moon.../>`). Os botões de Shortcuts (Zap) e avatar permanecem.

- [ ] **Step 3: Verificar tipos e lint**

Run: `npx tsc --noEmit && npm run lint`
Expected: PASS (sem referências a `useTheme`/`Sun`/`Moon`).

- [ ] **Step 4: Confirmar que não há mais consumidores de tema**

Run: `grep -rn "useTheme\|toggleTheme\|ThemeProvider" src/`
Expected: nenhum resultado.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/app-header.tsx
git commit -m "Remove o botao de alternar tema do header"
```

---

### Task 4: Dependências 3D + assets em `public/`

**Files:**
- Modify: `package.json` (deps `three`, `gsap`; dev `@types/three`)
- Create: `public/models/iphone.glb`
- Create: `public/draco/draco_decoder.js`, `public/draco/draco_decoder.wasm`, `public/draco/draco_wasm_wrapper.js`

**Interfaces:**
- Consumes: nada.
- Produces: módulos `three`, `three/examples/jsm/loaders/GLTFLoader.js`, `three/examples/jsm/loaders/DRACOLoader.js`, `gsap`, `gsap/ScrollTrigger` disponíveis; assets servidos em `/models/iphone.glb` e `/draco/`.

- [ ] **Step 1: Instalar dependências**

Run:
```bash
npm install three gsap
npm install -D @types/three
```
Expected: `package.json` passa a listar `three` e `gsap` em `dependencies` e `@types/three` em `devDependencies`; sem erros de peer deps que impeçam a instalação.

- [ ] **Step 2: Copiar os assets do protótipo para `public/`**

O zip já foi extraído em:
`C:/Users/StartSe/AppData/Local/Temp/claude/C--Users-StartSe-Workspace-2-principais-realgains/ec39020d-ed90-4db3-94ee-ef99faa2b451/scratchpad/teste_animation_extract/teste_animation`

Run (bash):
```bash
SRC="/c/Users/StartSe/AppData/Local/Temp/claude/C--Users-StartSe-Workspace-2-principais-realgains/ec39020d-ed90-4db3-94ee-ef99faa2b451/scratchpad/teste_animation_extract/teste_animation"
mkdir -p public/models public/draco
cp "$SRC/public/models/iphone.glb" public/models/
cp "$SRC/public/draco/draco_decoder.js" "$SRC/public/draco/draco_decoder.wasm" "$SRC/public/draco/draco_wasm_wrapper.js" public/draco/
```
(Se o scratchpad tiver expirado, os arquivos originais estão em `C:/Users/StartSe/teste_animation.zip` — reextrair antes de copiar.)

- [ ] **Step 3: Verificar assets**

Run: `ls -la public/models/iphone.glb public/draco/`
Expected: `iphone.glb` (~226 KB) e os 3 arquivos do Draco presentes.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json public/models public/draco
git commit -m "Adiciona three/gsap e os assets do modelo 3D (glb + draco)"
```

---

### Task 5: Portar os módulos Three.js (`scene.ts`, `screen-texture.ts`)

**Files:**
- Create: `src/components/marketing/three/scene.ts`
- Create: `src/components/marketing/three/screen-texture.ts`

**Interfaces:**
- Consumes: `three`, assets `/models/iphone.glb`, `/draco/` (Task 4).
- Produces:
  - `applyScreenMockup(model: THREE.Object3D): void` (screen-texture.ts)
  - `initScene(canvas: HTMLCanvasElement, opts?: { onProgress?: (e: ProgressEvent) => void }): Promise<SceneHandle>` onde
    `SceneHandle = { scene: THREE.Scene; camera: THREE.PerspectiveCamera; renderer: THREE.WebGLRenderer; model: THREE.Object3D; dispose: () => void }` (scene.ts)

- [ ] **Step 1: Criar `src/components/marketing/three/screen-texture.ts`**

```ts
import * as THREE from "three";

const SCREEN_MESH_NAME = "baf05346569e3be49c2a";
const W = 640;
const H = 1440;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawExerciseRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  name: string,
  load: string,
  progress: number,
) {
  ctx.fillStyle = "#ededed";
  ctx.font = "600 22px -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText(name, x, y);

  ctx.fillStyle = "#8a8f94";
  ctx.font = "600 20px -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText(load, x + w, y);

  const barY = y + 16;
  ctx.fillStyle = "rgba(237,237,237,0.1)";
  roundRect(ctx, x, barY, w, 4, 2);
  ctx.fill();
  ctx.fillStyle = "#d6ff3f";
  roundRect(ctx, x, barY, w * progress, 4, 2);
  ctx.fill();
}

// Mockup do dashboard desenhado no canvas e usado como textura da tela do
// iPhone. Já usa a paleta nova (#08090b / #d6ff3f). Trocar por um export de
// design real (imagem) no futuro mantém o pipeline (UV remap + wiring) igual.
function drawMockup(ctx: CanvasRenderingContext2D) {
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, "#111317");
  grad.addColorStop(1, "#0a0b0d");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#ededed";
  ctx.font = "600 22px -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("9:41", 36, 56);

  ctx.textAlign = "right";
  ctx.fillText("100%", W - 36, 56);

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 30px -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("RealGains", 36, 130);

  ctx.strokeStyle = "rgba(237,237,237,0.15)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(W - 60, 118, 22, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#8a8f94";
  ctx.font = "600 20px -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("P", W - 60, 126);

  ctx.fillStyle = "#8a8f94";
  ctx.font = "400 22px -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Bom treino, Pedro.", 36, 180);

  const cardX = 32;
  const cardY = 212;
  const cardW = W - 64;
  const cardH = 420;
  ctx.fillStyle = "#16181c";
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fill();

  ctx.fillStyle = "#d6ff3f";
  ctx.font = "700 18px -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.save();
  (ctx as unknown as { letterSpacing: string }).letterSpacing = "2px";
  ctx.fillText("SUPINO RETO", cardX + 36, cardY + 62);
  ctx.restore();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 76px -apple-system, Segoe UI, sans-serif";
  ctx.fillText("82,5", cardX + 36, cardY + 150);
  ctx.font = "600 32px -apple-system, Segoe UI, sans-serif";
  ctx.fillStyle = "#8a8f94";
  ctx.fillText("kg", cardX + 232, cardY + 150);

  const pillW = 118;
  const pillH = 40;
  const pillX = cardX + 36;
  const pillY = cardY + 178;
  ctx.fillStyle = "#d6ff3f";
  roundRect(ctx, pillX, pillY, pillW, pillH, 20);
  ctx.fill();
  ctx.fillStyle = "#08090b";
  ctx.font = "700 20px -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("+2,5 kg", pillX + pillW / 2, pillY + 27);

  const chartX = cardX + 36;
  const chartBottom = cardY + cardH - 40;
  const chartW = cardW - 72;
  const bars = [0.42, 0.5, 0.48, 0.62, 0.7, 0.68, 0.85, 1];
  const barGap = 14;
  const barW = (chartW - barGap * (bars.length - 1)) / bars.length;
  const maxBarH = 130;
  bars.forEach((v, i) => {
    const bh = maxBarH * v;
    const bx = chartX + i * (barW + barGap);
    const by = chartBottom - bh;
    ctx.fillStyle = i === bars.length - 1 ? "#d6ff3f" : "rgba(237,237,237,0.18)";
    roundRect(ctx, bx, by, barW, bh, 6);
    ctx.fill();
  });

  ctx.fillStyle = "#8a8f94";
  ctx.font = "400 18px -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("Próximos exercícios", 36, cardY + cardH + 56);

  const rows = [
    { name: "Agachamento livre", load: "110 kg", progress: 0.72 },
    { name: "Levantamento terra", load: "130 kg", progress: 0.6 },
    { name: "Desenvolvimento militar", load: "45 kg", progress: 0.85 },
  ];
  let rowY = cardY + cardH + 108;
  rows.forEach((row) => {
    drawExerciseRow(ctx, 36, rowY, W - 72, row.name, row.load, row.progress);
    rowY += 74;
  });

  const navH = 110;
  const navY = H - navH;
  ctx.fillStyle = "#111317";
  ctx.fillRect(0, navY, W, navH);
  ctx.strokeStyle = "rgba(237,237,237,0.08)";
  ctx.beginPath();
  ctx.moveTo(0, navY);
  ctx.lineTo(W, navY);
  ctx.stroke();

  const icons = ["home", "history", "chart", "profile"];
  const slot = W / icons.length;
  icons.forEach((_icon, i) => {
    const cx = slot * i + slot / 2;
    const cy = navY + navH / 2;
    ctx.fillStyle = i === 0 ? "#d6ff3f" : "rgba(237,237,237,0.35)";
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
  });
}

function normalizeUVs(geometry: THREE.BufferGeometry) {
  const uv = geometry.attributes.uv as THREE.BufferAttribute;
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  for (let i = 0; i < uv.count; i++) {
    const u = uv.getX(i);
    const v = uv.getY(i);
    if (u < minU) minU = u;
    if (u > maxU) maxU = u;
    if (v < minV) minV = v;
    if (v > maxV) maxV = v;
  }
  const spanU = maxU - minU || 1;
  const spanV = maxV - minV || 1;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (uv.getX(i) - minU) / spanU, (uv.getY(i) - minV) / spanV);
  }
  uv.needsUpdate = true;
}

export function applyScreenMockup(model: THREE.Object3D) {
  let screenMesh: THREE.Mesh | null = null;
  model.traverse((child) => {
    if ((child as THREE.Mesh).isMesh && child.name === SCREEN_MESH_NAME) {
      screenMesh = child as THREE.Mesh;
    }
  });
  if (!screenMesh) return;
  const mesh: THREE.Mesh = screenMesh;

  normalizeUVs(mesh.geometry as THREE.BufferGeometry);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  drawMockup(ctx);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.flipY = false;

  const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.MeshStandardMaterial;
  mat.map = texture;
  mat.color.setRGB(1, 1, 1);
  mat.emissiveMap = texture;
  mat.emissive.setRGB(1, 1, 1);
  mat.emissiveIntensity = 0.35;
  mat.roughness = 0.35;
  mat.metalness = 0;
  mat.needsUpdate = true;
}
```

- [ ] **Step 2: Criar `src/components/marketing/three/scene.ts`**

```ts
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { applyScreenMockup } from "./screen-texture";

const MODEL_URL = "/models/iphone.glb";

export interface SceneHandle {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  model: THREE.Object3D;
  dispose: () => void;
}

// O asset vem sem texturas; os fatores de material ficariam chapados e claros.
// Reatribui uma paleta escura pequena no lugar dos fatores crus.
function restyleMaterials(model: THREE.Object3D) {
  model.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (!mesh.isMesh) return;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((raw) => {
      const mat = raw as THREE.MeshStandardMaterial;
      if (!mat.isMeshStandardMaterial) return;
      const anyMat = mat as unknown as { clearcoat?: number; specularIntensity?: number };
      if (anyMat.clearcoat !== undefined) anyMat.clearcoat = 0;
      if (mat.emissive) mat.emissive.setRGB(0, 0, 0);
      mat.emissiveIntensity = 0;
      mat.envMapIntensity = 0;
      if (anyMat.specularIntensity !== undefined) anyMat.specularIntensity = 0.15;
      if (mat.transparent) {
        mat.color.setRGB(0.025, 0.025, 0.028);
        mat.metalness = 0.05;
        mat.roughness = 0.5;
        mat.opacity = Math.max(mat.opacity, 0.5);
      } else {
        mat.color.setRGB(0.07, 0.073, 0.08);
        mat.metalness = 0.6;
        mat.roughness = 0.52;
      }
    });
  });
}

export async function initScene(
  canvas: HTMLCanvasElement,
  { onProgress }: { onProgress?: (event: ProgressEvent) => void } = {},
): Promise<SceneHandle> {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x08090b);
  scene.fog = new THREE.Fog(0x08090b, 8, 16);

  const camera = new THREE.PerspectiveCamera(32, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  const hemi = new THREE.HemisphereLight(0x8a8f94, 0x0a0a0a, 1.1);
  scene.add(hemi);
  const keyLight = new THREE.DirectionalLight(0xffffff, 0.9);
  keyLight.position.set(3, 4, 5);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0xd6ff3f, 0.85);
  rimLight.position.set(-4, 2, -3);
  scene.add(rimLight);
  const fillLight = new THREE.AmbientLight(0x4d545a, 0.4);
  scene.add(fillLight);

  const draco = new DRACOLoader();
  draco.setDecoderPath("/draco/");
  const loader = new GLTFLoader();
  loader.setDRACOLoader(draco);

  const gltf = await loader.loadAsync(MODEL_URL, onProgress);
  const model = gltf.scene;

  const box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  const scale = 2.4 / maxDim;

  model.scale.setScalar(scale);
  model.position.sub(center.multiplyScalar(scale));
  model.rotation.set(0.06, 0.35, 0);

  restyleMaterials(model);
  applyScreenMockup(model);
  scene.add(model);

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener("resize", onResize);

  let rafId = 0;
  function render() {
    renderer.render(scene, camera);
    rafId = requestAnimationFrame(render);
  }
  render();

  const dispose = () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener("resize", onResize);
    draco.dispose();
    renderer.dispose();
  };

  return { scene, camera, renderer, model, dispose };
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS. (Se acusar erro em `three/examples/jsm/...`, confirmar que `@types/three` foi instalado na Task 4; os loaders são tipados por lá.)

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/three
git commit -m "Porta scene e screen-texture do prototipo para TS"
```

---

### Task 6: Copy compartilhada dos painéis

**Files:**
- Create: `src/components/marketing/landing-copy.ts`

**Interfaces:**
- Produces: `PAINEIS: Panel[]` onde
  `Panel = { eyebrow: string; headline: string; lede?: string; align: "left" | "right"; stats?: { num: string; label: string }[]; hint?: boolean }`

- [ ] **Step 1: Criar `src/components/marketing/landing-copy.ts`**

```ts
export interface PanelStat {
  num: string;
  label: string;
}

export interface Panel {
  eyebrow: string;
  headline: string;
  lede?: string;
  align: "left" | "right";
  stats?: PanelStat[];
  hint?: boolean;
}

// Copy dos 4 painéis do palco 3D. Compartilhada entre o palco animado
// (landing-3d-stage) e o fallback estático (landing-hero). `headline` aceita
// "\n" para quebras de linha intencionais.
export const PAINEIS: Panel[] = [
  {
    eyebrow: "realgains",
    headline: "Cada treino,\num degrau.",
    lede: "O app que transforma sua evolução na academia em números que fazem sentido.",
    align: "left",
    hint: true,
  },
  {
    eyebrow: "feito pro seu bolso",
    headline: "No seu celular.\nNa sua mochila.\nNo seu treino.",
    lede: "Sem planilha, sem caderninho. Seu histórico de carga sempre à mão, direto na palma da mão.",
    align: "right",
  },
  {
    eyebrow: "progressão automática",
    headline: "Registre a carga.\nA gente calcula o resto.",
    lede: "O RealGains acompanha cada série e mostra o próximo passo — sem achismo, sem estagnar.",
    align: "left",
  },
  {
    eyebrow: "resultado real",
    headline: "Quem registra,\nevolui mais rápido.",
    align: "right",
    stats: [
      { num: "+12%", label: "carga em 30 dias" },
      { num: "0", label: "planilhas perdidas" },
    ],
  },
];
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/landing-copy.ts
git commit -m "Adiciona copy compartilhada dos paineis da LP"
```

---

### Task 7: Palco 3D (`landing-3d-stage.tsx`)

**Files:**
- Create: `src/components/marketing/landing-3d-stage.tsx`

**Interfaces:**
- Consumes: `initScene`/`SceneHandle` (Task 5), `PAINEIS` (Task 6), `gsap`, `gsap/ScrollTrigger`.
- Produces: `default` export `Landing3DStage` (client component, sem props). É este módulo que será carregado com `ssr:false` pela Task 8.

- [ ] **Step 1: Criar `src/components/marketing/landing-3d-stage.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initScene, type SceneHandle } from "./three/scene";
import { PAINEIS } from "./landing-copy";

gsap.registerPlugin(ScrollTrigger);

export default function LandingStage() {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    let handle: SceneHandle | null = null;
    let cancelado = false;
    const ctx = gsap.context(() => {}, stage);

    (async () => {
      const scene = await initScene(canvas, {
        onProgress: (event) => {
          if (!event.total) return;
          setProgress(Math.min(100, (event.loaded / event.total) * 100));
        },
      });
      if (cancelado) {
        scene.dispose();
        return;
      }
      handle = scene;
      setProgress(100);
      setCarregado(true);

      const { camera, model } = scene;
      model.position.x += 0.4;

      ctx.add(() => {
        // Timeline do giro/translação do iPhone, atrelada ao scroll do palco.
        const tl = gsap.timeline({
          scrollTrigger: { trigger: stage, start: "top top", end: "bottom bottom", scrub: 1 },
        });
        tl.to(model.rotation, { y: -0.5, x: -0.05, duration: 1 }, 0)
          .to(model.position, { x: -0.5, duration: 1 }, 0)
          .to(model.rotation, { y: 0.55, x: -0.18, duration: 1 }, 1)
          .to(model.position, { x: 0.55, y: -0.05, duration: 1 }, 1)
          .to(camera.position, { z: 4.6, duration: 1 }, 1)
          .to(model.rotation, { y: -0.6, x: 0.05, duration: 1 }, 2)
          .to(model.position, { x: -0.45, y: 0, duration: 1 }, 2)
          .to(camera.position, { z: 6.2, duration: 1 }, 2);

        // Barra de progresso do scroll.
        ScrollTrigger.create({
          trigger: stage,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (progressRef.current) progressRef.current.style.width = `${self.progress * 100}%`;
          },
        });

        // Reveal de cada painel ao entrar na viewport.
        stage.querySelectorAll<HTMLElement>(".rg-panel__inner").forEach((el) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el.closest(".rg-panel"),
              start: "top 55%",
              end: "bottom 45%",
              toggleActions: "play reverse play reverse",
            },
          });
        });
      });
    })();

    return () => {
      cancelado = true;
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      if (handle) handle.dispose();
    };
  }, []);

  return (
    <>
      {!carregado && (
        <div className="rg-loader">
          <span className="rg-loader__word">REALGAINS</span>
          <div className="rg-loader__bar">
            <div className="rg-loader__bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <div className="rg-scroll-progress" aria-hidden>
        <div ref={progressRef} className="rg-scroll-progress__fill" />
      </div>

      <section ref={stageRef} className="rg-stage">
        <canvas ref={canvasRef} className="rg-canvas" id="webgl" />

        {PAINEIS.map((p, i) => (
          <div key={i} className="rg-panel" data-panel={i}>
            <div className={`rg-panel__inner${p.align === "right" ? " rg-panel__inner--right" : ""}`}>
              <p className="mb-4 text-xs font-semibold tracking-[0.14em] text-primary uppercase">{p.eyebrow}</p>
              <h2 className="mb-5 text-[clamp(2rem,5vw,4rem)] leading-[1.02] font-bold tracking-tight whitespace-pre-line">
                {p.headline}
              </h2>
              {p.lede && (
                <p className="max-w-[34ch] text-[1.05rem] leading-relaxed text-muted-foreground">{p.lede}</p>
              )}
              {p.stats && (
                <div className="mt-4 flex justify-end gap-12">
                  {p.stats.map((s) => (
                    <div key={s.label} className="flex flex-col items-end">
                      <span className="text-4xl font-bold tracking-tight text-primary">{s.num}</span>
                      <span className="text-xs tracking-[0.06em] text-muted-foreground uppercase">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
              {p.hint && (
                <div className="mt-14 flex items-center gap-3 text-[0.7rem] tracking-[0.1em] text-muted-foreground uppercase">
                  <span>role para explorar</span>
                  <span className="relative block h-px w-10 overflow-hidden bg-muted-foreground">
                    <span className="absolute inset-0 bg-primary [animation:rg-scroll-line_1.6s_ease-in-out_infinite]" />
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
```

- [ ] **Step 2: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/landing-3d-stage.tsx
git commit -m "Adiciona o palco 3D scroll-driven da LP"
```

---

### Task 8: Wrapper client com gate de reduced-motion (`landing-hero.tsx`)

**Files:**
- Create: `src/components/marketing/landing-hero.tsx`

**Interfaces:**
- Consumes: `Landing3DStage` (Task 7, via `next/dynamic` `ssr:false`), `PAINEIS` (Task 6), `next/image`.
- Produces: `default` export `LandingHero` (client component, sem props). Usado por `page.tsx` (Task 9).

- [ ] **Step 1: Ler o doc de imagem do Next**

Run: `sed -n '1,80p' node_modules/next/dist/docs/01-app/01-getting-started/12-images.md`
Expected: confirmar a API de `next/image` desta versão (props `src`, `width`, `height`, `alt`, `priority`).

- [ ] **Step 2: Criar `src/components/marketing/landing-hero.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { PAINEIS } from "./landing-copy";

// ssr:false só é permitido em Client Component (por isso este wrapper existe).
// Ver node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md.
const LandingStage = dynamic(() => import("./landing-3d-stage"), { ssr: false });

export default function LandingHero() {
  // undefined enquanto não checou no cliente (evita mismatch de hidratação).
  const [reduzido, setReduzido] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduzido(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduzido(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Antes de resolver a preferência, reserva a altura da viewport (sem CLS).
  if (reduzido === undefined) return <div className="min-h-dvh" aria-hidden />;

  if (reduzido) {
    // Fallback estático: painéis empilhados + imagem do app (sem Three.js/Draco).
    return (
      <section className="mx-auto grid max-w-6xl gap-16 px-6 py-16">
        <div className="relative mx-auto w-full max-w-[260px]">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-card">
            <Image
              src="/marketing/dashboard-preview.png"
              alt="Tela inicial do RealGains com o treino do dia e o volume semanal"
              width={390}
              height={844}
              className="h-auto w-full"
              priority
            />
          </div>
        </div>
        <div className="grid gap-12">
          {PAINEIS.map((p, i) => (
            <div key={i}>
              <p className="mb-3 text-xs font-semibold tracking-[0.14em] text-primary uppercase">{p.eyebrow}</p>
              <h2 className="mb-3 text-3xl font-bold tracking-tight whitespace-pre-line sm:text-4xl">{p.headline}</h2>
              {p.lede && <p className="max-w-[46ch] text-[15px] leading-relaxed text-muted-foreground">{p.lede}</p>}
              {p.stats && (
                <div className="mt-4 flex gap-12">
                  {p.stats.map((s) => (
                    <div key={s.label} className="flex flex-col">
                      <span className="text-4xl font-bold tracking-tight text-primary">{s.num}</span>
                      <span className="text-xs tracking-[0.06em] text-muted-foreground uppercase">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    );
  }

  return <LandingStage />;
}
```

- [ ] **Step 3: Verificar tipos**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/landing-hero.tsx
git commit -m "Adiciona wrapper da LP com fallback de reduced-motion"
```

---

### Task 9: Reescrever a landing page (`page.tsx`)

**Files:**
- Modify (rewrite): `src/app/page.tsx`

**Interfaces:**
- Consumes: `LandingHero` (Task 8), `WaitlistForm` (`@/components/marketing/waitlist-form`), `lucide-react`, `next/link`.
- Produces: `default` export `LandingPage` (server component).

- [ ] **Step 1: Substituir `src/app/page.tsx` inteiro**

```tsx
import Link from "next/link";
import { Calendar, Hand, Lock, Target, TrendingUp, Zap } from "lucide-react";
import { WaitlistForm } from "@/components/marketing/waitlist-form";
import LandingHero from "@/components/marketing/landing-hero";

const PASSOS = [
  { numero: "1", titulo: "Monte seu treino", descricao: "Estruture seus dias e exercícios do seu jeito, sem modelos fixos." },
  { numero: "2", titulo: "Registre a série", descricao: "Carga, reps e qualidade em três toques, entre uma série e outra." },
  { numero: "3", titulo: "Veja a evolução", descricao: "Gráfico de carga por exercício e volume semanal, sem esforço." },
];

const BENEFICIOS = [
  { icon: TrendingUp, titulo: "Progressão real", descricao: "Todo exercício com seu próprio histórico de carga, sem se perder em planilhas." },
  { icon: Hand, titulo: "Toques grandes", descricao: "Interface pensada pra registrar suado, entre séries, sem precisão de laboratório." },
  { icon: Calendar, titulo: "Seu treino, sua ordem", descricao: "Monte a divisão que quiser, sem forçar PPL, Upper/Lower ou qualquer modelo." },
  { icon: Target, titulo: "Qualidade da série", descricao: "Marque se a série foi boa, razoável ou ruim: contexto que a carga sozinha não dá." },
  { icon: Zap, titulo: "Rápido de verdade", descricao: "Registrar uma série leva menos tempo do que descansar entre elas." },
  { icon: Lock, titulo: "Seus dados", descricao: "Seu histórico fica com você, sem redes sociais, sem feed, sem distração." },
];

const BENEFICIOS_BETA = [
  "Registro ilimitado de séries",
  "Histórico e gráficos por exercício",
  "Treinos e dias sem limite",
  "Acesso antecipado a novidades",
];

export default function LandingPage() {
  return (
    <div className="bg-background text-foreground">
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-6 py-5 sm:px-8">
        <span className="text-lg font-bold tracking-tight">RealGains</span>
        <Link
          href="/dashboard"
          className="rounded-full border border-border px-4 py-2 text-[13px] font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
        >
          Entrar
        </Link>
      </header>

      {/* Experiência 3D (ou fallback estático em reduced-motion) */}
      <LandingHero />

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-[12px] font-bold tracking-[0.14em] text-primary uppercase">Como funciona</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Três passos. Toda vez.</h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-3">
            {PASSOS.map((passo) => (
              <div key={passo.numero} className="bg-card p-8">
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-[13px] font-bold text-primary">
                  {passo.numero}
                </span>
                <h3 className="mt-5 text-[17px] font-bold tracking-tight">{passo.titulo}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{passo.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <p className="text-[12px] font-bold tracking-[0.14em] text-primary uppercase">Por que o RealGains</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Feito pra usar dentro da academia.</h2>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            {BENEFICIOS.map((b) => (
              <div key={b.titulo}>
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-primary">
                  <b.icon size={20} />
                </span>
                <h3 className="mt-4 text-[15px] font-bold tracking-tight">{b.titulo}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{b.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <p className="text-[12px] font-bold tracking-[0.14em] text-primary uppercase">Preço</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Grátis durante o beta.</h2>
          <div className="mx-auto mt-12 max-w-md rounded-2xl border border-border bg-card p-8 text-left">
            <p className="text-[12px] font-bold tracking-[0.14em] text-primary uppercase">Beta</p>
            <p className="mt-2 text-5xl font-bold tracking-tight">R$ 0</p>
            <p className="mt-1 text-[14px] text-muted-foreground">enquanto durar o beta fechado</p>
            <ul className="mt-6 flex flex-col gap-2.5 text-[14px]">
              {BENEFICIOS_BETA.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <a
              href="#waitlist"
              className="mt-8 flex h-12 items-center justify-center rounded-xl bg-primary px-6 text-[15px] font-bold text-primary-foreground transition-transform hover:scale-[1.02]"
            >
              Garantir acesso ao beta
            </a>
          </div>
        </div>
      </section>

      <section id="waitlist" className="scroll-mt-6 border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <h2 className="mx-auto max-w-[26ch] text-3xl font-bold tracking-tight sm:text-4xl">
            Sua próxima carga máxima começa aqui.
          </h2>
          <p className="mx-auto mt-4 max-w-[40ch] text-[15px] text-muted-foreground">
            Entre na lista e seja avisado assim que o RealGains abrir.
          </p>
          <WaitlistForm className="mx-auto mt-8 max-w-md" helperText="Sem spam. Um único e-mail quando o app abrir." />
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-1 px-6 py-10 text-center text-[13px] text-muted-foreground">
          <span className="font-bold text-foreground">RealGains</span>
          <span>© 2026 RealGains. Todos os direitos reservados.</span>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 2: Verificar build**

Run: `npm run build`
Expected: build conclui sem erro; a rota `/` aparece na saída.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "Reestrutura a landing page com a experiencia 3D e secoes editoriais"
```

---

### Task 10: Ajuste de scrim dos overlays + verificação final

**Files:**
- Modify: `src/components/ui/dialog.tsx:34` (scrim), `src/components/ui/sheet.tsx:31` (scrim)

**Interfaces:**
- Consumes: tudo das tasks anteriores.
- Produces: nada novo.

- [ ] **Step 1: Reforçar o scrim dos overlays no tema escuro**

Em `src/components/ui/dialog.tsx` (linha ~34) e `src/components/ui/sheet.tsx` (linha ~31), trocar `bg-black/10` por `bg-black/60` (scrim fraco some no fundo escuro; 60% preserva a legibilidade do conteúdo em primeiro plano — guideline de scrim 40–60%).

- [ ] **Step 2: Build + lint + tipos**

Run: `npm run build && npm run lint && npx tsc --noEmit`
Expected: os três passam sem erros.

- [ ] **Step 3: Confirmar ausência de resíduos de tema/claro**

Run: `grep -rn "useTheme\|toggleTheme\|ThemeProvider\|bg-white" src/`
Expected: nenhum resultado.

- [ ] **Step 4: Verificação manual no navegador**

Run: `npm run dev` e abrir `http://localhost:3000`.
Checar:
- Loader "REALGAINS" aparece e some; iPhone 3D surge e **gira/transladada conforme o scroll**; os 4 painéis revelam; barra de progresso do scroll preenche.
- Sem erros no console.
- CTA "Garantir acesso ao beta" rola suave até o formulário; enviar um e-mail de teste → mensagem de sucesso (insere no Supabase).
- Abrir `/dashboard`, `/treino`, `/registro`, `/login`: paleta escura nova, neumorfismo ainda legível, **sem** botão de alternar tema, sem flash branco no load.
- DevTools → Rendering → "Emulate prefers-reduced-motion: reduce" → recarregar `/`: cai no **layout estático empilhado** (sem canvas 3D), painéis legíveis.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/dialog.tsx src/components/ui/sheet.tsx
git commit -m "Reforca o scrim dos overlays no tema escuro"
```

---

## Self-Review

**Cobertura da spec:**
- Recolor dark-only (site inteiro) → Task 1 (tokens) + Task 2/3 (baked dark, remove toggle). ✓
- Manter neumorfismo do app → tokens `--shadow-soft-*` preservados (Task 1). ✓
- Deps + assets (three/gsap/glb/draco) → Task 4. ✓
- Portar 3D (scene/screen-texture/scroll) → Tasks 5 e 7. ✓
- LP: loader, nav com "Entrar", palco 3D com 4 painéis + stats, como funciona, benefícios, preço, CTA waitlist real, footer → Tasks 7, 8, 9. ✓
- Waitlist real do Supabase mantido → Task 9 reusa `WaitlistForm` sem alterá-lo. ✓
- `prefers-reduced-motion` (sem Three.js) → Task 8. ✓
- Indicador de progresso de scroll → Task 7. ✓
- `ssr:false` só em client → Task 8 (wrapper) respeita o doc do Next. ✓
- Ler docs do Next antes das APIs → Steps citam os caminhos (lazy-loading, images). ✓
- Ajuste de scrim (achado no recolor) → Task 10. ✓

**Placeholder scan:** sem TBD/TODO; todo passo de código traz o código completo. ✓

**Consistência de tipos:** `SceneHandle`/`initScene` (Task 5) batem com o uso na Task 7; `Panel`/`PAINEIS` (Task 6) batem com Tasks 7 e 8; `ThemeInitScript` (Task 2) sem props, usado em `layout.tsx`. Classes CSS `rg-*` definidas na Task 1 e usadas na Task 7. ✓

**Escopo:** um único plano coeso (recolor + LP). App interno só recolore. ✓
