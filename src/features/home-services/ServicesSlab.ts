import * as THREE from "three";

const SLAB_WIDTH = 2.34;
const SLAB_HEIGHT = 2.46;
const SLAB_DEPTH = 0.5;
const TEXTURE_SIZE = 512;

type CutIndex = 0 | 1 | 2;
type SlabQualityLevel = "low" | "medium" | "high";

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

function createStoneTexture(
  textureSize = TEXTURE_SIZE,
  anisotropy = 4,
) {
  const canvas = document.createElement("canvas");

  canvas.width = textureSize;
  canvas.height = textureSize;

  const context = canvas.getContext("2d");
  if (!context) {
    return null;
  }

  const image = context.createImageData(
    textureSize,
    textureSize,
  );

  for (let y = 0; y < textureSize; y += 1) {
    for (let x = 0; x < textureSize; x += 1) {
      const u = x / textureSize;
      const v = y / textureSize;

      const broad = fbm(u * 4.2 + 1.4, v * 4.2 + 3.2, 4);
      const medium = fbm(u * 15.5 + 8.2, v * 15.5 + 5.7, 4);
      const grit = ridgedNoise(u * 47 + 2.9, v * 47 + 8.1, 3);
      const micro = valueNoise(u * 105 + 4.8, v * 105 + 11.4);

      const stone =
        broad * 0.34 +
        medium * 0.2 +
        grit * 0.3 +
        micro * 0.16;

      const contrastedStone =
        (stone - 0.5) * 1.72 + 0.5;

      // Açık aggregate tepeleri ve koyu oyukları aynı haritada koru.
      const tone = THREE.MathUtils.clamp(
        28 + contrastedStone * 148,
        32,
        182,
      );

      const index = (y * textureSize + x) * 4;

      image.data[index] = Math.round(tone * 0.94);
      image.data[index + 1] = Math.round(tone * 0.97);
      image.data[index + 2] = Math.round(tone);
      image.data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);

  /* Keskin agrega kırıkları: yumuşak noise alanını kaya yüzeyine çevirir. */
  const chipCount = Math.round(textureSize * 0.18);

  context.save();
  context.lineJoin = "miter";

  for (let index = 0; index < chipCount; index += 1) {
    const x = hash2(index * 9.17, 31.4) * textureSize;
    const y = hash2(index * 4.73, 82.6) * textureSize;
    const radius =
      (1.4 + hash2(index * 7.21, 14.8) * 6.8) *
      (textureSize / TEXTURE_SIZE);
    const angle = hash2(index * 3.11, 64.2) * Math.PI * 2;

    context.beginPath();
    for (let point = 0; point < 5; point += 1) {
      const pointAngle = angle + (point / 5) * Math.PI * 2;
      const pointRadius =
        radius * (0.58 + hash2(index * 17.3, point * 12.9) * 0.72);
      const px = x + Math.cos(pointAngle) * pointRadius;
      const py = y + Math.sin(pointAngle) * pointRadius;

      if (point === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    }
    context.closePath();
    context.fillStyle =
      index % 4 === 0
        ? "rgba(239,236,224,0.3)"
        : "rgba(5,7,8,0.34)";
    context.fill();
  }

  context.restore();

  /* İnce çatlaklar, referanstaki kırık kaya katmanlarını ölçeklendirir. */
  context.save();
  context.lineCap = "square";

  for (let index = 0; index < 26; index += 1) {
    const startX = hash2(index * 5.61, 22.7) * textureSize;
    const startY = hash2(index * 8.43, 71.9) * textureSize;
    const length =
      (18 + hash2(index * 2.17, 43.2) * 58) *
      (textureSize / TEXTURE_SIZE);
    const angle = hash2(index * 6.31, 18.5) * Math.PI * 2;

    context.beginPath();
    context.moveTo(startX, startY);
    for (let segment = 1; segment <= 4; segment += 1) {
      const distance = (length * segment) / 4;
      const jitter =
        (hash2(index * 13.7, segment * 7.9) - 0.5) *
        length *
        0.22;
      context.lineTo(
        startX + Math.cos(angle) * distance - Math.sin(angle) * jitter,
        startY + Math.sin(angle) * distance + Math.cos(angle) * jitter,
      );
    }
    context.strokeStyle = "rgba(3,5,6,0.42)";
    context.lineWidth = Math.max(0.7, textureSize / 640);
    context.stroke();
  }

  context.restore();

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = anisotropy;
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

function createSlabGeometry(
  qualityLevel: SlabQualityLevel,
) {
  const segments =
    qualityLevel === "high"
      ? { width: 78, height: 82, depth: 10 }
      : qualityLevel === "low"
        ? { width: 40, height: 44, depth: 4 }
        : { width: 62, height: 66, depth: 8 };

  const geometry = new THREE.BoxGeometry(
    SLAB_WIDTH,
    SLAB_HEIGHT,
    SLAB_DEPTH,
    segments.width,
    segments.height,
    segments.depth,
  );

  // BoxGeometry groups: right, left, top, bottom, front, back.
  // Keep the front face on its own baked/carved material while the sides
  // use a repeating fallback texture and the caps catch a lighter highlight.
  geometry.groups.forEach((group, index) => {
    group.materialIndex =
      index === 4
        ? 0
        : index === 2 || index === 3
          ? 2
          : 1;
  });

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
        0.105;

      const fine =
        (valueNoise(
          x * 15.8 + 5.4,
          y * 15.8 + 3.7,
        ) -
          0.5) *
        0.038;

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
        0.13;

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

type ServicesSlabOptions = {
  textureSize?: number;
  textureAnisotropy?: number;
  qualityLevel?: SlabQualityLevel;
};

export class ServicesSlab {
  readonly root = new THREE.Group();

  readonly mesh: THREE.Mesh<
    THREE.BoxGeometry,
    THREE.MeshStandardMaterial[]
  >;

  private readonly geometry: THREE.BoxGeometry;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly sideMaterial: THREE.MeshStandardMaterial;
  private readonly capMaterial: THREE.MeshStandardMaterial;
  private readonly qualityLevel: SlabQualityLevel;
  private readonly textureAnisotropy: number;

  private readonly stoneTexture: THREE.CanvasTexture | null;
  private readonly sideTexture: THREE.Texture | null;
  private bakedTextures: THREE.Texture[] = [];
  private disposed = false;
  private textureLoadTimer: number | null = null;

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

  constructor({
    textureSize = TEXTURE_SIZE,
    textureAnisotropy = 4,
    qualityLevel = "medium",
  }: ServicesSlabOptions = {}) {
    this.qualityLevel = qualityLevel;
    this.textureAnisotropy = textureAnisotropy;
    this.geometry = createSlabGeometry(qualityLevel);

    this.stoneTexture = createStoneTexture(
      textureSize,
      textureAnisotropy,
    );

    this.sideTexture =
      this.stoneTexture?.clone() ?? null;

    if (this.sideTexture) {
      this.sideTexture.colorSpace = THREE.SRGBColorSpace;
      this.sideTexture.wrapS = THREE.RepeatWrapping;
      this.sideTexture.wrapT = THREE.RepeatWrapping;
      this.sideTexture.repeat.set(1.35, 2.7);
      this.sideTexture.needsUpdate = true;
    }

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
      color: 0x9a9994,
      map: this.stoneTexture,
      bumpMap: this.stoneTexture,
      bumpScale:
        qualityLevel === "low"
          ? 0.12
          : 0.18,
      displacementMap:
        qualityLevel === "low"
          ? null
          : this.stoneTexture,
      displacementScale:
        qualityLevel === "high"
          ? 0.068
          : qualityLevel === "medium"
            ? 0.046
            : 0,
      displacementBias:
        qualityLevel === "high"
          ? -0.034
          : qualityLevel === "medium"
            ? -0.023
            : 0,
      roughness: 0.88,
      metalness: 0,
      envMapIntensity: 0.34,
    });

    this.sideMaterial = new THREE.MeshStandardMaterial({
      color: 0x62625f,
      map: this.sideTexture,
      bumpMap: this.sideTexture,
      bumpScale: 0.16,
      roughness: 0.94,
      metalness: 0,
      envMapIntensity: 0.24,
    });

    this.capMaterial = new THREE.MeshStandardMaterial({
      color: 0x797973,
      map: this.sideTexture,
      bumpMap: this.sideTexture,
      bumpScale: 0.12,
      roughness: 0.82,
      metalness: 0,
      envMapIntensity: 0.42,
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

/*
 * Bir static cut maskesini sadece opacity ile açmak yerine,
 * start -> end yönünde gerçekten "kazınarak" reveal ediyor.
 */
float servicesDirectionalReveal(
  vec2 uv,
  vec2 startPoint,
  vec2 endPoint,
  float progress
) {
  vec2 axis = endPoint - startPoint;
  float axisLengthSq = max(dot(axis, axis), 0.00001);

  float along =
    clamp(
      dot(uv - startPoint, axis) / axisLengthSq,
      0.0,
      1.0
    );

  /*
   * Reveal ucunu hafif feather ediyoruz.
   * Böylece kesik bir anda açılmıyor;
   * kayanın üzerinde ilerleyen carving head hissi veriyor.
   */
  return
    1.0 -
    smoothstep(
      progress - 0.045,
      progress + 0.018,
      along
    );
}
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

/*
 * Scene 0..1 progress gönderiyor.
 * Burada her cut için hafif ease uygulanıyor.
 */
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

/*
 * drawCut() ile üretilen wedge'lerin yaklaşık eksenleri.
 * Bunlar maskenin tamamını bir anda göstermek yerine
 * wedge boyunca ilerleyen yontma reveal'i yaratıyor.
 */
float servicesReveal1 =
  servicesDirectionalReveal(
    vMapUv,
    vec2(0.365, 0.33),
    vec2(0.535, 0.68),
    servicesP1
  );

float servicesReveal2 =
  servicesDirectionalReveal(
    vMapUv,
    vec2(0.545, 0.37),
    vec2(0.645, 0.66),
    servicesP2
  );

float servicesReveal3 =
  servicesDirectionalReveal(
    vMapUv,
    vec2(0.465, 0.69),
    vec2(0.61, 0.66),
    servicesP3
  );

float servicesCut1 =
  texture2D(
    uServiceCutMask1,
    vMapUv
  ).r *
  servicesReveal1 *
  step(0.001, servicesP1) *
  servicesFrontFace;

float servicesCut2 =
  texture2D(
    uServiceCutMask2,
    vMapUv
  ).r *
  servicesReveal2 *
  step(0.001, servicesP2) *
  servicesFrontFace;

float servicesCut3 =
  texture2D(
    uServiceCutMask3,
    vMapUv
  ).r *
  servicesReveal3 *
  step(0.001, servicesP3) *
  servicesFrontFace;

float servicesRim1 =
  texture2D(
    uServiceCutRim1,
    vMapUv
  ).r *
  servicesReveal1 *
  step(0.001, servicesP1) *
  servicesFrontFace;

float servicesRim2 =
  texture2D(
    uServiceCutRim2,
    vMapUv
  ).r *
  servicesReveal2 *
  step(0.001, servicesP2) *
  servicesFrontFace;

float servicesRim3 =
  texture2D(
    uServiceCutRim3,
    vMapUv
  ).r *
  servicesReveal3 *
  step(0.001, servicesP3) *
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
 * Çok ince bir dark shoulder:
 * cavity'nin hemen dışında kayanın içeri çöktüğü hissi.
 */
float servicesShoulder =
  clamp(
    servicesOuter * 0.72 -
    servicesCut * 0.22,
    0.0,
    1.0
  );

/*
 * Stone'u referanstaki koyu charcoal bölgesine çek.
 */
diffuseColor.rgb *=
  vec3(
    0.76,
    0.77,
    0.79
  );

vec3 servicesOriginalStone =
  diffuseColor.rgb;

/*
 * Oyuk neredeyse siyah.
 * İçeride taş bilgisinin yalnızca çok küçük bir kısmı kalıyor.
 */
vec3 servicesDeepCavity =
  vec3(
    0.002,
    0.003,
    0.004
  );

vec3 servicesCavityDetail =
  servicesOriginalStone *
  0.035;

vec3 servicesCavity =
  mix(
    servicesCavityDetail,
    servicesDeepCavity,
    0.94
  );

/*
 * Eski açık gri outline yerine çok daha ince,
 * yüzey tonuna yakın kırılmış kaya dudağı.
 */
vec3 servicesBrokenEdge =
  servicesOriginalStone *
  0.76 +
  vec3(
    0.018,
    0.020,
    0.021
  );

/*
 * Önce shoulder ile yarığın çevresini karart.
 */
diffuseColor.rgb =
  mix(
    diffuseColor.rgb,
    diffuseColor.rgb * 0.48,
    servicesShoulder * 0.34
  );

/*
 * Lip yalnız çok hafif ışık yakalar.
 */
diffuseColor.rgb =
  mix(
    diffuseColor.rgb,
    servicesBrokenEdge,
    servicesLip * 0.20
  );

/*
 * Son olarak cavity.
 */
diffuseColor.rgb =
  mix(
    diffuseColor.rgb,
    servicesCavity,
    servicesCut
  );
          `,
        )
        .replace(
          "#include <roughnessmap_fragment>",
          `
#include <roughnessmap_fragment>

/*
 * Cavity ışığı neredeyse hiç geri yansıtmasın.
 * Lip ise yalnız çok ince bir highlight alsın.
 */
roughnessFactor =
  mix(
    roughnessFactor,
    1.0,
    servicesCut * 0.94
  );

roughnessFactor =
  mix(
    roughnessFactor,
    0.86,
    servicesLip * 0.12
  );
          `,
        );
    };

    this.material.customProgramCacheKey = () =>
      `services-slab-carved-cuts-v7-${this.qualityLevel}`;

    this.mesh = new THREE.Mesh(
      this.geometry,
      [
        this.material,
        this.sideMaterial,
        this.capMaterial,
      ],
    );

    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;

    this.root.add(this.mesh);

    // The procedural slab is visible immediately. Photogrammetry maps replace
    // only the front material after the scene is already interactive, so these
    // assets never extend the route preloader's critical path.
    this.textureLoadTimer = window.setTimeout(() => {
      this.textureLoadTimer = null;
      void this.loadBakedFrontMaterial();
    }, 0);
  }

  private configureBakedTexture(
    texture: THREE.Texture,
    colorSpace: THREE.ColorSpace,
  ) {
    texture.colorSpace = colorSpace;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = this.textureAnisotropy;

    // The source rock has an irregular outer silhouette. The bake fills that
    // cage, and this small inset keeps the padded perimeter off the slab face.
    texture.repeat.set(0.94, 0.94);
    texture.offset.set(0.03, 0.03);
    texture.needsUpdate = true;
  }

  private async loadBakedFrontMaterial() {
    const mobileAssets =
      window.matchMedia("(max-width: 767px)").matches ||
      this.qualityLevel === "low";
    const prefix = mobileAssets ? "mobile" : "desktop";
    const assetNames = ["albedo", "normal", "arm"];

    if (this.qualityLevel !== "low") {
      assetNames.push("height");
    }

    const loader = new THREE.TextureLoader();
    const results = await Promise.allSettled(
      assetNames.map((name) =>
        loader.loadAsync(
          `/textures/services-slab/${prefix}-${name}.webp`,
        ),
      ),
    );
    const loaded = results.flatMap((result) =>
      result.status === "fulfilled"
        ? [result.value]
        : [],
    );

    if (
      this.disposed ||
      loaded.length !== assetNames.length
    ) {
      loaded.forEach((texture) => texture.dispose());
      return;
    }

    const [albedo, normal, arm, height] = loaded;
    this.configureBakedTexture(
      albedo,
      THREE.SRGBColorSpace,
    );
    this.configureBakedTexture(
      normal,
      THREE.NoColorSpace,
    );
    this.configureBakedTexture(
      arm,
      THREE.NoColorSpace,
    );

    if (height) {
      this.configureBakedTexture(
        height,
        THREE.NoColorSpace,
      );
    }

    this.bakedTextures = loaded;
    this.material.color.setHex(0xb1b1ae);
    this.material.map = albedo;
    this.material.bumpMap = null;
    this.material.normalMap = normal;
    this.material.normalScale.setScalar(
      this.qualityLevel === "high"
        ? 0.88
        : this.qualityLevel === "medium"
          ? 0.68
          : 0.46,
    );
    this.material.roughnessMap = arm;
    this.material.aoMap = arm;
    this.material.aoMapIntensity = 0.72;
    this.material.displacementMap = height ?? null;
    this.material.displacementScale =
      this.qualityLevel === "high"
        ? 0.082
        : this.qualityLevel === "medium"
          ? 0.052
          : 0;
    this.material.displacementBias =
      this.qualityLevel === "high"
        ? -0.041
        : this.qualityLevel === "medium"
          ? -0.026
          : 0;
    this.material.needsUpdate = true;
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
    this.disposed = true;

    if (this.textureLoadTimer !== null) {
      window.clearTimeout(this.textureLoadTimer);
      this.textureLoadTimer = null;
    }

    this.geometry.dispose();
    this.material.dispose();
    this.sideMaterial.dispose();
    this.capMaterial.dispose();

    this.stoneTexture?.dispose();
    this.sideTexture?.dispose();
    this.bakedTextures.forEach((texture) => texture.dispose());
    this.bakedTextures = [];

    this.cutTextures.forEach((texture) => {
      texture?.dispose();
    });

    this.rimTextures.forEach((texture) => {
      texture?.dispose();
    });
  }
}
