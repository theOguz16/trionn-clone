import * as THREE from "three";

import type {
  RuntimeScene,
} from "@/runtime/canvas/RuntimeScene";

import {
  qualityManager,
} from "@/runtime/quality/QualityManager";

export class ThreeLearningScene
  implements RuntimeScene
{
  readonly id = "three-learning-demo";

  readonly cube: THREE.Mesh;

  private readonly canvas: HTMLCanvasElement;

  private readonly scene: THREE.Scene;

  private readonly camera: THREE.PerspectiveCamera;

  private readonly renderer: THREE.WebGLRenderer;

  private readonly geometry: THREE.BoxGeometry;

  private readonly material: THREE.MeshNormalMaterial;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    this.scene = new THREE.Scene();

    this.camera =
      new THREE.PerspectiveCamera(
        45,
        1,
        0.1,
        100,
      );

    this.camera.position.z = 4.5;

    this.renderer =
     new THREE.WebGLRenderer({
        canvas,
        antialias:
           qualityManager.preset.antialias,
        alpha: true,
    });

    this.renderer.setPixelRatio(
      qualityManager.pixelRatio,
    );

    this.geometry =
      new THREE.BoxGeometry(
        1.2,
        1.2,
        1.2,
      );

    this.material =
      new THREE.MeshNormalMaterial();

    this.cube =
      new THREE.Mesh(
        this.geometry,
        this.material,
      );

    this.cube.position.x = -1.5;

    this.scene.add(this.cube);
  }

  update() {
    this.renderer.render(
        this.scene,
        this.camera,
    );
  }

  resize() {
    const width = Math.max(
      this.canvas.clientWidth,
      1,
    );

    const height = Math.max(
      this.canvas.clientHeight,
      1,
    );

    this.camera.aspect =
      width / height;

    this.camera.updateProjectionMatrix();

    this.renderer.setSize(
      width,
      height,
      false,
    );
  }

  destroy() {
    this.geometry.dispose();
    this.material.dispose();
    this.renderer.dispose();
  }
}