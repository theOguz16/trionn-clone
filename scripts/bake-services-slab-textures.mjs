import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const projectRoot = process.cwd();
const sourceRoot = process.argv[2] ?? "/tmp";
const outputRoot = path.join(
  projectRoot,
  "public/textures/services-slab",
);

async function resolveSharp() {
  const pnpmRoot = path.join(projectRoot, "node_modules/.pnpm");
  const packages = await fs.readdir(pnpmRoot);
  const sharpPackage = packages.find((entry) => entry.startsWith("sharp@"));

  if (!sharpPackage) {
    throw new Error("Sharp is required to bake the Services slab textures.");
  }

  const modulePath = path.join(
    pnpmRoot,
    sharpPackage,
    "node_modules/sharp/dist/index.mjs",
  );

  return (await import(pathToFileURL(modulePath).href)).default;
}

function readAccessor(gltf, binary, accessorIndex) {
  const accessor = gltf.accessors[accessorIndex];
  const view = gltf.bufferViews[accessor.bufferView];
  const offset = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const countByType = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
  const width = countByType[accessor.type];
  const length = accessor.count * width;

  if (accessor.componentType === 5126) {
    return new Float32Array(
      binary.buffer,
      binary.byteOffset + offset,
      length,
    );
  }

  if (accessor.componentType === 5123) {
    return new Uint16Array(
      binary.buffer,
      binary.byteOffset + offset,
      length,
    );
  }

  throw new Error(`Unsupported component type: ${accessor.componentType}`);
}

function edge(ax, ay, bx, by, px, py) {
  return (px - ax) * (by - ay) - (py - ay) * (bx - ax);
}

function sampleBilinear(source, width, height, u, v, output, outputIndex) {
  const x = Math.max(0, Math.min(width - 1, u * (width - 1)));
  // glTF UVs use the upper-left image origin; GLTFLoader likewise keeps
  // source textures unflipped.
  const y = Math.max(0, Math.min(height - 1, v * (height - 1)));
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(width - 1, x0 + 1);
  const y1 = Math.min(height - 1, y0 + 1);
  const tx = x - x0;
  const ty = y - y0;

  for (let channel = 0; channel < 3; channel += 1) {
    const top =
      source[(y0 * width + x0) * 3 + channel] * (1 - tx) +
      source[(y0 * width + x1) * 3 + channel] * tx;
    const bottom =
      source[(y1 * width + x0) * 3 + channel] * (1 - tx) +
      source[(y1 * width + x1) * 3 + channel] * tx;

    output[outputIndex + channel] = Math.round(top * (1 - ty) + bottom * ty);
  }
}

function fillProjectionGaps(buffers, mask, size) {
  const queue = new Int32Array(mask.length);
  let head = 0;
  let tail = 0;

  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    if (mask[pixel]) queue[tail++] = pixel;
  }

  while (head < tail) {
    const sourcePixel = queue[head++];
    const x = sourcePixel % size;
    const neighbours = [];
    if (x > 0) neighbours.push(sourcePixel - 1);
    if (x < size - 1) neighbours.push(sourcePixel + 1);
    if (sourcePixel >= size) neighbours.push(sourcePixel - size);
    if (sourcePixel < mask.length - size) neighbours.push(sourcePixel + size);

    for (const pixel of neighbours) {
      if (mask[pixel]) continue;

      for (const buffer of buffers) {
        const target = pixel * buffer.channels;
        const source = sourcePixel * buffer.channels;
        for (let channel = 0; channel < buffer.channels; channel += 1) {
          buffer.data[target + channel] = buffer.data[source + channel];
        }
      }

      mask[pixel] = 1;
      queue[tail++] = pixel;
    }
  }
}

function makeNormalMap(height, size, strength) {
  const normal = Buffer.alloc(size * size * 3);

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const left = height[y * size + Math.max(0, x - 1)] / 255;
      const right = height[y * size + Math.min(size - 1, x + 1)] / 255;
      const up = height[Math.max(0, y - 1) * size + x] / 255;
      const down = height[Math.min(size - 1, y + 1) * size + x] / 255;
      let nx = (left - right) * strength;
      let ny = (down - up) * strength;
      let nz = 1;
      const length = Math.hypot(nx, ny, nz) || 1;
      nx /= length;
      ny /= length;
      nz /= length;
      const index = (y * size + x) * 3;
      normal[index] = Math.round((nx * 0.5 + 0.5) * 255);
      normal[index + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      normal[index + 2] = Math.round((nz * 0.5 + 0.5) * 255);
    }
  }

  return normal;
}

async function main() {
  const sharp = await resolveSharp();
  const gltf = JSON.parse(
    await fs.readFile(path.join(sourceRoot, "rock_face_01_2k.gltf"), "utf8"),
  );
  const binaryFile = await fs.readFile(path.join(sourceRoot, "rock_face_01.bin"));
  const primitive = gltf.meshes[0].primitives[0];
  const positions = readAccessor(gltf, binaryFile, primitive.attributes.POSITION);
  const sourceNormals = readAccessor(gltf, binaryFile, primitive.attributes.NORMAL);
  const uvs = readAccessor(gltf, binaryFile, primitive.attributes.TEXCOORD_0);
  const indices = readAccessor(gltf, binaryFile, primitive.indices);

  const diffuseImage = sharp(path.join(sourceRoot, "rock_face_01_diff_2k.jpg"));
  const armImage = sharp(path.join(sourceRoot, "rock_face_01_arm_2k.jpg"));
  const normalImage = sharp(path.join(sourceRoot, "rock_face_01_nor_gl_2k.jpg"));
  const [{ data: diffuse, info }, { data: arm }, { data: sourceNormal }] = await Promise.all([
    diffuseImage.removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    armImage.removeAlpha().raw().toBuffer({ resolveWithObject: true }),
    normalImage.removeAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);

  const size = 2048;
  const albedo = Buffer.alloc(size * size * 3);
  const packedArm = Buffer.alloc(size * size * 3);
  const projectedNormal = Buffer.alloc(size * size * 3);
  const height = Buffer.alloc(size * size);
  const mask = new Uint8Array(size * size);
  const depth = new Float32Array(size * size);
  depth.fill(Number.NEGATIVE_INFINITY);

  const minX = gltf.accessors[primitive.attributes.POSITION].min[0];
  const maxX = gltf.accessors[primitive.attributes.POSITION].max[0];
  const minY = gltf.accessors[primitive.attributes.POSITION].min[1];
  const maxY = gltf.accessors[primitive.attributes.POSITION].max[1];
  const minZ = gltf.accessors[primitive.attributes.POSITION].min[2];
  const maxZ = gltf.accessors[primitive.attributes.POSITION].max[2];
  const slabAspect = 2.34 / 2.46;
  const cropWidth = (maxY - minY) * slabAspect;
  const centerX = (minX + maxX) * 0.5;
  const cropMinX = centerX - cropWidth * 0.5;
  const cropMaxX = centerX + cropWidth * 0.5;

  for (let triangle = 0; triangle < indices.length; triangle += 3) {
    const ia = indices[triangle];
    const ib = indices[triangle + 1];
    const ic = indices[triangle + 2];
    const facing =
      (sourceNormals[ia * 3 + 2] +
        sourceNormals[ib * 3 + 2] +
        sourceNormals[ic * 3 + 2]) /
      3;

    // Ignore the vertical rim/back triangles. Projecting those across the
    // rectangular target creates the familiar stretched-atlas streaks.
    if (facing < 0.18) continue;
    const vertices = [ia, ib, ic].map((index) => ({
      x: ((positions[index * 3] - cropMinX) / (cropMaxX - cropMinX)) * (size - 1),
      y: (1 - (positions[index * 3 + 1] - minY) / (maxY - minY)) * (size - 1),
      depth: positions[index * 3 + 2],
      u: uvs[index * 2],
      v: uvs[index * 2 + 1],
    }));
    const [a, b, c] = vertices;
    const uvSpanU = Math.max(a.u, b.u, c.u) - Math.min(a.u, b.u, c.u);
    const uvSpanV = Math.max(a.v, b.v, c.v) - Math.min(a.v, b.v, c.v);
    if (uvSpanU > 0.22 || uvSpanV > 0.22) continue;
    const area = edge(a.x, a.y, b.x, b.y, c.x, c.y);
    if (Math.abs(area) < 0.0001) continue;
    const left = Math.max(0, Math.floor(Math.min(a.x, b.x, c.x)));
    const right = Math.min(size - 1, Math.ceil(Math.max(a.x, b.x, c.x)));
    const top = Math.max(0, Math.floor(Math.min(a.y, b.y, c.y)));
    const bottom = Math.min(size - 1, Math.ceil(Math.max(a.y, b.y, c.y)));

    for (let y = top; y <= bottom; y += 1) {
      for (let x = left; x <= right; x += 1) {
        const px = x + 0.5;
        const py = y + 0.5;
        const wa = edge(b.x, b.y, c.x, c.y, px, py) / area;
        const wb = edge(c.x, c.y, a.x, a.y, px, py) / area;
        const wc = 1 - wa - wb;
        if (wa < -0.0001 || wb < -0.0001 || wc < -0.0001) continue;
        const projectedDepth = wa * a.depth + wb * b.depth + wc * c.depth;
        const pixel = y * size + x;
        if (projectedDepth <= depth[pixel]) continue;
        depth[pixel] = projectedDepth;
        mask[pixel] = 1;
        height[pixel] = Math.round(
          Math.max(0, Math.min(1, (projectedDepth - minZ) / (maxZ - minZ))) * 255,
        );
        const u = wa * a.u + wb * b.u + wc * c.u;
        const v = wa * a.v + wb * b.v + wc * c.v;
        sampleBilinear(diffuse, info.width, info.height, u, v, albedo, pixel * 3);
        sampleBilinear(arm, info.width, info.height, u, v, packedArm, pixel * 3);
        sampleBilinear(
          sourceNormal,
          info.width,
          info.height,
          u,
          v,
          projectedNormal,
          pixel * 3,
        );
      }
    }
  }

  fillProjectionGaps(
    [
      { data: albedo, channels: 3 },
      { data: packedArm, channels: 3 },
      { data: projectedNormal, channels: 3 },
      { data: height, channels: 1 },
    ],
    mask,
    size,
  );

  const depthNormal = makeNormalMap(height, size, 7.5);
  const normal = Buffer.alloc(size * size * 3);

  for (let pixel = 0; pixel < size * size; pixel += 1) {
    const color = pixel * 3;
    const luminance =
      albedo[color] * 0.2126 +
      albedo[color + 1] * 0.7152 +
      albedo[color + 2] * 0.0722;
    const tone = Math.max(42, Math.min(164, 32 + luminance * 0.58));
    albedo[color] = Math.round(tone * 0.94);
    albedo[color + 1] = Math.round(tone * 0.97);
    albedo[color + 2] = Math.round(tone);

    const sourceX = projectedNormal[color] / 255 * 2 - 1;
    const sourceY = projectedNormal[color + 1] / 255 * 2 - 1;
    const depthX = depthNormal[color] / 255 * 2 - 1;
    const depthY = depthNormal[color + 1] / 255 * 2 - 1;
    let nx = sourceX * 0.62 + depthX * 0.38;
    let ny = sourceY * 0.62 + depthY * 0.38;
    let nz = 1;
    const length = Math.hypot(nx, ny, nz) || 1;
    nx /= length;
    ny /= length;
    nz /= length;
    normal[color] = Math.round((nx * 0.5 + 0.5) * 255);
    normal[color + 1] = Math.round((ny * 0.5 + 0.5) * 255);
    normal[color + 2] = Math.round((nz * 0.5 + 0.5) * 255);
  }
  await fs.mkdir(outputRoot, { recursive: true });

  const desktop = [
    ["albedo.webp", albedo, 3, { quality: 78 }],
    ["normal.webp", normal, 3, { quality: 76 }],
    ["arm.webp", packedArm, 3, { quality: 74 }],
    ["height.webp", height, 1, { quality: 72 }],
  ];

  await Promise.all(
    desktop.map(([name, data, channels, options]) =>
      sharp(data, { raw: { width: size, height: size, channels } })
        .webp(options)
        .toFile(path.join(outputRoot, `desktop-${name}`)),
    ),
  );

  await Promise.all(
    desktop.map(([name, data, channels, options]) =>
      sharp(data, { raw: { width: size, height: size, channels } })
        .resize(1024, 1024, { kernel: "lanczos3" })
        .webp({ ...options, quality: Math.max(62, options.quality - 7) })
        .toFile(path.join(outputRoot, `mobile-${name}`)),
    ),
  );
}

await main();
