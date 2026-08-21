import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import type {
  RuntimeFrame,
  RuntimeScene,
} from "@/runtime/canvas/RuntimeScene";
import { qualityManager } from "@/runtime/quality/QualityManager";

const ROCK_MODEL_URL = "/api/polyhaven/rock/model?v=4";

function smoothStep(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function createMarkTexture(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");

  if (!context) {
    return null;
  }

  context.clearRect(0, 0, 256, 256);
  context.fillStyle = "rgba(247, 245, 238, 0.96)";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "500 154px Arial, Helvetica, sans-serif";
  context.fillText(label, 128, 137);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

export class ServicesScene implements RuntimeScene {
  readonly id = "home-services";

  private readonly canvas: HTMLCanvasElement;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly root = new THREE.Group();
  private readonly rockPivot = new THREE.Group();
  private readonly markRoot = new THREE.Group();
  private readonly environmentTarget: THREE.WebGLRenderTarget;
  private readonly markMaterials: THREE.MeshBasicMaterial[] = [];
  private readonly markTextures: THREE.Texture[] = [];
  private rock: THREE.Object3D | null = null;
  private destroyed = false;
  private progressTarget = 0;
  private progressCurrent = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    qualityManager.init();

    this.camera.position.set(0, 0.08, 5.2);

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: qualityManager.preset.antialias,
      powerPreference: "high-performance",
    });

    this.renderer.setPixelRatio(Math.min(qualityManager.pixelRatio, 1.5));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.78;

    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environmentTarget = pmrem.fromScene(room);
    this.scene.environment = this.environmentTarget.texture;
    room.dispose();
    pmrem.dispose();

    this.scene.add(this.root);
    this.root.add(this.rockPivot);
    this.rockPivot.add(this.markRoot);

    const ambient = new THREE.AmbientLight(0xffffff, 0.22);
    const key = new THREE.DirectionalLight(0xf2eee5, 3.1);
    key.position.set(-2.4, 3.5, 4.8);

    const fill = new THREE.DirectionalLight(0x8695aa, 1.05);
    fill.position.set(3.2, 0.6, 2.2);

    const rim = new THREE.DirectionalLight(0x596b80, 1.4);
    rim.position.set(0.5, -2.2, -3.5);

    this.scene.add(ambient, key, fill, rim);

    this.createSurfaceMarks();
    void this.loadRock();
  }

  setProgress(progress: number) {
    this.progressTarget = THREE.MathUtils.clamp(progress, 0, 1);
  }

  private createSurfaceMarks() {
    const marks = [
      { label: "M", x: -0.54, y: -0.15, z: 1.08, size: 0.34 },
      { label: "N", x: 0.38, y: 0.43, z: 1.1, size: 0.32 },
      { label: "B", x: 0.48, y: -0.39, z: 1.07, size: 0.3 },
    ];

    marks.forEach((mark) => {
      const texture = createMarkTexture(mark.label);
      if (!texture) return;

      const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: true,
        toneMapped: false,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(mark.size, mark.size),
        material,
      );

      mesh.position.set(mark.x, mark.y, mark.z);
      mesh.rotation.set(-0.04, 0.02, mark.x * -0.18);
      mesh.renderOrder = 4;

      this.markTextures.push(texture);
      this.markMaterials.push(material);
      this.markRoot.add(mesh);
    });

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0xf3f1eb,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      depthTest: true,
      toneMapped: false,
      side: THREE.DoubleSide,
    });

    const makeLine = (
      width: number,
      height: number,
      x: number,
      y: number,
      z: number,
      rotation: number,
    ) => {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(width, height),
        lineMaterial,
      );
      line.position.set(x, y, z);
      line.rotation.z = rotation;
      line.renderOrder = 4;
      this.markRoot.add(line);
    };

    makeLine(0.72, 0.018, -0.1, 0.15, 1.09, -0.48);
    makeLine(0.48, 0.016, 0.57, -0.08, 1.1, 0);
    makeLine(0.016, 0.48, 0.57, -0.08, 1.1, 0);

    this.markMaterials.push(lineMaterial);
    this.markRoot.visible = false;
  }

  private async loadRock() {
    try {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(ROCK_MODEL_URL);

      if (this.destroyed) {
        gltf.scene.traverse((object) => {
          if (!(object instanceof THREE.Mesh)) return;
          object.geometry.dispose();
          const materials = Array.isArray(object.material)
            ? object.material
            : [object.material];
          materials.forEach((material) => material.dispose());
        });
        return;
      }

      const rock = gltf.scene;
      rock.updateMatrixWorld(true);

      const box = new THREE.Box3().setFromObject(rock);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const largestAxis = Math.max(size.x, size.y, size.z, 0.0001);
      const scale = 2.9 / largestAxis;

      rock.scale.setScalar(scale);
      rock.position.set(
        -center.x * scale,
        -center.y * scale,
        -center.z * scale,
      );

      rock.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;

        object.castShadow = false;
        object.receiveShadow = false;
        object.frustumCulled = false;

        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];

        materials.forEach((material) => {
          if (!(material instanceof THREE.MeshStandardMaterial)) return;
          material.roughness = Math.max(material.roughness, 0.88);
          material.metalness = 0;
          material.envMapIntensity = 0.72;
          material.needsUpdate = true;
        });
      });

      this.rock = rock;
      this.rockPivot.add(rock);
    } catch (error) {
      console.error("Services rock model could not be loaded:", error);
    }
  }

  update(frame: RuntimeFrame) {
    const ease = 1 - Math.exp(-8 * frame.delta);
    this.progressCurrent = THREE.MathUtils.lerp(
      this.progressCurrent,
      this.progressTarget,
      ease,
    );

    const progress = this.progressCurrent;
    const breakProgress = smoothStep((progress - 0.12) / 0.58);
    const settleProgress = smoothStep((progress - 0.64) / 0.36);

    const idleY = Math.sin(frame.time * 0.45) * (1 - breakProgress) * 0.035;
    const idleX = Math.cos(frame.time * 0.31) * (1 - breakProgress) * 0.015;

    this.rockPivot.rotation.x =
      THREE.MathUtils.lerp(-0.08, 0.72, breakProgress) -
      settleProgress * 0.56 +
      idleX;
    this.rockPivot.rotation.y =
      THREE.MathUtils.lerp(-0.42, 2.22, breakProgress) +
      settleProgress * 0.5 +
      idleY;
    this.rockPivot.rotation.z =
      THREE.MathUtils.lerp(-0.13, 0.28, breakProgress) -
      settleProgress * 0.12;

    const scale =
      THREE.MathUtils.lerp(0.82, 1.08, breakProgress) -
      settleProgress * 0.05;
    this.rockPivot.scale.setScalar(scale);

    this.rockPivot.position.x =
      THREE.MathUtils.lerp(0, 0.16, breakProgress) -
      settleProgress * 0.16;
    this.rockPivot.position.y =
      Math.sin(frame.time * 0.55) * 0.035 * (1 - breakProgress) +
      THREE.MathUtils.lerp(0.54, 0.02, breakProgress) -
      settleProgress * 0.05;

    const marksProgress = smoothStep((progress - 0.34) / 0.28);
    this.markRoot.visible = marksProgress > 0.002;
    this.markMaterials.forEach((material) => {
      material.opacity = marksProgress * 0.88;
    });

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const width = Math.max(1, this.canvas.clientWidth);
    const height = Math.max(1, this.canvas.clientHeight);

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  destroy() {
    this.destroyed = true;

    this.root.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => material.dispose());
    });

    this.markTextures.forEach((texture) => texture.dispose());
    this.environmentTarget.dispose();
    this.renderer.dispose();
  }
}
