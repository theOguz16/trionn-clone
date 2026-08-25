import * as THREE from "three";

const SLAB_WIDTH = 2.34;
const SLAB_HEIGHT = 2.46;
const SLAB_DEPTH = 0.5;

function hash2(x: number, y: number) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return value - Math.floor(value);
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

function fbm(x: number, y: number, octaves = 5) {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;
  let normalization = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    value += valueNoise(x * frequency, y * frequency) * amplitude;
    normalization += amplitude;
    frequency *= 2.04;
    amplitude *= 0.47;
  }

  return normalization > 0 ? value / normalization : value;
}

function ridgedNoise(x: number, y: number, octaves = 4) {
  let value = 0;
  let amplitude = 0.55;
  let frequency = 1;
  let normalization = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    const noise = valueNoise(x * frequency, y * frequency);
    value += (1 - Math.abs(noise * 2 - 1)) * amplitude;
    normalization += amplitude;
    frequency *= 2.03;
    amplitude *= 0.48;
  }

  return normalization > 0 ? value / normalization : value;
}

function smoothThreshold(value: number, low: number, high: number) {
  const t = THREE.MathUtils.clamp((value - low) / (high - low), 0, 1);
  return t * t * (3 - 2 * t);
}

function createStoneCanvases(size = 512) {
  const colorCanvas = document.createElement("canvas");
  const bumpCanvas = document.createElement("canvas");
  const roughnessCanvas = document.createElement("canvas");

  colorCanvas.width = size;
  colorCanvas.height = size;
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  roughnessCanvas.width = size;
  roughnessCanvas.height = size;

  const colorContext = colorCanvas.getContext("2d");
  const bumpContext = bumpCanvas.getContext("2d");
  const roughnessContext = roughnessCanvas.getContext("2d");

  if (!colorContext || !bumpContext || !roughnessContext) {
    return { colorCanvas, bumpCanvas, roughnessCanvas };
  }

  const colorImage = colorContext.createImageData(size, size);
  const bumpImage = bumpContext.createImageData(size, size);
  const roughnessImage = roughnessContext.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;

      const broad = fbm(u * 3.5 + 1.6, v * 3.5 + 3.8, 5);
      const medium = fbm(u * 14.5 + 7.2, v * 14.5 + 5.6, 5);
      const grit = ridgedNoise(u * 48 + 2.7, v * 48 + 8.8, 3);
      const micro = valueNoise(u * 112 + 4.3, v * 112 + 9.6);
      const mineral = fbm(u * 9.4 + 21.1, v * 9.4 - 3.7, 3);
      const pitField = fbm(u * 31 + 15.4, v * 31 + 7.1, 3);
      const pits = smoothThreshold(pitField, 0.66, 0.84);
      const brightGrain = smoothThreshold(
        valueNoise(u * 86 + 4.8, v * 86 + 12.2),
        0.76,
        0.94,
      );

      const stone =
        broad * 0.21 +
        medium * 0.34 +
        grit * 0.27 +
        micro * 0.18;

      const tone = THREE.MathUtils.clamp(
        45 + stone * 101 + mineral * 9 + brightGrain * 11 - pits * 24,
        42,
        149,
      );

      const coolShift = (medium - 0.5) * 7;
      const warmShift = (mineral - 0.5) * 5;
      const index = (y * size + x) * 4;

      colorImage.data[index] = Math.round(tone * 0.92 + warmShift);
      colorImage.data[index + 1] = Math.round(tone * 0.94 + warmShift * 0.35);
      colorImage.data[index + 2] = Math.round(tone * 0.97 + coolShift);
      colorImage.data[index + 3] = 255;

      const heightValue = THREE.MathUtils.clamp(
        72 +
          medium * 49 +
          grit * 75 +
          micro * 42 +
          brightGrain * 18 -
          pits * 68,
        22,
        238,
      );

      bumpImage.data[index] = Math.round(heightValue);
      bumpImage.data[index + 1] = Math.round(heightValue);
      bumpImage.data[index + 2] = Math.round(heightValue);
      bumpImage.data[index + 3] = 255;

      const roughnessValue = THREE.MathUtils.clamp(
        220 + medium * 17 + grit * 18 + pits * 13 - brightGrain * 24,
        182,
        252,
      );

      roughnessImage.data[index] = Math.round(roughnessValue);
      roughnessImage.data[index + 1] = Math.round(roughnessValue);
      roughnessImage.data[index + 2] = Math.round(roughnessValue);
      roughnessImage.data[index + 3] = 255;
    }
  }

  colorContext.putImageData(colorImage, 0, 0);
  bumpContext.putImageData(bumpImage, 0, 0);
  roughnessContext.putImageData(roughnessImage, 0, 0);

  return { colorCanvas, bumpCanvas, roughnessCanvas };
}

function createSlabGeometry() {
  const geometry = new THREE.BoxGeometry(
    SLAB_WIDTH,
    SLAB_HEIGHT,
    SLAB_DEPTH,
    32,
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

    const normalX = normals.getX(index);
    const normalY = normals.getY(index);
    const normalZ = normals.getZ(index);
    const normalizedX = Math.abs(x) / halfWidth;
    const normalizedY = Math.abs(y) / halfHeight;

    if (Math.abs(normalZ) > 0.8) {
      const mediumRelief =
        (valueNoise(x * 6.8 + 2.7, y * 6.8 + 9.3) - 0.5) * 0.038;
      const fineRelief =
        (valueNoise(x * 15.4 + 8.4, y * 15.4 + 3.1) - 0.5) * 0.017;
      const edgeRelief =
        Math.pow(Math.max(normalizedX, normalizedY), 5) *
        (valueNoise(x * 10.2 + 4.2, y * 10.2 + 6.7) - 0.5) *
        0.058;

      z += Math.sign(normalZ) * (mediumRelief + fineRelief + edgeRelief);
    }

    if (Math.abs(normalX) > 0.8) {
      const sideChunk =
        (valueNoise(y * 4.7 + 4.9, z * 8.8 + 2.7) - 0.5) * 0.108;
      const sideChip =
        (valueNoise(y * 13.4 + 1.3, z * 16.2 + 8.6) - 0.5) * 0.042;

      x += Math.sign(normalX) * (sideChunk + sideChip);
    }

    if (Math.abs(normalY) > 0.8) {
      const capChunk =
        (valueNoise(x * 4.5 + 7.2, z * 9.1 + 3.4) - 0.5) * 0.084;
      const capChip =
        (valueNoise(x * 13.8 + 2.1, z * 15.1 + 6.8) - 0.5) * 0.038;

      y += Math.sign(normalY) * (capChunk + capChip);
    }

    const corner = THREE.MathUtils.clamp(
      (normalizedX + normalizedY - 1.38) / 0.62,
      0,
      1,
    );

    if (corner > 0) {
      const chipNoise = valueNoise(x * 8.4 + 2.1, y * 8.4 + 6.9);
      const chip = 1 - corner * (0.045 + chipNoise * 0.068);
      x *= chip;
      y *= chip;
    }

    positions.setXYZ(index, x, y, z);
  }

  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();

  return geometry;
}

export class ServicesSlab {
  readonly root = new THREE.Group();
  readonly mesh: THREE.Mesh<THREE.BoxGeometry, THREE.MeshStandardMaterial>;

  private readonly geometry: THREE.BoxGeometry;
  private readonly material: THREE.MeshStandardMaterial;
  private readonly colorTexture: THREE.CanvasTexture;
  private readonly bumpTexture: THREE.CanvasTexture;
  private readonly roughnessTexture: THREE.CanvasTexture;

  constructor() {
    this.geometry = createSlabGeometry();

    const { colorCanvas, bumpCanvas, roughnessCanvas } = createStoneCanvases();

    this.colorTexture = new THREE.CanvasTexture(colorCanvas);
    this.colorTexture.colorSpace = THREE.SRGBColorSpace;
    this.colorTexture.wrapS = THREE.RepeatWrapping;
    this.colorTexture.wrapT = THREE.RepeatWrapping;
    this.colorTexture.repeat.set(1.06, 1.06);
    this.colorTexture.anisotropy = 4;

    this.bumpTexture = new THREE.CanvasTexture(bumpCanvas);
    this.bumpTexture.colorSpace = THREE.NoColorSpace;
    this.bumpTexture.wrapS = THREE.RepeatWrapping;
    this.bumpTexture.wrapT = THREE.RepeatWrapping;
    this.bumpTexture.repeat.copy(this.colorTexture.repeat);
    this.bumpTexture.anisotropy = 4;

    this.roughnessTexture = new THREE.CanvasTexture(roughnessCanvas);
    this.roughnessTexture.colorSpace = THREE.NoColorSpace;
    this.roughnessTexture.wrapS = THREE.RepeatWrapping;
    this.roughnessTexture.wrapT = THREE.RepeatWrapping;
    this.roughnessTexture.repeat.copy(this.colorTexture.repeat);
    this.roughnessTexture.anisotropy = 4;

    this.material = new THREE.MeshStandardMaterial({
      color: 0x929691,
      map: this.colorTexture,
      bumpMap: this.bumpTexture,
      bumpScale: 0.105,
      roughness: 0.94,
      roughnessMap: this.roughnessTexture,
      metalness: 0,
      envMapIntensity: 0.31,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.castShadow = false;
    this.mesh.receiveShadow = false;
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = 2;

    this.root.add(this.mesh);
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.colorTexture.dispose();
    this.bumpTexture.dispose();
    this.roughnessTexture.dispose();
  }
}
