const POLY_HAVEN_ASSET_ID = "rock_09";
const POLY_HAVEN_FILES_URL = `https://api.polyhaven.com/files/${POLY_HAVEN_ASSET_ID}`;
const CACHE_SECONDS = 60 * 60 * 24;

type JsonRecord = Record<string, unknown>;

type IncludedFile = {
  url: string;
};

export type RockGltfBundle = {
  assetId: string;
  gltfUrl: string;
  include: Record<string, IncludedFile>;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getInclude(value: unknown): Record<string, IncludedFile> {
  if (!isRecord(value)) return {};

  const include = value.include;
  if (!isRecord(include)) return {};

  const result: Record<string, IncludedFile> = {};

  Object.entries(include).forEach(([path, entry]) => {
    if (!isRecord(entry) || typeof entry.url !== "string") return;
    result[path.replace(/^\.\//, "")] = { url: entry.url };
  });

  return result;
}

function collectGltfBundles(
  value: unknown,
  path: string[] = [],
  results: Array<RockGltfBundle & { score: number }> = [],
): Array<RockGltfBundle & { score: number }> {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      collectGltfBundles(entry, [...path, String(index)], results);
    });
    return results;
  }

  if (!isRecord(value)) return results;

  if (typeof value.url === "string" && /\.gltf(?:$|\?)/i.test(value.url)) {
    const pathText = path.join("/").toLowerCase();
    const include = getInclude(value);
    let score = 0;

    if (pathText.includes("gltf")) score += 20;
    if (pathText.includes("1k")) score += 40;
    if (pathText.includes("2k")) score += 20;
    if (Object.keys(include).length > 0) score += 15;

    results.push({
      assetId: POLY_HAVEN_ASSET_ID,
      gltfUrl: value.url,
      include,
      score,
    });
  }

  Object.entries(value).forEach(([key, entry]) => {
    if (key === "url" || key === "include") return;
    collectGltfBundles(entry, [...path, key], results);
  });

  return results;
}

export async function getRockGltfBundle(): Promise<RockGltfBundle> {
  const response = await fetch(POLY_HAVEN_FILES_URL, {
    headers: {
      Accept: "application/json",
      "User-Agent": "trionn-clone-services-showcase/1.0",
    },
    next: {
      revalidate: CACHE_SECONDS,
    },
  });

  if (!response.ok) {
    throw new Error(`Poly Haven files request failed with ${response.status}.`);
  }

  const payload: unknown = await response.json();
  const bundle = collectGltfBundles(payload).sort(
    (left, right) => right.score - left.score,
  )[0];

  if (!bundle) {
    throw new Error("No usable Rock 09 glTF bundle was returned by Poly Haven.");
  }

  return {
    assetId: bundle.assetId,
    gltfUrl: bundle.gltfUrl,
    include: bundle.include,
  };
}

export function resolveIncludedFile(
  bundle: RockGltfBundle,
  requestPath: string,
): IncludedFile | null {
  const cleanPath = decodeURIComponent(requestPath).replace(/^\.\//, "");
  const direct = bundle.include[cleanPath];
  if (direct) return direct;

  const basename = cleanPath.split("/").pop();
  if (!basename) return null;

  const match = Object.entries(bundle.include).find(([path]) => {
    return path.split("/").pop() === basename;
  });

  return match?.[1] ?? null;
}
