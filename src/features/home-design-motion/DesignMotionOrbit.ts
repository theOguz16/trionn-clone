import * as THREE from "three";

const RIBBON_TEXTURES = Array.from(
  { length: 9 },
  (_, index) =>
    `/motion-projects/orbit/orbit-${String(9 - index).padStart(2, "0")}.jpg`,
);

const GRID_TEXTURES = [
  "/motion-projects/orbit/orbit-01.jpg",
  "/motion-projects/orbit/orbit-02.jpg",
  "/motion-projects/orbit/orbit-05.jpg",
  "/motion-projects/orbit/orbit-03.jpg",
  "/motion-projects/orbit/orbit-08.jpg",
  "/motion-projects/orbit/orbit-07.jpg",
];

const IMAGE_RATIO = 568 / 812;
const TAU_TWO = Math.PI * 4;
const RISE = 28 / TAU_TWO;
const CURVE_SPEED = Math.sqrt(144 + RISE * RISE);
const CURVE_LENGTH = TAU_TWO * CURVE_SPEED;
const CARD_SPACING = 6.2;
const CARD_LENGTH = 5.8;
const RIBBON_HEIGHT = CARD_LENGTH * IMAGE_RATIO;
const HELIX_START = (RIBBON_TEXTURES.length - 1) * CARD_SPACING + CARD_LENGTH;
const GRID_START =
  ((CURVE_LENGTH * 0.5 + HELIX_START + 10) /
    (CURVE_LENGTH + HELIX_START)) *
  (400 / 600);
const GUIDE_TRAIL = Math.floor(86.8);

type GridCardState = {
  restX: Float32Array;
  restY: Float32Array;
  wave: number;
  waveT: number;
  waveFlat?: boolean;
};

type RibbonCardState = {
  uvWritten?: boolean;
};

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function curvePoint(theta: number) {
  const center = (theta - TAU_TWO / 2) / 2;
  return new THREE.Vector3(
    12 * Math.cos(theta),
    -16 + theta * RISE - 2.5 * Math.exp(-(center * center)),
    12 * Math.sin(theta),
  );
}

function curveTangent(theta: number) {
  const center = (theta - TAU_TWO / 2) / 2;
  const bumpDerivative = -center * 2.5 * Math.exp(-(center * center));
  return new THREE.Vector3(
    -12 * Math.sin(theta),
    RISE - bumpDerivative,
    12 * Math.cos(theta),
  ).normalize();
}

function makeTextureMaterial(texture: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: texture } },
    vertexShader:
      "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader:
      "uniform sampler2D map; varying vec2 vUv; void main(){ vec2 uv=vUv; if(gl_FrontFacing) uv.x=1.0-uv.x; gl_FragColor=texture2D(map,uv); }",
    side: THREE.DoubleSide,
  });
}

function makeGridMaterial(texture: THREE.Texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      uSize: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: 8 },
    },
    vertexShader:
      "varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: `
      uniform sampler2D map;
      uniform vec2 uSize;
      uniform float uRadius;
      varying vec2 vUv;
      void main(){
        vec2 pxPos=(vUv-.5)*uSize;
        vec2 halfSize=uSize*.5;
        vec2 q=abs(pxPos)-halfSize+uRadius;
        float dist=min(max(q.x,q.y),0.0)+length(max(q,0.0))-uRadius;
        float alpha=1.0-smoothstep(-.5,.5,dist);
        if(alpha<=0.0) discard;
        vec4 col=texture2D(map,vUv);
        gl_FragColor=vec4(col.rgb,col.a*alpha);
      }`,
    transparent: true,
    side: THREE.DoubleSide,
  });
}

export class DesignMotionOrbit {
  private readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera: THREE.PerspectiveCamera;
  private readonly ribbonCards: THREE.Mesh[] = [];
  private readonly gridCards: THREE.Mesh[] = [];
  private readonly guideLines: THREE.Line[] = [];
  private planeWidth = 9.2;
  private planeHeight = this.planeWidth * IMAGE_RATIO;
  private columns = 3;
  private rows = 2;
  private horizontalGap = 0.38;
  private verticalGap = 0.55;
  private lastRenderTime = performance.now();
  private smoothedProgress = 0;
  private guideRibbonProgress = 0;
  private snapProgressOnNextRender = true;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setClearColor(0x040508, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.PerspectiveCamera(52, 1, 0.1, 500);

    const loader = new THREE.TextureLoader();
    const load = (source: string) => {
      const texture = loader.load(source);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
      return texture;
    };

    RIBBON_TEXTURES.forEach((source) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1, 116, 1),
        makeTextureMaterial(load(source)),
      );
      mesh.visible = false;
      mesh.frustumCulled = false;
      mesh.renderOrder = 1;
      this.ribbonCards.push(mesh);
      this.scene.add(mesh);
    });

    GRID_TEXTURES.forEach((source) => {
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1, 20, 12),
        makeGridMaterial(load(source)),
      );
      mesh.visible = false;
      mesh.frustumCulled = false;
      mesh.renderOrder = 3;
      this.gridCards.push(mesh);
      this.scene.add(mesh);
    });

    this.resize();
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const mobile = width < 768;
    const tablet = width >= 768 && width < 1200;
    const wide = width >= 1440;

    const fov = mobile ? 58 : tablet ? 54 : 52;
    const cameraZ = mobile ? 28 : tablet ? 24 : 22;
    this.columns = mobile ? 2 : 3;
    this.rows = mobile ? 3 : 2;
    this.horizontalGap = mobile ? 0.18 : tablet ? 0.28 : wide ? 0.5 : 0.38;
    this.verticalGap = mobile ? 0.22 : tablet ? 0.36 : wide ? 0.7 : 0.55;

    this.camera.fov = fov;
    this.camera.aspect = width / height;
    this.camera.position.set(0, 0, cameraZ);
    this.camera.lookAt(0, 0, 0);
    this.camera.updateProjectionMatrix();

    const halfHeight = Math.tan(THREE.MathUtils.degToRad(fov) / 2) * cameraZ;
    const halfWidth = halfHeight * this.camera.aspect;
    this.planeWidth = Math.min(
      (2 * halfWidth * (mobile ? 0.88 : tablet ? 0.84 : wide ? 0.78 : 0.8) -
        (this.columns - 1) * this.horizontalGap) /
        this.columns,
      ((2 * halfHeight * (mobile || tablet ? 0.82 : wide ? 0.78 : 0.8) -
        (this.rows - 1) * this.verticalGap) /
        this.rows) /
        IMAGE_RATIO,
      mobile ? 99 : tablet ? 8.5 : 9.2,
    );
    this.planeHeight = this.planeWidth * IMAGE_RATIO;

    const pixelsPerWorld = height / (halfHeight * 2);
    this.gridCards.forEach((mesh) => {
      mesh.geometry.dispose();
      mesh.geometry = new THREE.PlaneGeometry(this.planeWidth, this.planeHeight, 20, 12);
      const positions = mesh.geometry.attributes.position as THREE.BufferAttribute;
      const restX = new Float32Array(positions.count);
      const restY = new Float32Array(positions.count);
      for (let index = 0; index < positions.count; index += 1) {
        restX[index] = positions.getX(index);
        restY[index] = positions.getY(index);
      }
      mesh.userData = {
        restX,
        restY,
        wave: 1,
        waveT: 0,
      } satisfies GridCardState;
      const material = mesh.material as THREE.ShaderMaterial;
      material.uniforms.uSize.value.set(
        this.planeWidth * pixelsPerWorld,
        this.planeHeight * pixelsPerWorld,
      );
    });

    this.rebuildGuides();
    this.renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    this.renderer.setSize(width, height, false);
  }

  private rebuildGuides() {
    this.guideLines.forEach((line) => {
      this.scene.remove(line);
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    });
    this.guideLines.length = 0;

    const halfHeight =
      Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) *
      this.camera.position.z;
    const sideOffset =
      RIBBON_HEIGHT * 0.5 +
      (4 / window.innerHeight) * halfHeight * 2 +
      RIBBON_HEIGHT * 0.12;
    const sides: [THREE.Vector3[], THREE.Vector3[]] = [[], []];
    for (let index = 0; index <= 600; index += 1) {
      const theta = (index / 600) * TAU_TWO;
      const center = curvePoint(theta);
      const normal = new THREE.Vector3()
        .crossVectors(
          curveTangent(theta),
          new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)),
        )
        .normalize();
      normal.y += 0.6;
      normal.normalize();
      sides[0].push(center.clone().addScaledVector(normal, sideOffset));
      sides[1].push(center.clone().addScaledVector(normal, -sideOffset));
    }

    const firstGuide = [...sides[0]].reverse();
    const secondGuide = [...sides[1]].reverse();
    const tip = secondGuide[0];
    const next = secondGuide[1];
    const direction = tip.clone().sub(next).normalize();
    const distanceToTop = (halfHeight - tip.y) / direction.y;
    const extension: THREE.Vector3[] = [];
    for (let index = 20; index >= 1; index -= 1) {
      extension.push(
        tip.clone().addScaledVector(direction, (index / 20) * distanceToTop),
      );
    }
    secondGuide.unshift(...extension);

    [firstGuide, secondGuide].forEach((points) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      geometry.setDrawRange(0, 0);
      const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ color: 0x9e9e9e }),
      );
      line.renderOrder = 5;
      line.frustumCulled = false;
      this.guideLines.push(line);
      this.scene.add(line);
    });
  }

  private updateGridWave(mesh: THREE.Mesh, amount: number, time: number, index: number) {
    const positions = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const state = mesh.userData as GridCardState;
    const column = index % this.columns;
    const row = Math.floor(index / this.columns);
    const interiorColumn = column > 0 && column < this.columns - 1;

    for (let vertex = 0; vertex < positions.count; vertex += 1) {
      const x = state.restX[vertex];
      const y = state.restY[vertex];
      let phase: number;
      if (interiorColumn) {
        phase = 1 - (y / this.planeHeight + 0.5);
      } else {
        const normalizedX = x / this.planeWidth + 0.5;
        const normalizedY = 1 - (y / this.planeHeight + 0.5);
        phase =
          column === 0
            ? ((row === 0 ? normalizedX + normalizedY : normalizedX + 1 - normalizedY) * 0.5)
            : ((row === 0 ? 1 - normalizedX + normalizedY : 1 - normalizedX + 1 - normalizedY) * 0.5);
      }
      positions.setXYZ(
        vertex,
        x,
        y,
        amount * phase * Math.sin(phase * Math.PI * 0.9 - 2 * time) * this.planeWidth * 0.12,
      );
    }
    positions.needsUpdate = true;
  }

  private updateRibbon(mesh: THREE.Mesh, start: number) {
    const positions = mesh.geometry.attributes.position as THREE.BufferAttribute;
    const uvs = mesh.geometry.attributes.uv as THREE.BufferAttribute;
    const state = mesh.userData as RibbonCardState;
    const writeUvs = !state.uvWritten;
    for (let index = 0; index < 117; index += 1) {
      const along = index / 116;
      const theta = (start + along * CARD_LENGTH) / CURVE_SPEED;
      const center = curvePoint(theta);
      const normal = new THREE.Vector3()
        .crossVectors(
          curveTangent(theta),
          new THREE.Vector3(Math.cos(theta), 0, Math.sin(theta)),
        )
        .normalize();
      normal.y += 0.6;
      normal.normalize();
      for (let row = 0; row < 2; row += 1) {
        const vertex = 117 * row + index;
        const offset = (row === 0 ? -0.5 : 0.5) * RIBBON_HEIGHT;
        positions.setXYZ(
          vertex,
          center.x + normal.x * offset,
          center.y + normal.y * offset,
          center.z + normal.z * offset,
        );
        if (writeUvs) uvs.setXY(vertex, along, row);
      }
    }
    positions.needsUpdate = true;
    if (writeUvs) {
      uvs.needsUpdate = true;
      state.uvWritten = true;
    }
  }

  setActive(active: boolean) {
    if (active) this.snapProgressOnNextRender = true;
  }

  render(rawProgress: number) {
    const now = performance.now();
    const delta = Math.min((now - this.lastRenderTime) / 1000, 0.05) || 1 / 60;
    this.lastRenderTime = now;
    const snapProgress = this.snapProgressOnNextRender;
    const progressEase = snapProgress ? 1 : 1 - Math.pow(0.001, delta);
    this.smoothedProgress += (rawProgress - this.smoothedProgress) * progressEase;
    this.snapProgressOnNextRender = false;
    const mobile = window.innerWidth < 768;
    const phaseRatio = (mobile ? 3 : 5) / (mobile ? 4.5 : 6.5);
    const helixPhase = clamp01(this.smoothedProgress / phaseRatio);
    const ribbonProgress = clamp01(helixPhase / (400 / 600));
    const gridPhase = clamp01((helixPhase - GRID_START) / (1 - GRID_START));
    const offset =
      ribbonProgress * (CURVE_LENGTH + HELIX_START) - HELIX_START + 25;

    this.ribbonCards.forEach((mesh, index) => {
      const start = offset + CARD_SPACING * index;
      mesh.visible = ribbonProgress < 1 && start > 0 && start < CURVE_LENGTH;
      if (mesh.visible) this.updateRibbon(mesh, Math.min(start, CURVE_LENGTH - 0.001));
    });

    const guideEase = snapProgress ? 1 : 1 - Math.pow(0.01, delta);
    this.guideRibbonProgress +=
      (ribbonProgress - this.guideRibbonProgress) * guideEase;
    const firstEnd = Math.floor(
      this.guideRibbonProgress * (601 + GUIDE_TRAIL),
    );
    const firstStart = Math.max(0, firstEnd - GUIDE_TRAIL);
    this.guideLines[0]?.geometry.setDrawRange(
      firstStart,
      Math.max(0, Math.min(firstEnd, 601) - firstStart + 1),
    );
    const secondEnd = Math.floor(
      this.guideRibbonProgress * (621 + GUIDE_TRAIL),
    );
    const secondStart = Math.max(0, secondEnd - GUIDE_TRAIL);
    this.guideLines[1]?.geometry.setDrawRange(
      secondStart,
      Math.max(0, Math.min(secondEnd, 621) - secondStart + 1),
    );

    const halfHeight =
      Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) * this.camera.position.z;
    const halfWidth = halfHeight * this.camera.aspect;

    this.gridCards.forEach((mesh, index) => {
      const staggered = clamp01((gridPhase - 0.08 * index) / 0.4);
      const state = mesh.userData as GridCardState;
      if (staggered <= 0 && !state.wave) {
        mesh.visible = false;
        return;
      }
      mesh.visible = true;
      const eased = 1 - Math.pow(1 - staggered, 3);
      const row = Math.floor(index / this.columns);
      const column = index % this.columns;
      const targetX =
        -0.5 *
          (this.columns * this.planeWidth +
            (this.columns - 1) * this.horizontalGap) +
        this.planeWidth * 0.5 +
        column * (this.planeWidth + this.horizontalGap);
      const targetY =
        0.5 *
          (this.rows * this.planeHeight +
            (this.rows - 1) * this.verticalGap) -
        this.planeHeight * 0.5 -
        row * (this.planeHeight + this.verticalGap);
      const startY =
        index < this.columns
          ? halfHeight + this.planeHeight * 2
          : -halfHeight - this.planeHeight * 2;
      const startX =
        column === 0
          ? -halfWidth - this.planeWidth * 2
          : column === this.columns - 1
            ? halfWidth + this.planeWidth * 2
            : targetX;
      mesh.position.set(
        THREE.MathUtils.lerp(startX, targetX, eased),
        THREE.MathUtils.lerp(startY, targetY, eased),
        0,
      );
      state.waveT += 1.08 * delta;
      state.wave =
        staggered < 1
          ? Math.min(1, state.wave + 1.8 * delta)
          : Math.max(0, state.wave - 0.72 * delta);
      if (state.wave > 0) {
        this.updateGridWave(mesh, state.wave, state.waveT, index);
        state.waveFlat = false;
      } else if (!state.waveFlat) {
        this.updateGridWave(mesh, 0, state.waveT, index);
        state.waveFlat = true;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh || object instanceof THREE.Line)) return;
      object.geometry.dispose();
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material) => {
        if (material instanceof THREE.ShaderMaterial) {
          const texture = material.uniforms.map?.value;
          if (texture instanceof THREE.Texture) texture.dispose();
        }
        material.dispose();
      });
    });
    this.renderer.dispose();
  }
}
