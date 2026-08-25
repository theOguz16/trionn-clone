import * as THREE from "three";

const SLAB_WIDTH = 2.34;
const SLAB_HEIGHT = 2.46;
const SLAB_DEPTH = 0.5;
const TEXTURE_SIZE = 512;

type CutIndex = 0 | 1 | 2;

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value));
}

function smoothStep(value: number) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function fract(value: number) {
  return value - Math.floor(value);
}

function hash2(x: number, y: number) {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function valueNoise(x: number, y: number) {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);

  const tx = x - x0;
  const ty = y - y0;

  const sx = tx * tx * (3 - 2 * tx);
  const sy = ty * ty * (3 - 2 * ty);

  const a = hash2(x0, y0);
  const b = hash2(x0 + 1, y0);
  const c = hash2(x0, y0 + 1);
  const d = hash2(x0 + 1, y0 + 1);

  const top = THREE.MathUtils.lerp(a, b, sx);
  const bottom = THREE.MathUtils.lerp(c, d, sx);

  return THREE.MathUtils.lerp(top, bottom, sy);
}

function fbm(x: number, y: number, octaves = 4) {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;
  let normalization = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    value += valueNoise(x * frequency, y * frequency) * amplitude;
    normalization += amplitude;

    frequency *= 2.03;
    amplitude *= 0.48;
  }

  return normalization > 0 ? value / normalization : value;
}

function ridgedNoise(x: number, y: number, octaves = 3) {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;
  let normalization = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    const noise = valueNoise(x * frequency, y * frequency);

    value += (1 - Math.abs(noise * 2 - 1)) * amplitude;
    normalization += amplitude;

    frequency *= 2.04;
    amplitude *= 0.47;
  }

  return normalization > 0 ? value / normalization : value;
}

function createStoneTexture() {
  const canvas = document.createElement("canvas");

  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const image = context.createImageData(TEXTURE_SIZE, TEXTURE_SIZE);

  for (let y = 0; y < TEXTURE_SIZE; y += 1) {
    for (let x = 0; x < TEXTURE_SIZE; x += 1) {
      const u = x / TEXTURE_SIZE;
      const v = y / TEXTURE_SIZE;

      const broad = fbm(u * 4.2 + 1.4, v * 4.2 + 3.2, 4);
      const medium = fbm(u * 15.5 + 8.2, v * 15.5 + 5.7, 4);
      const grit = ridgedNoise(u * 47 + 2.9, v * 47 + 8.1, 3);
      const micro = valueNoise(u * 105 + 4.8, v * 105 + 11.4);

      const stone =
        broad * 0.25 +
        medium * 0.34 +
        grit * 0.25 +
        micro * 0.16;

      // Önceki sürümden daha koyu charcoal.
      const tone = THREE.MathUtils.clamp(
        32 + stone * 96,
        34,
        127,
      );

      const index = (y * TEXTURE_SIZE + x) * 4;

      image.data[index] = Math.round(tone * 0.94);
      image.data[index + 1] = Math.round(tone * 0.97);
      image.data[index + 2] = Math.round(tone);
      image.data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = 4;
  texture.needsUpdate = true;

  return texture;
}

function drawIrregularWedge(
  context: CanvasRenderingContext2D,
  {
    centerX,
    centerY,
    length,
    startWidth,
    endWidth,
    angle,
    seed,
  }: {
    centerX: number;
    centerY: number;
    length: number;
    startWidth: number;
    endWidth: number;
    angle: number;
    seed: number;
  },
) {
  context.save();

  context.translate(
    centerX * TEXTURE_SIZE,
    centerY * TEXTURE_SIZE,
  );

  context.rotate((angle * Math.PI) / 180);

  const halfLength = (length * TEXTURE_SIZE) / 2;
  const startHalf = (startWidth * TEXTURE_SIZE) / 2;
  const endHalf = (endWidth * TEXTURE_SIZE) / 2;

  const jitter = (value: number, amount: number) => {
    return (
      value +
      (hash2(seed + value * 0.013, seed * 1.91) - 0.5) *
        amount
    );
  };

  const segments = 10;

  const upper: Array<[number, number]> = [];
  const lower: Array<[number, number]> = [];

  for (let index = 0; index <= segments; index += 1) {
    const t = index / segments;

    const x = THREE.MathUtils.lerp(
      -halfLength,
      halfLength,
      t,
    );

    // Uca giderken ciddi taper.
    const taper = Math.pow(1 - t, 0.35);

    const width =
      THREE.MathUtils.lerp(
        startHalf,
        endHalf,
        t,
      ) *
      (0.72 + taper * 0.28);

    const noise =
      (hash2(
        seed + index * 1.71,
        seed * 3.12 + index,
      ) -
        0.5) *
      TEXTURE_SIZE *
      0.006;

    upper.push([
      jitter(x, TEXTURE_SIZE * 0.003),
      -width + noise,
    ]);

    lower.push([
      jitter(x, TEXTURE_SIZE * 0.003),
      width + noise,
    ]);
  }

  context.beginPath();

  context.moveTo(
    upper[0][0],
    upper[0][1],
  );

  for (let index = 1; index < upper.length; index += 1) {
    context.lineTo(
      upper[index][0],
      upper[index][1],
    );
  }

  // Sivri uç.
  context.lineTo(
    halfLength + TEXTURE_SIZE * 0.008,
    0,
  );

  for (let index = lower.length - 1; index >= 0; index -= 1) {
    context.lineTo(
      lower[index][0],
      lower[index][1],
    );
  }

  context.closePath();
  context.fill();

  context.restore();
}

function drawCut(
  context: CanvasRenderingContext2D,
  index: CutIndex,
  expansion = 0,
) {
  if (index === 0) {
    // Sol, uzun diagonal.
    drawIrregularWedge(context, {
      centerX: 0.445,
      centerY: 0.505,
      length: 0.37 + expansion,
      startWidth: 0.052 + expansion * 0.28,
      endWidth: 0.014 + expansion * 0.12,
      angle: -64,
      seed: 7.1,
    });

    return;
  }

  if (index === 1) {
    // Sağdaki daha kısa diagonal.
    drawIrregularWedge(context, {
      centerX: 0.595,
      centerY: 0.49,
      length: 0.29 + expansion,
      startWidth: 0.046 + expansion * 0.25,
      endWidth: 0.012 + expansion * 0.1,
      angle: -68,
      seed: 19.3,
    });

    return;
  }

  // Üçüncü kesik özellikle yukarıdakilerden ayrı.
  drawIrregularWedge(context, {
    centerX: 0.535,
    centerY: 0.705,
    length: 0.17 + expansion,
    startWidth: 0.039 + expansion * 0.2,
    endWidth: 0.016 + expansion * 0.1,
    angle: -12,
    seed: 31.7,
  });
}

function createCutTexture(
  index: CutIndex,
  {
    expansion = 0,
    blur = 0,
  }: {
    expansion?: number;
    blur?: number;
  } = {},
) {
  const canvas = document.createElement("canvas");

  canvas.width = TEXTURE_SIZE;
  canvas.height = TEXTURE_SIZE;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  context.clearRect(
    0,
    0,
    TEXTURE_SIZE,
    TEXTURE_SIZE,
  );

  if (blur > 0) {
    context.filter = `blur(${blur}px)`;
  }

  context.fillStyle = "#ffffff";

  drawCut(
    context,
    index,
    expansion,
  );

  context.filter = "none";

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.NoColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;

  return texture;
}

function createSlabGeometry() {
  const geometry = new THREE.BoxGeometry(
    SLAB_WIDTH,
    SLAB_HEIGHT,
    SLAB_DEPTH,
    30,
    34,
    8,
  );

  const positions = geometry.attributes.position;
  const normals = geometry.attributes.normal;

  const halfWidth = SLAB_WIDTH * 0.5;
  const halfHeight = SLAB_HEIGHT * 0.5;

  for (let index = 0; index < positions.count; index += 1) {
    let x = positions.getX(index);
    let y = positions.getY(index);
    let z = positions.getZ(index);

    const nx = normals.getX(index);
    const ny = normals.getY(index);
    const nz = normals.getZ(index);

    const normalizedX =
      Math.abs(x) / halfWidth;

    const normalizedY =
      Math.abs(y) / halfHeight;

    if (Math.abs(nz) > 0.8) {
      const medium =
        (valueNoise(
          x * 6.3 + 2.2,
          y * 6.3 + 8.1,
        ) -
          0.5) *
        0.036;

      const fine =
        (valueNoise(
          x * 15.8 + 5.4,
          y * 15.8 + 3.7,
        ) -
          0.5) *
        0.016;

      const edge =
        Math.pow(
          Math.max(
            normalizedX,
            normalizedY,
          ),
          5,
        ) *
        (valueNoise(
          x * 10.1 + 4.8,
          y * 10.1 + 6.4,
        ) -
          0.5) *
        0.064;

      z += Math.sign(nz) * (medium + fine + edge);
    }

    if (Math.abs(nx) > 0.8) {
      const side =
        (valueNoise(
          y * 4.6 + 5.1,
          z * 8.7 + 2.2,
        ) -
          0.5) *
        0.12;

      x += Math.sign(nx) * side;
    }

    if (Math.abs(ny) > 0.8) {
      const cap =
        (valueNoise(
          x * 4.7 + 7.5,
          z * 8.9 + 3.8,
        ) -
          0.5) *
        0.095;

      y += Math.sign(ny) * cap;
    }

    // Köşeleri daha taş gibi kır.
    const corner = THREE.MathUtils.clamp(
      (
        normalizedX +
        normalizedY -
        1.37
      ) /
        0.63,
      0,
      1,
    );

    if (corner > 0) {
      const random =
        valueNoise(
          x * 8.1 + 2.5,
          y * 8.1 + 7.2,
        );

      const reduction =
        1 -
        corner *
          (0.045 + random * 0.075);

      x *= reduction;
      y *= reduction;
    }

    positions.setXYZ(
      index,
      x,
      y,
      z,
    );
  }

  positions.needsUpdate = true;

  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

export class ServicesSlab {
  readonly root = new THREE.Group();

  readonly mesh: THREE.Mesh<
    THREE.BoxGeometry,
    THREE.MeshStandardMaterial
  >;

  private readonly geometry: THREE.BoxGeometry;
  private readonly material: THREE.MeshStandardMaterial;

  private readonly stoneTexture: THREE.CanvasTexture | null;

  private readonly cutTextures: Array<THREE.CanvasTexture | null>;
  private readonly rimTextures: Array<THREE.CanvasTexture | null>;

  /**
   * Bunlar doğrudan shader'a referans olarak veriliyor.
   * setCutProgress() value'ları değiştirdiğinde shader otomatik görüyor.
   */
  private readonly cutProgressUniforms = [
    { value: 0 },
    { value: 0 },
    { value: 0 },
  ];

  constructor() {
    this.geometry = createSlabGeometry();

    this.stoneTexture = createStoneTexture();

    this.cutTextures = [
      createCutTexture(0),
      createCutTexture(1),
      createCutTexture(2),
    ];

    this.rimTextures = [
      createCutTexture(0, {
        expansion: 0.028,
        blur: 3,
      }),
      createCutTexture(1, {
        expansion: 0.025,
        blur: 3,
      }),
      createCutTexture(2, {
        expansion: 0.022,
        blur: 3,
      }),
    ];

    this.material = new THREE.MeshStandardMaterial({
      // Bilerek koyu charcoal.
      color: 0xa1a3a2,
      map: this.stoneTexture,
      roughness: 0.965,
      metalness: 0,
      envMapIntensity: 0.32,
    });

    /**
     * Önemli:
     * Burada THREE.Shader diye custom type kullanmıyoruz.
     * onBeforeCompile kendi shader tipini inference ediyor.
     */
    this.material.onBeforeCompile = (shader) => {
      shader.uniforms.uServiceCut1 = this.cutProgressUniforms[0];
      shader.uniforms.uServiceCut2 = this.cutProgressUniforms[1];
      shader.uniforms.uServiceCut3 = this.cutProgressUniforms[2];

      shader.uniforms.uServiceCutMask1 = {
        value: this.cutTextures[0],
      };

      shader.uniforms.uServiceCutMask2 = {
        value: this.cutTextures[1],
      };

      shader.uniforms.uServiceCutMask3 = {
        value: this.cutTextures[2],
      };

      shader.uniforms.uServiceCutRim1 = {
        value: this.rimTextures[0],
      };

      shader.uniforms.uServiceCutRim2 = {
        value: this.rimTextures[1],
      };

      shader.uniforms.uServiceCutRim3 = {
        value: this.rimTextures[2],
      };

      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `
#include <common>

varying vec3 vServicesObjectNormal;
          `,
        )
        .replace(
          "#include <beginnormal_vertex>",
          `
#include <beginnormal_vertex>

vServicesObjectNormal = objectNormal;
          `,
        );

      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          `
#include <common>

varying vec3 vServicesObjectNormal;

uniform float uServiceCut1;
uniform float uServiceCut2;
uniform float uServiceCut3;

uniform sampler2D uServiceCutMask1;
uniform sampler2D uServiceCutMask2;
uniform sampler2D uServiceCutMask3;

uniform sampler2D uServiceCutRim1;
uniform sampler2D uServiceCutRim2;
uniform sampler2D uServiceCutRim3;
          `,
        )
        .replace(
          "#include <map_fragment>",
          `
#include <map_fragment>

float servicesFrontFace =
  smoothstep(
    0.72,
    0.96,
    vServicesObjectNormal.z
  );

float servicesP1 =
  smoothstep(
    0.0,
    1.0,
    uServiceCut1
  );

float servicesP2 =
  smoothstep(
    0.0,
    1.0,
    uServiceCut2
  );

float servicesP3 =
  smoothstep(
    0.0,
    1.0,
    uServiceCut3
  );

float servicesCut1 =
  texture2D(
    uServiceCutMask1,
    vMapUv
  ).r *
  servicesP1 *
  servicesFrontFace;

float servicesCut2 =
  texture2D(
    uServiceCutMask2,
    vMapUv
  ).r *
  servicesP2 *
  servicesFrontFace;

float servicesCut3 =
  texture2D(
    uServiceCutMask3,
    vMapUv
  ).r *
  servicesP3 *
  servicesFrontFace;

float servicesRim1 =
  texture2D(
    uServiceCutRim1,
    vMapUv
  ).r *
  servicesP1 *
  servicesFrontFace;

float servicesRim2 =
  texture2D(
    uServiceCutRim2,
    vMapUv
  ).r *
  servicesP2 *
  servicesFrontFace;

float servicesRim3 =
  texture2D(
    uServiceCutRim3,
    vMapUv
  ).r *
  servicesP3 *
  servicesFrontFace;

float servicesCut =
  clamp(
    max(
      max(
        servicesCut1,
        servicesCut2
      ),
      servicesCut3
    ),
    0.0,
    1.0
  );

float servicesOuter =
  clamp(
    max(
      max(
        servicesRim1,
        servicesRim2
      ),
      servicesRim3
    ),
    0.0,
    1.0
  );

float servicesLip =
  clamp(
    servicesOuter -
    servicesCut,
    0.0,
    1.0
  );

/*
 * Taşı genel olarak biraz karart.
 * Trionn'daki charcoal slab'a daha yakın.
 */
diffuseColor.rgb *=
  vec3(
    0.78,
    0.80,
    0.82
  );

/*
 * Oyuk tamamen düz siyah değil.
 * İçeride stone detail'in ufak bir kısmı kalıyor.
 */
vec3 servicesOriginalStone =
  diffuseColor.rgb;

vec3 servicesDeepCavity =
  vec3(
    0.018,
    0.021,
    0.023
  );

vec3 servicesCavityDetail =
  servicesOriginalStone *
  0.12 +
  vec3(
    0.018,
    0.019,
    0.020
  );

vec3 servicesCavity =
  mix(
    servicesCavityDetail,
    servicesDeepCavity,
    0.77
  );

/*
 * Kırılmış kaya dudağı.
 */
vec3 servicesBrokenEdge =
  servicesOriginalStone *
  0.48 +
  vec3(
    0.045,
    0.047,
    0.048
  );

/*
 * Önce lip, sonra cavity.
 */
diffuseColor.rgb =
  mix(
    diffuseColor.rgb,
    servicesBrokenEdge,
    servicesLip * 0.76
  );

diffuseColor.rgb =
  mix(
    diffuseColor.rgb,
    servicesCavity,
    servicesCut * 0.965
  );
          `,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `
#include <roughnessmap_fragment>

/*
 * Oyuk içi çok rough.
 * Kenar ise hafif ışık yakalasın.
 */
roughnessFactor =
  mix(
    roughnessFactor,
    1.0,
    servicesCut * 0.86
  );

roughnessFactor =
  mix(
    roughnessFactor,
    0.78,
    servicesLip * 0.3
  );
          `,
        );
    };

    this.material.customProgramCacheKey = () =>
      "services-slab-wedge-cuts-v4";

    this.mesh = new THREE.Mesh(
      this.geometry,
      this.material,
    );

    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;

    this.root.add(this.mesh);
  }

  /**
   * ServicesScene.ts tarafından çağrılıyor.
   *
   * Örnek:
   * this.slab.setCutProgress(
   *   firstCut,
   *   secondCut,
   *   thirdCut,
   * );
   */
  setCutProgress(
    first: number,
    second: number,
    third: number,
  ) {
    this.cutProgressUniforms[0].value =
      THREE.MathUtils.clamp(
        first,
        0,
        1,
      );

    this.cutProgressUniforms[1].value =
      THREE.MathUtils.clamp(
        second,
        0,
        1,
      );

    this.cutProgressUniforms[2].value =
      THREE.MathUtils.clamp(
        third,
        0,
        1,
      );
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();

    this.stoneTexture?.dispose();

    this.cutTextures.forEach((texture) => {
      texture?.dispose();
    });

    this.rimTextures.forEach((texture) => {
      texture?.dispose();
    });
  }
}