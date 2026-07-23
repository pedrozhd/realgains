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
  camera.position.set(0, 0, 5.6);

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
  // Praticamente reto no painel inicial (antes do usuário rolar) — só uma
  // inclinação bem sutil pra luz não bater chapada.
  model.rotation.set(0.02, 0.08, 0);

  restyleMaterials(model);
  applyScreenMockup(model, renderer.capabilities.getMaxAnisotropy());
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
