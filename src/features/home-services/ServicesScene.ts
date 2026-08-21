import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import type {
  RuntimeFrame,
  RuntimeScene,
} from "@/runtime/canvas/RuntimeScene";
import { qualityManager } from "@/runtime/quality/QualityManager";

import { ServicesSlab } from "./ServicesSlab";

function smoothStep(value: number) {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function createMarkTexture(label: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");
  if (!context) return null;

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
  private readonly camera = new THREE.PerspectiveCamera(37, 1, 0.1, 100);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly root = new THREE.Group();
  private readonly slabPivot = new THREE.Group();
  private readonly markRoot = new THREE.Group();
  private readonly environmentTarget: THREE.WebGLRenderTarget;
  private readonly markMaterials: THREE.MeshBasicMaterial[] = [];
  private readonly markTextures: THREE.Texture[] = [];
  private readonly slab = new ServicesSlab();
  private progressTarget = 0;
  private progressCurrent = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    qualityManager.init();
    this.camera.position.set(0, 0.01, 6.6);

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
    this.renderer.toneMappingExposure = 0.7;

    const room = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.environmentTarget = pmrem.fromScene(room);
    this.scene.environment = this.environmentTarget.texture;
    room.dispose();
    pmrem.dispose();

    this.scene.add(this.root);
    this.root.add(this.slabPivot);
    this.slabPivot.add(this.slab.root, this.markRoot);

    const ambient = new THREE.AmbientLight(0xffffff, 0.11);

    const key = new THREE.DirectionalLight(0xe8e9e6, 2.55);
    key.position.set(-3.5, 4.5, 5.6);

    const side = new THREE.DirectionalLight(0x8290a2, 0.42);
    side.position.set(3.2, 0.9, 3.0);

    const rim = new THREE.DirectionalLight(0x68788b, 0.62);
    rim.position.set(1.2, -2.2, -4.0);

    this.scene.add(ambient, key, side, rim);

    this.createSurfaceMarks();
  }

  setProgress(progress: number) {
    this.progressTarget = THREE.MathUtils.clamp(progress, 0, 1);
  }

  private createSurfaceMarks() {
    const marks = [
      { label: "M", x: -0.52, y: -0.14, z: 0.235, size: 0.32 },
      { label: "N", x: 0.34, y: 0.44, z: 0.235, size: 0.3 },
      { label: "B", x: 0.43, y: -0.36, z: 0.235, size: 0.28 },
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
      mesh.rotation.z = mark.x * -0.18;
      mesh.renderOrder = 5;

      this.markTextures.push(texture);
      this.markMaterials.push(material);
      this.markRoot.add(mesh);
    });

    const lineMaterial = new THREE.MeshBasicMaterial({
      color: 0xf1efe9,
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
      line.renderOrder = 5;
      this.markRoot.add(line);
    };

    makeLine(0.68, 0.016, -0.1, 0.14, 0.238, -0.5);
    makeLine(0.42, 0.014, 0.55, -0.07, 0.238, 0);
    makeLine(0.014, 0.42, 0.55, -0.07, 0.238, 0);

    this.markMaterials.push(lineMaterial);
    this.markRoot.visible = false;
  }

  update(frame: RuntimeFrame) {
    const ease = 1 - Math.exp(-8 * frame.delta);
    this.progressCurrent = THREE.MathUtils.lerp(
      this.progressCurrent,
      this.progressTarget,
      ease,
    );

    const progress = this.progressCurrent;
    const breakProgress = smoothStep((progress - 0.12) / 0.48);
    const settleProgress = smoothStep((progress - 0.6) / 0.18);
    const finalProgress = smoothStep((progress - 0.75) / 0.2);

    const idleX = Math.cos(frame.time * 0.31) * (1 - breakProgress) * 0.01;
    const idleY = Math.sin(frame.time * 0.45) * (1 - breakProgress) * 0.018;

    const introRotation = new THREE.Euler(-0.18, -0.34, -0.1);
    const breakRotation = new THREE.Euler(0.44, 1.46, 0.16);
    const settleRotation = new THREE.Euler(0.08, 0.24, 0.01);
    const finalRotation = new THREE.Euler(-0.045, -0.08, -0.014);

    const introQuaternion = new THREE.Quaternion().setFromEuler(introRotation);
    const breakQuaternion = new THREE.Quaternion().setFromEuler(breakRotation);
    const settleQuaternion = new THREE.Quaternion().setFromEuler(settleRotation);
    const finalQuaternion = new THREE.Quaternion().setFromEuler(finalRotation);

    const qA = introQuaternion.clone().slerp(breakQuaternion, breakProgress);
    const qB = qA.clone().slerp(settleQuaternion, settleProgress);
    const qFinal = qB.clone().slerp(finalQuaternion, finalProgress);

    this.slabPivot.quaternion.copy(qFinal);
    this.slabPivot.rotation.x += idleX;
    this.slabPivot.rotation.y += idleY;

    const introScale = 0.43;
    const breakScale = THREE.MathUtils.lerp(introScale, 0.65, breakProgress);
    const settleScale = THREE.MathUtils.lerp(breakScale, 0.67, settleProgress);
    const finalScale = THREE.MathUtils.lerp(settleScale, 0.7, finalProgress);

    this.slabPivot.scale.set(
      finalScale,
      finalScale * THREE.MathUtils.lerp(1, 1.01, finalProgress),
      finalScale,
    );

    const introPosition = new THREE.Vector3(0, 0.6, 0);
    const breakPosition = new THREE.Vector3(0.06, 0.04, 0);
    const settlePosition = new THREE.Vector3(0, -0.01, 0);
    const finalPosition = new THREE.Vector3(0, -0.005, -0.06);

    const position = introPosition
      .clone()
      .lerp(breakPosition, breakProgress)
      .lerp(settlePosition, settleProgress)
      .lerp(finalPosition, finalProgress);

    this.slabPivot.position.copy(position);

    const marksIn = smoothStep((progress - 0.31) / 0.22);
    const marksOut = 1 - smoothStep((progress - 0.63) / 0.1);
    const markOpacity = marksIn * marksOut * 0.84;

    this.markRoot.visible = markOpacity > 0.002;
    this.markMaterials.forEach((material) => {
      material.opacity = markOpacity;
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
    this.markRoot.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => material.dispose());
    });

    this.markTextures.forEach((texture) => texture.dispose());
    this.slab.dispose();
    this.environmentTarget.dispose();
    this.renderer.dispose();
  }
}
