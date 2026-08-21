import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import type {
  RuntimeFrame,
  RuntimeScene,
} from "@/runtime/canvas/RuntimeScene";
import { qualityManager } from "@/runtime/quality/QualityManager";

const ROCK_MODEL_URL = "/api/polyhaven/rock/model?v=3";

export class ServicesScene implements RuntimeScene {
  readonly id = "home-services";

  private readonly canvas: HTMLCanvasElement;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  private readonly renderer: THREE.WebGLRenderer;
  private readonly root = new THREE.Group();
  private readonly environmentTarget: THREE.WebGLRenderTarget;
  private rock: THREE.Object3D | null = null;
  private destroyed = false;

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

    const ambient = new THREE.AmbientLight(0xffffff, 0.22);
    const key = new THREE.DirectionalLight(0xf2eee5, 3.1);
    key.position.set(-2.4, 3.5, 4.8);

    const fill = new THREE.DirectionalLight(0x8695aa, 1.05);
    fill.position.set(3.2, 0.6, 2.2);

    const rim = new THREE.DirectionalLight(0x596b80, 1.4);
    rim.position.set(0.5, -2.2, -3.5);

    this.scene.add(ambient, key, fill, rim);

    void this.loadRock();
  }

  private async loadRock() {
    try {
      const loader = new GLTFLoader();

      /*
       * Always load the rewritten same-origin glTF directly. The previous
       * resolver fetch used force-cache, so browsers could retain the old
       * Poly Haven URL and bypass our texture/bin proxy entirely.
       */
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

      rock.rotation.set(-0.08, -0.42, -0.13);

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
      this.root.add(rock);
    } catch (error) {
      console.error("Services rock model could not be loaded:", error);
    }
  }

  update(frame: RuntimeFrame) {
    if (this.rock) {
      const idle = Math.sin(frame.time * 0.45) * 0.035;
      this.rock.rotation.y = -0.42 + idle;
      this.rock.rotation.x = -0.08 + Math.cos(frame.time * 0.31) * 0.015;
      this.rock.position.y = Math.sin(frame.time * 0.55) * 0.035;
    }

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

    this.environmentTarget.dispose();
    this.renderer.dispose();
  }
}
