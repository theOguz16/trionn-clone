import * as THREE from "three";

const SLAB_WIDTH = 2.38;
const SLAB_HEIGHT = 2.45;
const SLAB_DEPTH = 0.42;

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

  for (let octave = 0; octave < 5; octave += 1) {
    value += valueNoise(x * frequency, y * frequency) * amplitude;
    frequency *= 2.07;
    amplitude *= 0.46;
  }

  return value;
}

function createStoneCanvas(size = 512) {
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
      const broad = fbm(u * 4.2 + 1.8, v * 4.2 + 3.4);
      const medium = fbm(u * 13.5 + 8.7, v * 13.5 + 5.6);
      const fine = fbm(u * 43 + 4.2, v * 43 + 9.1);
      const grain = hash2(x * 0.71, y * 0.71) - 0.5;

      const strata =
        Math.sin(v * 27 + broad * 7.2 + medium * 3.1) * 0.5 + 0.5;
      const stone = broad * 0.54 + medium * 0.32 + fine * 0.14;

      const tone = THREE.MathUtils.clamp(
        43 + stone * 72 + strata * 6 + grain * 7,
        42,
        119,
      );

      const coolShift = (medium - 0.5) * 7;
      const index = (y * size + x) * 4;

      image.data[index] = Math.round(tone * 0.88 + coolShift * 0.1);
      image.data[index + 1] = Math.round(tone * 0.93 + coolShift * 0.45);
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
    22,
    22,
    6,
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
      Math.sin(x * 3.7 + y * 2.2 + z * 1.5) * 0.034 +
      Math.sin(y * 7.6 - x * 1.8) * 0.019 +
      Math.sin((x + y) * 14.2) * 0.009;

    if (Math.abs(normalZ) > 0.8) {
      const edgeLift =
        Math.pow(Math.max(normalizedX, normalizedY), 3) *
        Math.sin(y * 8.4 + x * 5.3) *
        0.026;

      z += Math.sign(normalZ) * (surfaceNoise + edgeLift);
    }

    if (Math.abs(normalX) > 0.8) {
      const sideBreak =
        Math.sin(y * 4.7 + z * 8.1) * 0.054 +
        Math.sin(y * 10.9 - z * 4.3) * 0.021;
      x += Math.sign(normalX) * sideBreak;
    }

    if (Math.abs(normalY) > 0.8) {
      const capBreak =
        Math.sin(x * 5.1 + z * 6.2) * 0.047 +
        Math.sin(x * 11.4 - z * 3.7) * 0.019;
      y += Math.sign(normalY) * capBreak;
    }

    const corner = THREE.MathUtils.clamp(
      (normalizedX + normalizedY - 1.44) / 0.56,
      0,
      1,
    );

    if (corner > 0) {
      const chip =
        1 - corner * (0.052 + 0.022 * Math.sin((x - y) * 8.2));
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
    this.colorTexture.repeat.set(1.12, 1.08);

    this.bumpTexture = new THREE.CanvasTexture(stoneCanvas);
    this.bumpTexture.colorSpace = THREE.NoColorSpace;
    this.bumpTexture.wrapS = THREE.RepeatWrapping;
    this.bumpTexture.wrapT = THREE.RepeatWrapping;
    this.bumpTexture.repeat.copy(this.colorTexture.repeat);

    this.material = new THREE.MeshStandardMaterial({
      color: 0x8b908f,
      map: this.colorTexture,
      bumpMap: this.bumpTexture,
      bumpScale: 0.068,
      roughness: 0.96,
      metalness: 0,
      envMapIntensity: 0.24,
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
