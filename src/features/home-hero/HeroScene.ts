import * as THREE from "three";

import type {
  RuntimeFrame,
  RuntimeScene,
} from "@/runtime/canvas/RuntimeScene";

import {
  qualityManager,
} from "@/runtime/quality/QualityManager";

import {
  HeroModel,
} from "./HeroModel";

import {
  HeroWeldLines,
} from "./HeroWeldLines";

type HeroSceneEvents = {
  onChargeStart?:
    () => void;

  onChargeProgress?:
    (
      progress:
        number,
    ) => void;

  onBlast?:
    () => void;

  onReturnStart?:
    () => void;

  onHoverPanel?:
    () => void;

  onWeldSpark?:
    () => void;

  onVibrate?:
    (
      amount:
        number,
      phase:
        number,
    ) => void;
};

export class HeroScene implements RuntimeScene {
  readonly id =
    "home-hero";

  private readonly canvas:
    HTMLCanvasElement;

  private readonly scene:
    THREE.Scene;

  private readonly camera:
    THREE.PerspectiveCamera;

  private readonly renderer:
    THREE.WebGLRenderer;

  private readonly root =
    new THREE.Group();

  private readonly model =
    new HeroModel();

  private readonly weldLines =
    new HeroWeldLines();

  private readonly raycaster =
    new THREE.Raycaster();

  private readonly pointerTarget =
    new THREE.Vector2();

  private readonly pointerCurrent =
    new THREE.Vector2();

  private readonly events:
    HeroSceneEvents;

  private readonly warmLight:
    THREE.PointLight;

  private hoveredMesh:
    THREE.Mesh | null =
      null;

  private pointerActive =
    false;

  private pointerPixelX =
    -9999;

  private pointerPixelY =
    -9999;

  // -------------------------
  // SHARED INTERACTION STATE
  // -------------------------

  private scrollProgress =
    0;

  private hoverAmount =
    0;

  private clickBurst =
    0;

  /*
   * Page transition intro
   * contribution ileride
   * transitionReady sistemiyle
   * bağlanacak.
   */
  private introAmount =
    0;

  // -------------------------
  // HOLD STATE
  // -------------------------

  private holding =
    false;

  private holdTime =
    0;

  private chargeProgress =
    0;

  private blastTriggered =
    false;

  private vibrateAmount =
    0;

  private vibratePhase =
    0;

  // -------------------------
  // ROTATION
  // -------------------------

  private rotationX =
    0;

  private rotationY =
    0;

  constructor(
    canvas:
      HTMLCanvasElement,

    events:
      HeroSceneEvents = {},
  ) {
    this.canvas =
      canvas;

    this.events =
      events;

    qualityManager.init();

    // -------------------------
    // SCENE
    // -------------------------

    this.scene =
      new THREE.Scene();

    // -------------------------
    // CAMERA
    // -------------------------

    this.camera =
      new THREE.PerspectiveCamera(
        42,
        1,
        0.1,
        100,
      );

    this.camera
      .position.z =
      5;

    // -------------------------
    // RENDERER
    // -------------------------

    this.renderer =
      new THREE.WebGLRenderer(
        {
          canvas,

          alpha:
            true,

          antialias:
            qualityManager
              .preset
              .antialias,

          powerPreference:
            "high-performance",
        },
      );

    this.renderer
      .setPixelRatio(
        qualityManager
          .pixelRatio,
      );

    this.renderer
      .setClearColor(
        0x000000,
        0,
      );

    this.renderer
      .autoClear =
      false;

    // -------------------------
    // ROOT
    // -------------------------

    this.scene.add(
      this.root,
    );

    this.root.add(
      this.model.root,
    );

    // -------------------------
    // MODEL
    // -------------------------

    void this.model
      .load(
        "/models/trionn-test-model.glb",
      )
      .catch(
        (
          error,
        ) => {
          console.error(
            "Hero model could not be loaded:",
            error,
          );
        },
      );

    // -------------------------
    // LIGHTS
    // -------------------------

    const ambient =
      new THREE.AmbientLight(
        0xffffff,
        0.85,
      );

    const keyLight =
      new THREE.DirectionalLight(
        0xffffff,
        2.5,
      );

    keyLight
      .position
      .set(
        3,
        4,
        5,
      );

    this.warmLight =
      new THREE.PointLight(
        0xff4d00,
        14,
        8,
      );

    this.warmLight
      .position
      .set(
        1.5,
        -0.8,
        2,
      );

    this.scene.add(
      ambient,
      keyLight,
      this.warmLight,
    );
  }

  // -------------------------
  // POINTER
  // -------------------------

  setPointer(
    x: number,
    y: number,
    pixelX: number,
    pixelY: number,
  ) {
    this.pointerTarget.set(
      x,
      y,
    );

    this.pointerPixelX =
      pixelX;

    this.pointerPixelY =
      pixelY;

    this.pointerActive =
      true;
  }

  resetPointer() {
    this.pointerTarget.set(
      0,
      0,
    );

    this.pointerPixelX =
      -9999;

    this.pointerPixelY =
      -9999;

    this.pointerActive =
      false;

    this.hoveredMesh =
      null;

    this.endHold();
  }

  // -------------------------
  // SCROLL
  // -------------------------

  setScrollProgress(
    progress: number,
  ) {
    this.scrollProgress =
      THREE.MathUtils
        .clamp(
          progress,
          0,
          1,
        );

    /*
     * Orijinal Hero hover/
     * hold bölgesi ilk %8.
     */
    if (
      this.scrollProgress >=
        0.08 &&
      this.holding
    ) {
      this.endHold();
    }
  }

  // -------------------------
  // HOLD
  // -------------------------

  startHold() {
    if (
      this.holding ||
      !this.hoveredMesh ||
      this.scrollProgress >=
        0.08 ||
      this.clickBurst >=
        0.05 ||
      this.introAmount >=
        0.08
    ) {
      return false;
    }

    this.holding =
      true;

    this.holdTime =
      0;

    this.chargeProgress =
      0;

    this.vibrateAmount =
      1;

    this.vibratePhase =
      0;

    this.clickBurst =
      0;

    this.blastTriggered =
      false;

    this.events
      .onChargeStart?.();

    return true;
  }

  endHold() {
    if (
      !this.holding
    ) {
      return;
    }

    this.holding =
      false;

    this.events
      .onReturnStart?.();
  }

  // -------------------------
  // HOVER
  // -------------------------

  private updateRaycast() {
    const canRaycast =
      this.pointerActive &&
      this.scrollProgress <
        0.08 &&
      this.clickBurst <
        0.05 &&
      this.introAmount <
        0.08 &&
      this.model
        .meshes
        .length >
        0;

    if (!canRaycast) {
      this.hoveredMesh =
        null;

      return;
    }

    this.raycaster
      .setFromCamera(
        this.pointerTarget,
        this.camera,
      );

    this.scene
      .updateMatrixWorld(
        true,
      );

    const intersections =
      this.raycaster
        .intersectObjects(
          this.model
            .meshes,
          false,
        );

    const nextMesh =
      intersections.length >
      0
        ? (
            intersections[0]
              .object as THREE.Mesh
          )
        : null;

    if (
      nextMesh !==
      this.hoveredMesh
    ) {
      if (nextMesh) {
        this.model
          .flashMesh(
            nextMesh,
          );

        this.events
          .onHoverPanel?.();
      }

      this.hoveredMesh =
        nextMesh;
    }
  }

  private updateHoverAmount(
    delta: number,
  ) {
    /*
     * hoverAmount'ın gerçek
     * private amplitude değeri
     * yayınlanmadı.
     *
     * Shared explode system
     * birebir aynı; bu tek
     * coefficient modelimize göre
     * tune edilecek.
     */
    const target =
      this.hoveredMesh
        ? 0.055
        : 0;

    const smoothing =
      1 -
      Math.exp(
        -10 *
          delta,
      );

    this.hoverAmount =
      THREE.MathUtils
        .lerp(
          this.hoverAmount,
          target,
          smoothing,
        );
  }

  // -------------------------
  // HOLD / BLAST
  // -------------------------

  private updateHold(
    delta: number,
  ) {
    this.vibratePhase +=
      delta *
      52;

    if (
      this.holding
    ) {
      this.holdTime +=
        delta;

      this.vibrateAmount =
        1;

      this.chargeProgress =
        Math.min(
          1,
          this.holdTime /
            0.5,
        );

      this.events
        .onChargeProgress?.(
          this.chargeProgress,
        );

      if (
        this.holdTime <
        0.5
      ) {
        this.clickBurst =
          0;
      } else {
        if (
          !this
            .blastTriggered
        ) {
          this.blastTriggered =
            true;

          this.events
            .onBlast?.();
        }

        /*
         * Orijinal:
         * +0.02/frame ~ 1.2/s
         */
        this.clickBurst =
          Math.min(
            1,
            this.clickBurst +
              delta *
                1.2,
          );

        this.vibrateAmount =
          0.88;
      }
    } else {
      if (
        this.chargeProgress >
        0
      ) {
        this.chargeProgress =
          Math.max(
            0,
            this.chargeProgress -
              delta *
                3,
          );

        this.events
          .onChargeProgress?.(
            this.chargeProgress,
          );
      }

      /*
       * Orijinal:
       * -0.025/frame ~ 1.5/s
       */
      this.clickBurst =
        Math.max(
          0,
          this.clickBurst -
            delta *
              1.5,
        );

      /*
       * Orijinal:
       * -0.08/frame
       */
      this.vibrateAmount =
        Math.max(
          0,
          this.vibrateAmount -
            delta *
              4.8,
        );

      if (
        this.clickBurst <=
        0.0001
      ) {
        this.blastTriggered =
          false;
      }
    }

    this.events
      .onVibrate?.(
        this.vibrateAmount,
        this.vibratePhase,
      );
  }

  // -------------------------
  // SHARED EXPLODE AMOUNT
  // -------------------------

  private getExplodeAmount() {
    const burstContribution =
      this.scrollProgress <
      0.15
        ? this.clickBurst
        : 0;

    return Math.max(
      this.scrollProgress,
      this.hoverAmount,
      burstContribution,
      this.introAmount,
    );
  }

  // -------------------------
  // IDLE ROTATION
  // -------------------------

  private updateRotation(
    frame: RuntimeFrame,
  ) {
    const rotationSpeed =
      qualityManager
        .prefersReducedMotion
        ? 0.0015
        : 0.0042;

    /*
     * Published value is
     * per-frame at ~60fps.
     */
    this.rotationY +=
      rotationSpeed *
      frame.delta *
      60;

    this.rotationX =
      THREE.MathUtils.clamp(
        this.rotationX,
        -Math.PI /
          2,
        Math.PI /
          2,
      );

    const frameLerp =
      1 -
      Math.pow(
        1 -
          0.06,
        frame.delta *
          60,
      );

    const targetX =
      this.rotationX +
      this.pointerCurrent
        .y *
        0.22;

    const targetY =
      this.rotationY +
      this.pointerCurrent
        .x *
        0.22;

    this.root.rotation.x +=
      (
        targetX -
        this.root
          .rotation.x
      ) *
      frameLerp;

    this.root.rotation.y +=
      (
        targetY -
        this.root
          .rotation.y
      ) *
      frameLerp;
  }

  // -------------------------
  // LIGHT
  // -------------------------

  private updateLight() {
    this.warmLight
      .intensity =
      14 +
      this.hoverAmount *
        30 +
      this.chargeProgress *
        12 +
      this.clickBurst *
        8;
  }

  // -------------------------
  // UPDATE
  // -------------------------

  update(
    frame: RuntimeFrame,
  ) {
    const pointerSmoothing =
      1 -
      Math.exp(
        -7 *
          frame.delta,
      );

    this.pointerCurrent
      .lerp(
        this.pointerTarget,
        pointerSmoothing,
      );

    this.updateRotation(
      frame,
    );

    this.updateRaycast();

    this.updateHoverAmount(
      frame.delta,
    );

    this.updateHold(
      frame.delta,
    );

    const explodeAmount =
      this.getExplodeAmount();

    this.model.update(
      frame.time,
      frame.delta,
      explodeAmount,
    );

    const weldResult =
      this.weldLines
        .update(
          frame.time,
          frame.delta,
          this.pointerPixelX,
          this.pointerPixelY,
          this.scrollProgress,
        );

    if (
      weldResult
        .burstStarted
    ) {
      this.events
        .onWeldSpark?.();
    }

    this.updateLight();

    // -------------------------
    // RENDER
    // -------------------------

    this.renderer.clear();

    this.weldLines.render(
      this.renderer,
    );

    this.renderer
      .clearDepth();

    this.renderer.render(
      this.scene,
      this.camera,
    );
  }

  // -------------------------
  // RESIZE
  // -------------------------

  resize() {
    const width =
      Math.max(
        this.canvas
          .clientWidth,
        1,
      );

    const height =
      Math.max(
        this.canvas
          .clientHeight,
        1,
      );

    this.camera.aspect =
      width /
      height;

    this.camera
      .updateProjectionMatrix();

    this.renderer
      .setPixelRatio(
        qualityManager
          .pixelRatio,
      );

    this.renderer
      .setSize(
        width,
        height,
        false,
      );

    this.weldLines.resize(
      width,
      height,
      qualityManager
        .pixelRatio,
    );

    /*
     * Desktop reference'te
     * symbol sağ-orta bölgede.
     */
    if (
      width <
      768
    ) {
      this.root
        .position
        .set(
          0,
          -0.2,
          0,
        );
    } else {
      this.root
        .position
        .set(
          0.55,
          -0.12,
          0,
        );
    }
  }

  // -------------------------
  // CLEANUP
  // -------------------------

  destroy() {
    this.weldLines
      .destroy();

    this.model
      .destroy();

    this.renderer
      .dispose();
  }
}