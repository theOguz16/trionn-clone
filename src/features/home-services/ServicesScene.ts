import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

import type {
  RuntimeFrame,
  RuntimeScene,
} from "@/runtime/canvas/RuntimeScene";

import { qualityManager } from "@/runtime/quality/QualityManager";
import { ServicesSlab } from "./ServicesSlab";

function clamp01(value: number) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function smoothStep(value: number) {
  const t = clamp01(value);

  return t * t * (3 - 2 * t);
}

function rangeProgress(
  progress: number,
  start: number,
  end: number,
) {
  return smoothStep(
    (progress - start) / (end - start),
  );
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

  context.fillStyle =
    "rgba(247,245,238,0.90)";

  context.textAlign = "center";
  context.textBaseline = "middle";

  context.font =
    "500 154px Arial, Helvetica, sans-serif";

  context.fillText(label, 128, 137);

  const texture =
    new THREE.CanvasTexture(canvas);

  texture.colorSpace =
    THREE.SRGBColorSpace;

  texture.minFilter =
    THREE.LinearFilter;

  texture.magFilter =
    THREE.LinearFilter;

  texture.needsUpdate = true;

  return texture;
}

export class ServicesScene
  implements RuntimeScene
{
  readonly id = "home-services";

  private readonly canvas:
    HTMLCanvasElement;

  private readonly scene =
    new THREE.Scene();

  private readonly camera =
    new THREE.PerspectiveCamera(
      37,
      1,
      0.1,
      100,
    );

  private readonly renderer:
    THREE.WebGLRenderer;

  private readonly root =
    new THREE.Group();

  private readonly slabPivot =
    new THREE.Group();

  private readonly markRoot =
    new THREE.Group();

  private readonly environmentTarget:
    THREE.WebGLRenderTarget;

  private readonly markMaterials:
    THREE.MeshBasicMaterial[] = [];

  private readonly markTextures:
    THREE.Texture[] = [];

  private readonly slab:
    ServicesSlab;

  private readonly atmosphereMaterial:
    THREE.ShaderMaterial;

  private readonly atmosphere:
    THREE.Mesh<
      THREE.PlaneGeometry,
      THREE.ShaderMaterial
    >;

  private progressTarget = 0;
  private progressCurrent = 0;

  /*
   * ServicesSlab değişse bile
   * viewport scale hesabı çalışsın.
   */
  private slabLocalHeight = 2.58;
  private slabLocalWidth = 1.72;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    qualityManager.init();

    const quality =
      qualityManager.currentLevel;

    this.slab =
      new ServicesSlab({
        qualityLevel: quality,

        textureSize:
          quality === "high"
            ? 768
            : quality === "low"
              ? 256
              : 512,

        textureAnisotropy:
          quality === "high"
            ? 8
            : quality === "low"
              ? 2
              : 4,
      });

    const detailedAtmosphere =
      qualityManager.preset
        .shaderDetail > 0.5;

    this.atmosphereMaterial =
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: {
            value: 0,
          },

          uProgress: {
            value: 0,
          },

          uAspect: {
            value: 1,
          },
        },

        vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
        `,

        fragmentShader: `
varying vec2 vUv;

uniform float uTime;
uniform float uProgress;
uniform float uAspect;

float servicesHash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
}

float servicesNoise(vec2 point) {
  vec2 cell = floor(point);
  vec2 local = fract(point);
  vec2 eased = local * local * (3.0 - 2.0 * local);

  float a = servicesHash(cell);
  float b = servicesHash(cell + vec2(1.0, 0.0));
  float c = servicesHash(cell + vec2(0.0, 1.0));
  float d = servicesHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, eased.x), mix(c, d, eased.x), eased.y);
}

float servicesFbm(vec2 point) {
  float value = servicesNoise(point) * 0.56;
  value += servicesNoise(point * 2.03 + 8.7) * 0.27;
  value += servicesNoise(point * 4.09 + 19.2) * 0.12;
  ${
    detailedAtmosphere
      ? "value += servicesNoise(point * 8.17 + 37.4) * 0.06;"
      : ""
  }
  return value;
}

void main() {
  vec2 point = vUv - 0.5;
  point.x *= uAspect;

  float drift = uTime * 0.018;
  float broad = servicesFbm(point * 1.38 + vec2(drift, -drift * 0.62));
  float curl = servicesFbm(point.yx * 2.18 + vec2(-drift * 0.72, drift));
  float veil = servicesFbm(point * 3.1 + vec2(4.2, -2.7) + drift * 0.35);

  float volume = smoothstep(0.41, 0.7, broad * 0.66 + curl * 0.34);
  float detail = smoothstep(0.46, 0.72, veil) * 0.36;
  float centerLift = 1.0 - smoothstep(0.12, 0.82, length(point * vec2(0.72, 1.0)));
  float phaseLift = smoothstep(0.2, 0.55, uProgress) * 0.1;

  vec3 deep = vec3(0.008, 0.018, 0.024);
  vec3 smoke = vec3(0.18, 0.21, 0.22);
  vec3 color = mix(deep, smoke, volume * 0.82 + detail + centerLift * 0.08 + phaseLift);
  float alpha = clamp(0.12 + volume * 0.44 + detail * 0.12, 0.0, 0.64);

  gl_FragColor = vec4(color, alpha);
}
        `,

        transparent: true,
        depthWrite: false,
        depthTest: false,
        toneMapped: false,
      });

    this.atmosphere =
      new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        this.atmosphereMaterial,
      );

    this.atmosphere.position.z = -5;
    this.atmosphere.renderOrder = -10;

    /*
     * Sabit kamera.
     *
     * Bundan sonra objenin boyutunu
     * rastgele scale ile değil,
     * viewport yüzdesinden hesaplıyoruz.
     */
    this.camera.position.set(
      0,
      0,
      6.3,
    );

    this.renderer =
      new THREE.WebGLRenderer({
        canvas,

        alpha: true,

        antialias:
          qualityManager
            .preset
            .antialias,

        powerPreference:
          "high-performance",
      });

    this.renderer.setPixelRatio(
      Math.min(
        qualityManager.pixelRatio,
        1.5,
      ),
    );

    this.renderer.setClearColor(
      0x000000,
      0,
    );

    this.renderer.outputColorSpace =
      THREE.SRGBColorSpace;

    this.renderer.toneMapping =
      THREE.ACESFilmicToneMapping;

    this.renderer.toneMappingExposure =
      0.84;

    const room =
      new RoomEnvironment();

    const pmrem =
      new THREE.PMREMGenerator(
        this.renderer,
      );

    this.environmentTarget =
      pmrem.fromScene(room);

    this.scene.environment =
      this.environmentTarget.texture;

    room.dispose();
    pmrem.dispose();

    this.scene.add(
      this.atmosphere,
      this.root,
    );

    this.root.add(
      this.slabPivot,
    );

    this.slabPivot.add(
      this.slab.root,
      this.markRoot,
    );

    /*
     * Gerçek local geometry yüksekliğini
     * runtime'da ölç.
     */
    const bounds =
      new THREE.Box3().setFromObject(
        this.slab.root,
      );

    const size =
      new THREE.Vector3();

    bounds.getSize(size);

    if (size.y > 0.001) {
      this.slabLocalHeight =
        size.y;
    }

    if (size.x > 0.001) {
      this.slabLocalWidth =
        size.x;
    }

    /*
     * ------------------------------------------------
     * LIGHTING
     * ------------------------------------------------
     *
     * Front yüzeyi flat griye çevirmeden
     * edge/detail okunurluğu.
     */

    const ambient =
      new THREE.AmbientLight(
        0xffffff,
        0.055,
      );

    const key =
      new THREE.DirectionalLight(
        0xf2ede4,
        3.9,
      );

    key.position.set(
      -4.4,
      5.4,
      5.6,
    );

    const fill =
      new THREE.DirectionalLight(
        0x87929c,
        0.17,
      );

    fill.position.set(
      3.8,
      0.8,
      4,
    );

    const side =
      new THREE.DirectionalLight(
        0x71808e,
        0.24,
      );

    side.position.set(
      4.6,
      1.4,
      1.1,
    );

    const rim =
      new THREE.DirectionalLight(
        0x667482,
        0.68,
      );

    rim.position.set(
      1.1,
      -2.8,
      -4.5,
    );

    const top =
      new THREE.DirectionalLight(
        0xe7e0d5,
        1.25,
      );

    top.position.set(
      -1,
      5.5,
      1,
    );

    this.scene.add(
      ambient,
      key,
      fill,
      side,
      rim,
      top,
    );

    this.createSurfaceMarks();
  }

  setProgress(progress: number) {
    this.progressTarget =
      clamp01(progress);
  }

  /*
   * ==================================================
   * REFERENCE LOCK
   * ==================================================
   *
   * fraction = objenin ekranda kaplamasını
   * istediğimiz viewport yüksekliği.
   *
   * Örneğin:
   *
   * 0.53 = ekran yüksekliğinin %53'ü.
   */
  private scaleForViewportHeight(
    fraction: number,
    objectZ = 0,
  ) {
    const distance =
      Math.abs(
        this.camera.position.z -
          objectZ,
      );

    const halfViewHeight =
      distance *
      Math.tan(
        THREE.MathUtils.degToRad(
          this.camera.fov * 0.5,
        ),
      );

    const wantedWorldHeight =
      halfViewHeight *
      2 *
      fraction;

    return (
      wantedWorldHeight /
      this.slabLocalHeight
    );
  }

  private scaleForViewportMin(
    fraction: number,
    objectZ = 0,
  ) {
    const distance = Math.abs(
      this.camera.position.z - objectZ,
    );
    const viewHeight =
      distance *
      Math.tan(
        THREE.MathUtils.degToRad(
          this.camera.fov * 0.5,
        ),
      ) *
      2;
    const viewWidth =
      viewHeight * this.camera.aspect;
    const wantedWorldSize =
      Math.min(viewWidth, viewHeight) *
      fraction;

    return (
      wantedWorldSize /
      Math.max(
        this.slabLocalWidth,
        this.slabLocalHeight,
      )
    );
  }

  /*
   * viewportY:
   *
   * 0    = ekran üstü
   * 0.5  = ekran merkezi
   * 1    = ekran altı
   */
  private worldYForViewportY(
    viewportY: number,
    objectZ = 0,
  ) {
    const distance =
      Math.abs(
        this.camera.position.z -
          objectZ,
      );

    const halfViewHeight =
      distance *
      Math.tan(
        THREE.MathUtils.degToRad(
          this.camera.fov * 0.5,
        ),
      );

    const ndcY =
      1 -
      viewportY * 2;

    return ndcY * halfViewHeight;
  }

  private createSurfaceMarks() {
    const marks = [
      {
        label: "M",
        x: -0.52,
        y: -0.14,
        z: 0.265,
        size: 0.32,
      },

      {
        label: "N",
        x: 0.34,
        y: 0.44,
        z: 0.265,
        size: 0.3,
      },

      {
        label: "B",
        x: 0.43,
        y: -0.36,
        z: 0.265,
        size: 0.28,
      },
    ];

    marks.forEach((mark) => {
      const texture =
        createMarkTexture(
          mark.label,
        );

      if (!texture) {
        return;
      }

      const material =
        new THREE.MeshBasicMaterial({
          map: texture,

          transparent: true,

          opacity: 0,

          depthWrite: false,

          depthTest: true,

          toneMapped: false,

          side:
            THREE.DoubleSide,
        });

      const mesh =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            mark.size,
            mark.size,
          ),
          material,
        );

      mesh.position.set(
        mark.x,
        mark.y,
        mark.z,
      );

      mesh.rotation.z =
        mark.x * -0.18;

      mesh.renderOrder = 5;

      this.markTextures.push(
        texture,
      );

      this.markMaterials.push(
        material,
      );

      this.markRoot.add(mesh);
    });

    const lineMaterial =
      new THREE.MeshBasicMaterial({
        color: 0xf1efe9,

        transparent: true,

        opacity: 0,

        depthWrite: false,

        depthTest: true,

        toneMapped: false,

        side:
          THREE.DoubleSide,
      });

    const makeLine = (
      width: number,
      height: number,
      x: number,
      y: number,
      z: number,
      rotation: number,
    ) => {
      const line =
        new THREE.Mesh(
          new THREE.PlaneGeometry(
            width,
            height,
          ),
          lineMaterial,
        );

      line.position.set(
        x,
        y,
        z,
      );

      line.rotation.z =
        rotation;

      line.renderOrder = 5;

      this.markRoot.add(line);
    };

    makeLine(
      0.68,
      0.016,
      -0.1,
      0.14,
      0.268,
      -0.5,
    );

    makeLine(
      0.42,
      0.014,
      0.55,
      -0.07,
      0.268,
      0,
    );

    makeLine(
      0.014,
      0.42,
      0.55,
      -0.07,
      0.268,
      0,
    );

    this.markMaterials.push(
      lineMaterial,
    );

    this.markRoot.visible =
      false;
  }

  update(frame: RuntimeFrame) {
    // Scroll state doğrudan belirleyici; hızlı ve ters scroll aynı yolu izler.
    this.progressCurrent =
      this.progressTarget;

    const progress =
      this.progressCurrent;

    const isMobile =
      this.camera.aspect < 0.82;

    this.atmosphereMaterial.uniforms.uTime.value =
      qualityManager.prefersReducedMotion
        ? 0
        : frame.time;

    this.atmosphereMaterial.uniforms.uProgress.value =
      progress;

    /*
     * ================================================
     * EXACT FLOW
     * ================================================
     *
     * 0.00 - 0.15 intro
     * 0.15 - 0.28 overlap
     * 0.28 - 0.46 breakup
     * 0.46 - 0.55 assemble / front-facing
     * 0.48 - 0.69 sequential stone carving
     * 0.70+        service card conveyor
     */

    const overlap =
      rangeProgress(
        progress,
        0.15,
        0.28,
      );

    const breakup =
      rangeProgress(
        progress,
        0.28,
        0.46,
      );

    const assemble =
      rangeProgress(
        progress,
        0.44,
        0.55,
      );

    /*
     * ================================================
     * REFERENCE HEIGHTS
     * ================================================
     *
     * 1024px referans:
     *
     * intro   ≈ 195px
     * overlap ≈ 307px
     * breakup ≈ 604px
     * final   ≈ 543px
     */

    const introScale = isMobile
      ? this.scaleForViewportMin(
          0.72,
          -0.12,
        )
      : this.scaleForViewportHeight(
          0.225,
          -0.12,
        );

    const overlapScale = isMobile
      ? this.scaleForViewportMin(
          0.92,
          0.04,
        )
      : this.scaleForViewportHeight(
          0.39,
          0.04,
        );

    const breakupScale = isMobile
      ? this.scaleForViewportMin(
          1.08,
          0.14,
        )
      : this.scaleForViewportHeight(
          0.69,
          0.14,
        );

    const detailScale = isMobile
      ? this.scaleForViewportMin(
          1.02,
          -0.02,
        )
      : this.scaleForViewportHeight(
          0.65,
          -0.02,
        );

    /*
     * ================================================
     * ROTATIONS
     * ================================================
     */

    const introRotation =
      new THREE.Euler(
        -0.19,
        -0.46,
        -0.08,
      );

    /*
     * Trionn ikinci screenshot:
     * küçük brick diagonal.
     */
    const overlapRotation =
      new THREE.Euler(
        0.16,
        -0.78,
        -0.42,
      );

    /*
     * Breakup screenshot:
     *
     * Büyük slab ama EDGE-ON DEĞİL.
     */
    const breakupRotation =
      isMobile
        ? new THREE.Euler(
            -0.08,
            1.46,
            0.18,
          )
        : new THREE.Euler(
            0.12,
            0.22,
            -0.085,
          );

    /*
     * Detail:
     * front facing.
     */
    const detailRotation =
      isMobile
        ? new THREE.Euler(
            -0.1,
            1.18,
            0.14,
          )
        : new THREE.Euler(
            -0.015,
            -0.025,
            -0.008,
          );

    const qIntro =
      new THREE.Quaternion()
        .setFromEuler(
          introRotation,
        );

    const qOverlap =
      new THREE.Quaternion()
        .setFromEuler(
          overlapRotation,
        );

    const qBreakup =
      new THREE.Quaternion()
        .setFromEuler(
          breakupRotation,
        );

    const qDetail =
      new THREE.Quaternion()
        .setFromEuler(
          detailRotation,
        );

    const rotationA =
      qIntro
        .clone()
        .slerp(
          qOverlap,
          overlap,
        );

    const rotationB =
      rotationA
        .clone()
        .slerp(
          qBreakup,
          breakup,
        );

    const rotationFinal =
      rotationB
        .clone()
        .slerp(
          qDetail,
          assemble,
        );

    this.slabPivot.quaternion.copy(
      rotationFinal,
    );

    /*
     * ================================================
     * SCALE
     * ================================================
     */

    const scaleA =
      THREE.MathUtils.lerp(
        introScale,
        overlapScale,
        overlap,
      );

    const scaleB =
      THREE.MathUtils.lerp(
        scaleA,
        breakupScale,
        breakup,
      );

    const scaleFinal =
      THREE.MathUtils.lerp(
        scaleB,
        detailScale,
        assemble,
      );

    const introWidthCompensation =
      isMobile
        ? 1
        : THREE.MathUtils.lerp(
            THREE.MathUtils.lerp(
              1.28,
              1.08,
              overlap,
            ),
            1,
            breakup,
          );

    this.slabPivot.scale.set(
      scaleFinal *
        introWidthCompensation,
      scaleFinal,
      scaleFinal,
    );

    /*
     * ================================================
     * SCREEN POSITIONS
     * ================================================
     *
     * Bunlar referanstaki pixel merkezlerinin
     * viewport oranına çevrilmiş hali.
     */

    /*
     * y ≈ 245 / 1024
     */
    const introPosition =
      new THREE.Vector3(
        0,
        this.worldYForViewportY(
          isMobile ? 0.46 : 0.15,
          -0.12,
        ),
        -0.12,
      );

    /*
     * y ≈ 385 / 1024
     */
    const overlapPosition =
      new THREE.Vector3(
        0.015,
        this.worldYForViewportY(
          isMobile ? 0.48 : 0.43,
          0.04,
        ),
        0.04,
      );

    /*
     * y ≈ 520 / 1024
     */
    const breakupPosition =
      new THREE.Vector3(
        0,
        this.worldYForViewportY(
          isMobile ? 0.47 : 0.5,
          0.14,
        ),
        0.14,
      );

    /*
     * y ≈ 555 / 1024
     */
    const detailPosition =
      new THREE.Vector3(
        0,
        this.worldYForViewportY(
          isMobile ? 0.48 : 0.51,
          -0.02,
        ),
        -0.02,
      );

    const positionA =
      introPosition
        .clone()
        .lerp(
          overlapPosition,
          overlap,
        );

    const positionB =
      positionA
        .clone()
        .lerp(
          breakupPosition,
          breakup,
        );

    const positionFinal =
      positionB
        .clone()
        .lerp(
          detailPosition,
          assemble,
        );

    this.slabPivot.position.copy(
      positionFinal,
    );

    /*
     * ================================================
     * BREAKUP MARKS
     * ================================================
     */

    const marksIn =
      rangeProgress(
        progress,
        0.32,
        0.37,
      );

    const marksOut =
      1 -
      rangeProgress(
        progress,
        0.44,
        0.50,
      );

    const markOpacity =
      marksIn *
      marksOut *
      0.66;

    this.markRoot.visible =
      markOpacity > 0.002;

    this.markMaterials.forEach(
      (material) => {
        material.opacity =
          markOpacity;
      },
    );

    /*
     * ================================================
     * CUT PROGRESSION
     * ================================================
     *
     * Trionn referans akışı:
     *
     * 0.535 - 0.575 cut 1
     * 0.575 - 0.63  cut 2
     * 0.63  - 0.69  cut 3
     * 0.69+        üç cut tamam
     * 0.70+        kart conveyor başlar
     *
     * Böylece kartlar taş tamamen yontulmadan
     * ekrana girmiyor.
     */

    const firstCut =
      rangeProgress(
        progress,
        0.535,
        0.575,
      );

    const secondCut =
      rangeProgress(
        progress,
        0.575,
        0.63,
      );

    const thirdCut =
      rangeProgress(
        progress,
        0.63,
        0.69,
      );

    this.slab.setCutProgress(
      firstCut,
      secondCut,
      thirdCut,
    );

    this.renderer.render(
      this.scene,
      this.camera,
    );
  }

  resize() {
    const width =
      Math.max(
        1,
        this.canvas.clientWidth,
      );

    const height =
      Math.max(
        1,
        this.canvas.clientHeight,
      );

    this.renderer.setSize(
      width,
      height,
      false,
    );

    this.camera.aspect =
      width / height;

    this.camera.updateProjectionMatrix();

    const atmosphereZ =
      this.atmosphere.position.z;

    const distance =
      Math.abs(
        this.camera.position.z -
          atmosphereZ,
      );

    const viewHeight =
      2 *
      distance *
      Math.tan(
        THREE.MathUtils.degToRad(
          this.camera.fov * 0.5,
        ),
      );

    this.atmosphere.scale.set(
      (viewHeight * this.camera.aspect) /
        2,
      viewHeight / 2,
      1,
    );

    this.atmosphereMaterial.uniforms.uAspect.value =
      this.camera.aspect;
  }

  destroy() {
    this.markRoot.traverse(
      (object) => {
        if (
          !(
            object instanceof
            THREE.Mesh
          )
        ) {
          return;
        }

        object.geometry.dispose();

        const materials =
          Array.isArray(
            object.material,
          )
            ? object.material
            : [object.material];

        materials.forEach(
          (material) =>
            material.dispose(),
        );
      },
    );

    this.markTextures.forEach(
      (texture) =>
        texture.dispose(),
    );

    this.slab.dispose();

    this.atmosphere.geometry.dispose();
    this.atmosphereMaterial.dispose();

    this.environmentTarget.dispose();

    this.renderer.dispose();
  }
}
