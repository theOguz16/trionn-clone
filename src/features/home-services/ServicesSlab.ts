import * as THREE from "three";

const SLAB_WIDTH = 2.36;
const SLAB_HEIGHT = 2.44;
const SLAB_DEPTH = 0.48;

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

function ridgedNoise(x: number, y: number) {
  const noise = fbm(x, y, 4);
  return 1 - Math.abs(noise * 2 - 1);
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

      const broad = fbm(u * 4.2 + 1.8, v * 4.2 + 3.4, 5);
      const medium = fbm(u * 13.5 + 7.7, v * 13.5 + 5.1, 5);
      const fine = fbm(u * 43 + 4.2, v * 43 + 9.1, 4);
      const micro = hash2(x * 0.91 + 3.2, y * 0.91 + 7.7);
      const ridge = ridgedNoise(u * 18 + 2.8, v * 18 + 8.3);

      const fractureBand = Math.pow(
        THREE.MathUtils.clamp(
          1 - Math.abs(Math.sin((u * 1.7 + v * 1.05) * 15 + medium * 7)),
          0,
          1,
        ),
        8,
      );

      const mineral = Math.pow(
        THREE.MathUtils.clamp(fine * 0.74 + micro * 0.26, 0, 1),
        5,
      );

      const stone =
        broad * 0.43 +
        medium * 0.31 +
        fine * 0.16 +
        ridge * 0.1;

      const tone = THREE.MathUtils.clamp(
        42 + stone * 96 + mineral * 21 - fractureBand * 24,
        39,
        158,
      );

      const warmShift = (broad - 0.5) * 7 + mineral * 5;
      const coolShift = (medium - 0.5) * 8;
      const index = (y * size + x) * 4;

      colorImage.data[index] = Math.round(tone * 0.91 + warmShift);
      colorImage.data[index + 1] = Math.round(tone * 0.93 + warmShift * 0.45);
      colorImage.data[index + 2] = Math.round(tone * 0.95 + coolShift);
      colorImage.data[index + 3] = 255;

      const heightValue = THREE.MathUtils.clamp(
        77 +
          broad * 48 +
          medium * 54 +
          fine * 39 +
          ridge * 33 +
          micro * 12 -
          fractureBand * 50,
        18,
        236,
      );

      bumpImage.data[index] = Math.round(heightValue);
      bumpImage.data[index + 1] = Math.round(heightValue);
      bumpImage.data[index + 2] = Math.round(heightValue);
      bumpImage.data[index + 3] = 255;

      const roughnessValue = THREE.MathUtils.clamp(
        224 + medium * 20 + ridge * 13 - mineral * 27 + fractureBand * 10,
        176,
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
    30,
    30,
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
      const broadRelief =
        (valueNoise(x * 1.8 + 11.4, y * 1.8 + 4.2) - 0.5) * 0.105;
      const mediumRelief =
        (valueNoise(x * 5.6 + 2.4, y * 5.6 + 9.1) - 0.5) * 0.052;
      const edgeRelief =
        Math.pow(Math.max(normalizedX, normalizedY), 5) *
        (valueNoise(x * 8.2 + 5.4, y * 8.2 + 2.8) - 0.5) *
        0.075;

      z += Math.sign(normalZ) * (broadRelief + mediumRelief + edgeRelief);
    }

    if (Math.abs(normalX) > 0.8) {
      const sideChunk =
        (valueNoise(y * 4.3 + 4.9, z * 9.2 + 2.7) - 0.5) * 0.095;
      const sideChip =
        (valueNoise(y * 11.2 + 1.3, z * 14.1 + 8.6) - 0.5) * 0.037;

      x += Math.sign(normalX) * (sideChunk + sideChip);
    }

    if (Math.abs(normalY) > 0.8) {
      const capChunk =
        (valueNoise(x * 4.1 + 7.2, z * 9.6 + 3.4) - 0.5) * 0.072;
      const capChip =
        (valueNoise(x * 12.7 + 2.1, z * 13.6 + 6.8) - 0.5) * 0.03;

      y += Math.sign(normalY) * (capChunk + capChip);
    }

    const corner = THREE.MathUtils.clamp(
      (normalizedX + normalizedY - 1.42) / 0.58,
      0,
      1,
    );

    if (corner > 0) {
      const chipNoise = valueNoise(x * 7.3 + 2.1, y * 7.3 + 6.9);
      const chip = 1 - corner * (0.035 + chipNoise * 0.055);
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
    this.colorTexture.repeat.set(1.08, 1.08);
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
      color: 0xc1c0bb,
      map: this.colorTexture,
      bumpMap: this.bumpTexture,
      bumpScale: 0.13,
      roughness: 0.9,
      roughnessMap: this.roughnessTexture,
      metalness: 0,
      envMapIntensity: 0.34,
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
