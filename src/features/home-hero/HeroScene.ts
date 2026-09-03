import * as THREE from "three";

import {
  RoomEnvironment,
} from "three/addons/environments/RoomEnvironment.js";

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
  onModelReady?: () => void;

  onModelError?: () => void;

  onChargeStart?: () => void;

  onChargeProgress?: (
    progress: number,
  ) => void;

  onBlast?: () => void;

  onReturnStart?: (
    completedBlast: boolean,
  ) => void;

  onInteractionChange?: (
    state: {
      phase:
        | "idle"
        | "charging"
        | "blasting"
        | "returning";
      progress: number;
      burst: number;
    },
  ) => void;

  onHoverPanel?: () => void;

  onWeldSpark?: () => void;

  onVibrate?: (
    amount: number,
    phase: number,
    burst: number,
    holdTime: number,
    holding: boolean,
  ) => void;
};

function seededRandom(
  seed: number,
) {
  let state =
    seed >>> 0;

  return () => {
    state =
      (
        state *
          1664525 +
        1013904223
      ) >>>
      0;

    return (
      state /
      4294967296
    );
  };
}

type CinematicFrame = {
  progress: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  targetX: number;
  targetY: number;
  fov: number;
  scale: number;
  rootX: number;
  rootY: number;
  rotationX: number;
  rotationY: number;
  exposure: number;
  ambient: number;
  key: number;
  upperRim: number;
  lowerRim: number;
  warmA: number;
  warmB: number;
  particles: number;
  glow: number;
};

const CINEMATIC_FRAMES:
  CinematicFrame[] = [
    {
      progress: 0,
      cameraX: 0,
      cameraY: 0,
      cameraZ: 5,
      targetX: 0,
      targetY: 0,
      fov: 40,
      scale: 0.48,
      rootX: 0,
      rootY: 0.055,
      rotationX: 0,
      rotationY: 0,
      exposure: 0.46,
      ambient: 0.016,
      key: 0.44,
      upperRim: 0.19,
      lowerRim: 0.14,
      warmA: 0.9,
      warmB: 0.3,
      particles: 0.25,
      glow: 0.08,
    },
    {
      progress: 0.25,
      cameraX: -0.08,
      cameraY: 0.04,
      cameraZ: 5.9,
      targetX: -0.04,
      targetY: 0.02,
      fov: 43,
      scale: 0.43,
      rootX: -0.04,
      rootY: 0.02,
      rotationX: -0.08,
      rotationY: 0.22,
      exposure: 0.42,
      ambient: 0.009,
      key: 0.3,
      upperRim: 0.11,
      lowerRim: 0.08,
      warmA: 0.48,
      warmB: 0.16,
      particles: 0.14,
      glow: 0.015,
    },
    {
      progress: 0.5,
      cameraX: 0.04,
      cameraY: -0.02,
      cameraZ: 4.72,
      targetX: 0.02,
      targetY: -0.01,
      fov: 38.5,
      scale: 0.5,
      rootX: 0.015,
      rootY: 0.015,
      rotationX: 0.045,
      rotationY: 0.48,
      exposure: 0.44,
      ambient: 0.012,
      key: 0.36,
      upperRim: 0.17,
      lowerRim: 0.11,
      warmA: 0.42,
      warmB: 0.14,
      particles: 0.075,
      glow: 0.045,
    },
    {
      progress: 0.75,
      cameraX: -0.035,
      cameraY: 0.025,
      cameraZ: 4.92,
      targetX: 0,
      targetY: 0,
      fov: 40.5,
      scale: 0.47,
      rootX: 0,
      rootY: -0.015,
      rotationX: -0.025,
      rotationY: 0.68,
      exposure: 0.39,
      ambient: 0.009,
      key: 0.29,
      upperRim: 0.14,
      lowerRim: 0.09,
      warmA: 0.26,
      warmB: 0.09,
      particles: 0.025,
      glow: 0.02,
    },
    {
      progress: 1,
      cameraX: 0,
      cameraY: 0.05,
      cameraZ: 5.35,
      targetX: 0,
      targetY: 0,
      fov: 42,
      scale: 0.42,
      rootX: 0,
      rootY: -0.04,
      rotationX: 0,
      rotationY: 0.82,
      exposure: 0.34,
      ambient: 0.006,
      key: 0.2,
      upperRim: 0.1,
      lowerRim: 0.06,
      warmA: 0.12,
      warmB: 0.04,
      particles: 0,
      glow: 0,
    },
  ];

function sampleCinematicFrame(
  progress: number,
) {
  const clamped =
    THREE.MathUtils.clamp(
      progress,
      0,
      1,
    );
  let upperIndex = 1;

  while (
    upperIndex <
      CINEMATIC_FRAMES.length - 1 &&
    CINEMATIC_FRAMES[upperIndex]
      .progress < clamped
  ) {
    upperIndex += 1;
  }

  const previous =
    CINEMATIC_FRAMES[
      upperIndex - 1
    ];
  const next =
    CINEMATIC_FRAMES[upperIndex];
  const span =
    Math.max(
      0.0001,
      next.progress -
        previous.progress,
    );
  const amount =
    THREE.MathUtils.smoothstep(
      clamped,
      previous.progress,
      previous.progress + span,
    );
  const sampled = {
    ...previous,
  };

  for (const key of Object.keys(
    previous,
  ) as Array<keyof CinematicFrame>) {
    sampled[key] =
      THREE.MathUtils.lerp(
        previous[key],
        next[key],
        amount,
      );
  }

  sampled.progress =
    clamped;

  return sampled;
}

export class HeroScene
  implements RuntimeScene
{
  readonly id =
    "home-hero";

  private readonly canvas:
    HTMLCanvasElement;

  private readonly events:
    HeroSceneEvents;

  private readonly scene =
    new THREE.Scene();

  private readonly camera =
    new THREE.PerspectiveCamera(
      40,
      1,
      0.1,
      100,
    );

  private readonly renderer:
    THREE.WebGLRenderer;

  private readonly environmentTarget:
    THREE.WebGLRenderTarget;

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

  private readonly baseRootPosition =
    new THREE.Vector3();

  private readonly coreWorld =
    new THREE.Vector3();

  private readonly warmLightA:
    THREE.PointLight;

  private readonly warmLightB:
    THREE.PointLight;

  private readonly ambientLight:
    THREE.AmbientLight;

  private readonly keyLight:
    THREE.DirectionalLight;

  private readonly upperRimLight:
    THREE.DirectionalLight;

  private readonly lowerRimLight:
    THREE.DirectionalLight;

  private readonly particleGeometry:
    THREE.BufferGeometry;

  private readonly particleMaterial:
    THREE.PointsMaterial;

  private readonly particlePoints:
    THREE.Points;

  private guideAnchorAccumulator =
    1;

  private readonly guideAnchorInterval =
    1 / 45;

  private hoveredMesh:
    THREE.Mesh | null =
    null;

  private pointerActive =
    false;

  private pointerPixelX =
    -9999;

  private pointerPixelY =
    -9999;

  private scrollProgress =
    0;

  private clickBurst =
    0;

  private introAmount =
    0;

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

  private rotationX =
    0;

  private rotationY =
    0;

  private cinematicRotationX =
    0;

  private cinematicRotationY =
    0;

  private cinematicGlow =
    0;

  private warmBaseA =
    1.24;

  private warmBaseB =
    0.44;

  private viewportWidth =
    1280;

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

    this.camera.position.z =
      5;

    this.renderer =
      new THREE.WebGLRenderer({
        canvas,

        alpha:
          true,

        antialias:
          qualityManager
            .preset
            .antialias,

        powerPreference:
          "high-performance",
      });

    this.renderer.setPixelRatio(
      Math.min(
        qualityManager
          .pixelRatio,
        1.5,
      ),
    );

    this.renderer.transmissionResolutionScale =
      0.42;

    this.renderer.setClearColor(
      0x000000,
      0,
    );

    this.renderer.autoClear =
      false;

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    this.renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure =
      0.56;

    const room =
      new RoomEnvironment();

    const pmrem =
      new THREE.PMREMGenerator(
        this.renderer,
      );

    this.environmentTarget =
      pmrem.fromScene(
        room,
      );

    this.scene.environment =
      this.environmentTarget
        .texture;

    room.dispose();

    pmrem.dispose();

    this.scene.add(
      this.root,
    );

    this.root.add(
      this.model.root,
    );

    /*
     * Sparse orange background
     * micro-particles.
     */
    const random =
      seededRandom(
        2012,
      );

    const particleCount =
      96;

    const positions =
      new Float32Array(
        particleCount *
          3,
      );

    for (
      let index = 0;
      index <
      particleCount;
      index += 1
    ) {
      positions[
        index *
          3
      ] =
        (
          random() -
          0.5
        ) *
        9.6;

      positions[
        index *
          3 +
          1
      ] =
        (
          random() -
          0.5
        ) *
        5.5;

      positions[
        index *
          3 +
          2
      ] =
        -0.35 -
        random() *
          1.2;
    }

    this.particleGeometry =
      new THREE.BufferGeometry();

    this.particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        positions,
        3,
      ),
    );

    this.particleMaterial =
      new THREE.PointsMaterial({
        color:
          0xff4d0c,

        size:
          0.016,

        sizeAttenuation:
          true,

        transparent:
          true,

        opacity:
          0.34,

        depthWrite:
          false,

        depthTest:
          true,

        toneMapped:
          false,
      });

    this.particlePoints =
      new THREE.Points(
        this.particleGeometry,
        this.particleMaterial,
      );

    this.particlePoints.frustumCulled =
      false;

    this.scene.add(
      this.particlePoints,
    );

    /*
     * Much darker idle lighting.
     */
    this.ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        0.018,
      );

    this.keyLight =
      new THREE.DirectionalLight(
        0xdce5f2,
        0.58,
      );

    this.keyLight.position.set(
      3.4,
      4.8,
      5.2,
    );

    this.upperRimLight =
      new THREE.DirectionalLight(
        0x8599b8,
        0.2,
      );

    this.upperRimLight.position.set(
      -3,
      3,
      -4,
    );

    this.lowerRimLight =
      new THREE.DirectionalLight(
        0x405a86,
        0.16,
      );

    this.lowerRimLight.position.set(
      2,
      -4,
      -3,
    );

    this.warmLightA =
      new THREE.PointLight(
        0xff4512,
        1.35,
        2,
        2,
      );

    this.warmLightA.position.set(
      0.05,
      -0.05,
      0.54,
    );

    this.warmLightB =
      new THREE.PointLight(
        0xff9a48,
        0.5,
        1.55,
        2,
      );

    this.warmLightB.position.set(
      -0.18,
      0.12,
      -0.12,
    );

    this.root.add(
      this.warmLightA,
      this.warmLightB,
    );

    this.scene.add(
      this.ambientLight,
      this.keyLight,
      this.upperRimLight,
      this.lowerRimLight,
    );

    void this.model
      .load(
        "/models/trionn-test-model.optimized.glb",
      )
      .then(() => {
        this.events
          .onModelReady?.();
      })
      .catch(
        (
          error,
        ) => {
          console.error(
            "Hero model could not be loaded:",
            error,
          );

          this.events
            .onModelError?.();
        },
      );
  }

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

  resetPointer(
    endInteraction = true,
  ) {
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

    if (endInteraction) {
      this.endHold();
    }
  }

  setScrollProgress(
    progress: number,
  ) {
    this.scrollProgress =
      THREE.MathUtils.clamp(
        progress,
        0,
        1,
      );

    if (
      this.scrollProgress >=
        0.08 &&
      this.holding
    ) {
      this.endHold();
    }
  }

  startHold() {
    if (
      this.holding ||
      this.scrollProgress >=
        0.08 ||
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

    this.events
      .onVibrate?.(
        1,
        0,
        0,
        0,
        true,
      );

    return true;
  }

  endHold() {
    if (!this.holding) {
      return;
    }

    this.holding =
      false;

    this.vibrateAmount =
      0;

    this.events
      .onReturnStart?.(
        this.clickBurst >=
          0.98,
      );
  }

  private updateRaycast() {
    const canRaycast =
      this.pointerActive &&
      this.scrollProgress <
        0.08 &&
      this.clickBurst <
        0.05 &&
      this.introAmount <
        0.08 &&
      this.model.meshes.length >
        0;

    if (!canRaycast) {
      this.hoveredMesh =
        null;

      return;
    }

    this.raycaster.setFromCamera(
      this.pointerTarget,
      this.camera,
    );

    const hits =
      this.raycaster
        .intersectObjects(
          this.model.meshes,
          false,
        );

    const next =
      hits.length >
      0
        ? (
            hits[0]
              .object as THREE.Mesh
          )
        : null;

    if (
      next ===
      this.hoveredMesh
    ) {
      return;
    }

    if (next) {
      this.model.flashMesh(
        next,
      );

      this.events
        .onHoverPanel?.();
    }

    this.hoveredMesh =
      next;
  }

  private updateHold(
    delta: number,
  ) {
    this.vibratePhase +=
      delta *
      72;

    if (this.holding) {
      this.holdTime +=
        delta;

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

        this.vibrateAmount =
          1;
      } else {
        if (
          !this.blastTriggered
        ) {
          this.blastTriggered =
            true;

          this.events
            .onBlast?.();
        }

        if (
          this.holdTime <
          0.7
        ) {
          this.vibrateAmount =
            1;
        } else {
          this.vibrateAmount *=
            Math.pow(
              0.88,
              delta *
                60,
            );
        }

        this.clickBurst =
          Math.min(
            1,
            this.clickBurst +
              delta *
                1.2,
          );
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

      this.clickBurst =
        Math.max(
          0,
          this.clickBurst -
            delta *
              1.5,
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
        this.clickBurst,
        this.holdTime,
        this.holding,
      );

    const interactionPhase =
      this.holding
        ? this.blastTriggered
          ? "blasting"
          : "charging"
        : this.clickBurst >
            0.0001 ||
          this.chargeProgress >
            0.0001
          ? "returning"
          : "idle";

    this.events
      .onInteractionChange?.({
        phase:
          interactionPhase,
        progress:
          this.chargeProgress,
        burst:
          this.clickBurst,
      });

    const charge =
      this.holding
        ? this.chargeProgress
        : 0;

    const targetA =
      this.warmBaseA +
      charge *
        4.85;

    const targetB =
      this.warmBaseB +
      charge *
        1.9;

    const ease =
      1 -
      Math.exp(
        -12 *
          delta,
      );

    this.warmLightA.intensity =
      THREE.MathUtils.lerp(
        this.warmLightA
          .intensity,
        targetA,
        ease,
      );

    this.warmLightB.intensity =
      THREE.MathUtils.lerp(
        this.warmLightB
          .intensity,
        targetB,
        ease,
      );
  }

  private applyModelVibration() {
    const amount =
      this.vibrateAmount;

    const x =
      (
        Math.sin(
          this.vibratePhase,
        ) *
          0.018 +
        Math.sin(
          this.vibratePhase *
            2.17,
        ) *
          0.004
      ) *
      amount;

    const y =
      (
        Math.cos(
          this.vibratePhase *
            1.31,
        ) *
          0.013 +
        Math.sin(
          this.vibratePhase *
            1.73,
        ) *
          0.003
      ) *
      amount;

    this.root.position.set(
      this.baseRootPosition.x +
        x,

      this.baseRootPosition.y +
        y,

      this.baseRootPosition.z,
    );
  }

  private getModelDrives() {
    const progress =
      this.scrollProgress;
    let scroll = 0;

    if (
      progress >= 0.07 &&
      progress < 0.2
    ) {
      scroll =
        THREE.MathUtils.smoothstep(
          progress,
          0.07,
          0.2,
        );
    } else if (
      progress >= 0.2 &&
      progress <= 0.29
    ) {
      scroll = 1;
    } else if (
      progress > 0.29 &&
      progress < 0.49
    ) {
      scroll =
        1 -
        THREE.MathUtils.smoothstep(
          progress,
          0.29,
          0.49,
        );
    }

    const blast =
      this.scrollProgress <
      0.15
        ? this.clickBurst
        : 0;

    return {
      scroll:
        Math.max(
          scroll,
          this.introAmount,
        ),

      blast,
    };
  }

  private applyCinematicState() {
    const frame =
      sampleCinematicFrame(
        this.scrollProgress,
      );
    const mobileScale =
      this.viewportWidth < 768
        ? 0.5
        : 1;
    const mobileX =
      this.viewportWidth < 768
        ? 0.14
        : 0;

    this.camera.position.set(
      frame.cameraX,
      frame.cameraY,
      frame.cameraZ,
    );
    this.camera.fov =
      frame.fov;
    this.camera.lookAt(
      frame.targetX,
      frame.targetY,
      0,
    );
    this.camera.updateProjectionMatrix();

    this.baseRootPosition.set(
      frame.rootX + mobileX,
      frame.rootY,
      0,
    );
    this.root.scale.setScalar(
      frame.scale *
        mobileScale,
    );

    this.cinematicRotationX =
      frame.rotationX;
    this.cinematicRotationY =
      frame.rotationY;
    this.cinematicGlow =
      frame.glow;
    this.warmBaseA =
      frame.warmA;
    this.warmBaseB =
      frame.warmB;

    this.renderer.toneMappingExposure =
      frame.exposure;
    this.ambientLight.intensity =
      frame.ambient;
    this.keyLight.intensity =
      frame.key;
    this.upperRimLight.intensity =
      frame.upperRim;
    this.lowerRimLight.intensity =
      frame.lowerRim;
    this.particleMaterial.opacity =
      frame.particles;
  }

  private updateRotation(
    frame:
      RuntimeFrame,
  ) {
    const speed =
      qualityManager
        .prefersReducedMotion
        ? 0.0015
        : 0.0042;

    this.rotationY +=
      speed *
      frame.delta *
      60;

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
      this.cinematicRotationX +
      this.pointerCurrent.y *
        0.22;

    const targetY =
      this.rotationY +
      this.cinematicRotationY +
      this.pointerCurrent.x *
        0.22;

    this.root.rotation.x +=
      (
        targetX -
        this.root.rotation.x
      ) *
      frameLerp;

    this.root.rotation.y +=
      (
        targetY -
        this.root.rotation.y
      ) *
      frameLerp;
  }

  private updateGuideAnchors() {
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

    const worldAnchors =
      this.model
        .getGuideAnchorWorldPositions();

    const projectedAnchors = [
      {
        x: 0,
        y: 0,
      },

      {
        x: 0,
        y: 0,
      },

      {
        x: 0,
        y: 0,
      },
    ];

    for (
      let index = 0;
      index < 3;
      index += 1
    ) {
      const projected =
        worldAnchors[
          index
        ].project(
          this.camera,
        );

      projectedAnchors[
        index
      ].x =
        (
          projected.x *
            0.5 +
          0.5
        ) *
        width;

      projectedAnchors[
        index
      ].y =
        (
          -projected.y *
            0.5 +
          0.5
        ) *
        height;
    }

    this.weldLines.setAnchors(
      projectedAnchors,
    );
  }

  update(
    frame:
      RuntimeFrame,
  ) {
    const pointerEase =
      1 -
      Math.exp(
        -7 *
          frame.delta,
      );

    this.pointerCurrent.lerp(
      this.pointerTarget,
      pointerEase,
    );

    this.applyCinematicState();

    this.updateRotation(
      frame,
    );

    this.updateHold(
      frame.delta,
    );

    this.applyModelVibration();

    /*
     * Slow atmospheric specks.
     */
    this.particlePoints.rotation.y =
      frame.time *
      0.002;

    this.particlePoints.rotation.z =
      Math.sin(
        frame.time *
          0.08,
      ) *
      0.01;

    this.scene.updateMatrixWorld(
      true,
    );

    this.root.getWorldPosition(
      this.coreWorld,
    );

    const drives =
      this.getModelDrives();

    this.model.update(
      frame.time,
      frame.delta,
      drives.scroll,
      drives.blast,
      Math.max(
        this.chargeProgress,
        this.cinematicGlow,
      ),
      this.coreWorld,
    );

    this.scene.updateMatrixWorld(
      true,
    );

    this.updateRaycast();

    this.guideAnchorAccumulator +=
      frame.delta;

    if (
      this.guideAnchorAccumulator >=
      this.guideAnchorInterval
    ) {
      this.guideAnchorAccumulator =
        0;

      this.updateGuideAnchors();
    }

    const weld =
      this.weldLines.update(
        frame.time,
        frame.delta,
        this.pointerPixelX,
        this.pointerPixelY,
        this.scrollProgress,
        this.camera,
      );

    if (
      weld.burstStarted
    ) {
      this.events
        .onWeldSpark?.();
    }

    /*
     * Render order:
     *
     * 1. guide lines
     * 2. model
     * 3. blue weld on top
     */
    this.renderer.clear();

    this.weldLines.renderBase(
      this.renderer,
    );

    this.renderer.clearDepth();

    this.renderer.render(
      this.scene,
      this.camera,
    );

    this.weldLines.renderSparks(
      this.renderer,
      this.camera,
    );
  }

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

    this.viewportWidth =
      width;

    this.camera.aspect =
      width /
      height;

    this.camera
      .updateProjectionMatrix();

    const heroPixelRatio =
      Math.min(
        qualityManager
          .pixelRatio,

        width <
          768
          ? 1.25
          : 1.5,
      );

    this.renderer.setPixelRatio(
      heroPixelRatio,
    );

    this.renderer.transmissionResolutionScale =
      width <
      768
        ? 0.38
        : 0.42;

    this.renderer.setSize(
      width,
      height,
      false,
    );

    this.weldLines.resize(
      width,
      height,
    );

    this.applyCinematicState();

    this.root.position.copy(
      this.baseRootPosition,
    );

    this.scene.updateMatrixWorld(
      true,
    );

    this.guideAnchorAccumulator =
      0;

    this.updateGuideAnchors();
  }

  destroy() {
    this.weldLines.destroy();

    this.model.destroy();

    this.particleGeometry.dispose();

    this.particleMaterial.dispose();

    this.scene.remove(
      this.particlePoints,
    );

    this.scene.environment =
      null;

    this.environmentTarget.dispose();

    this.renderer.dispose();
  }
}
