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
