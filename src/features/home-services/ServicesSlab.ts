import * as THREE from "three";

const SLAB_WIDTH = 2.42;
const SLAB_HEIGHT = 2.58;
const SLAB_DEPTH = 0.62;

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

function fbm(x: number, y: number) {
  let value = 0;
  let amplitude = 0.56;
  let frequency = 1;

  for (let octave = 0; octave < 4; octave += 1) {
    value += valueNoise(x * frequency, y * frequency) * amplitude;
    frequency *= 2.03;
    amplitude *= 0.48;
  }

  return value;
}

function createStoneCanvas(size = 384) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const context = canvas.getContext("2d");
  if (!context) return canvas;

  const image = context.createImageData(size, size);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const v = y / size;
      const broad = fbm(u * 4.6 + 1.7, v * 4.6 + 3.1);
      const medium = fbm(u * 11.5 + 9.4, v * 11.5 + 4.8);
      const fine = fbm(u * 31 + 5.2, v * 31 + 8.6);

      const softStrata =
        Math.sin(v * 31 + broad * 6.2 + medium * 2.4) * 0.5 + 0.5;
      const cloudy =
        broad * 0.62 + medium * 0.27 + fine * 0.11;

      const tone = THREE.MathUtils.clamp(
        64 + cloudy * 76 + softStrata * 7,
        62,
        151,
      );

      const coolShift = (medium - 0.5) * 8;
      const index = (y * size + x) * 4;

      image.data[index] = Math.round(tone * 0.91 + coolShift * 0.15);
      image.data[index + 1] = Math.round(tone * 0.95 + coolShift * 0.55);
      image.data[index + 2] = Math.round(tone + coolShift);
      image.data[index + 3] = 255;
    }
  }

  context.putImageData(image, 0, 0);
  return canvas;
}

function createSlabGeometry() {
  const geometry = new THREE.BoxGeometry(
    SLAB_WIDTH,
    SLAB_HEIGHT,
    SLAB_DEPTH,
    20,
    22,
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

    const surfaceNoise =
      Math.sin(x * 3.45 + y * 2.35 + z * 1.7) * 0.026 +
      Math.sin(y * 6.7 - x * 1.65) * 0.016 +
      Math.sin((x + y) * 11.2) * 0.007;

    if (Math.abs(normalZ) > 0.8) {
      const edgeLift =
        Math.pow(Math.max(normalizedX, normalizedY), 3.2) *
        Math.sin(y * 7.7 + x * 4.8) *
        0.022;

      z += Math.sign(normalZ) * (surfaceNoise + edgeLift);
    }

    if (Math.abs(normalX) > 0.8) {
      const sideBreak =
        Math.sin(y * 5.2 + z * 6.8) * 0.038 +
        Math.sin(y * 11.7 - z * 3.9) * 0.015;
      x += Math.sign(normalX) * sideBreak;
    }

    if (Math.abs(normalY) > 0.8) {
      const capBreak =
        Math.sin(x * 5.8 + z * 5.2) * 0.035 +
        Math.sin(x * 12.1 - z * 2.8) * 0.014;
      y += Math.sign(normalY) * capBreak;
    }

    const corner = THREE.MathUtils.clamp(
      (normalizedX + normalizedY - 1.5) / 0.5,
      0,
      1,
    );

    if (corner > 0) {
      const chip =
        1 - corner * (0.035 + 0.018 * Math.sin((x - y) * 8.6));
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

  constructor() {
    this.geometry = createSlabGeometry();

    const stoneCanvas = createStoneCanvas();

    this.colorTexture = new THREE.CanvasTexture(stoneCanvas);
    this.colorTexture.colorSpace = THREE.SRGBColorSpace;
    this.colorTexture.wrapS = THREE.RepeatWrapping;
    this.colorTexture.wrapT = THREE.RepeatWrapping;
    this.colorTexture.repeat.set(1.08, 1.08);

    this.bumpTexture = new THREE.CanvasTexture(stoneCanvas);
    this.bumpTexture.colorSpace = THREE.NoColorSpace;
    this.bumpTexture.wrapS = THREE.RepeatWrapping;
    this.bumpTexture.wrapT = THREE.RepeatWrapping;
    this.bumpTexture.repeat.copy(this.colorTexture.repeat);

    this.material = new THREE.MeshStandardMaterial({
      color: 0xb9bcba,
      map: this.colorTexture,
      bumpMap: this.bumpTexture,
      bumpScale: 0.052,
      roughness: 0.965,
      metalness: 0,
      envMapIntensity: 0.28,
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
  }
}
