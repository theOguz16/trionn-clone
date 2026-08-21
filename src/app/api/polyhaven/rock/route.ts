import { NextResponse } from "next/server";

const POLY_HAVEN_ASSET_ID = "rock_09";
const POLY_HAVEN_FILES_URL = `https://api.polyhaven.com/files/${POLY_HAVEN_ASSET_ID}`;

type JsonRecord = Record<string, unknown>;

type Candidate = {
  url: string;
  score: number;
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectCandidates(
  value: unknown,
  path: string[] = [],
  candidates: Candidate[] = [],
): Candidate[] {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      collectCandidates(entry, [...path, String(index)], candidates);
    });

    return candidates;
  }

  if (!isRecord(value)) {
    return candidates;
  }

  const url = value.url;

  if (typeof url === "string" && /\.(?:gltf|glb)(?:$|\?)/i.test(url)) {
    const pathText = path.join("/").toLowerCase();
    let score = 0;

    if (pathText.includes("gltf")) score += 10;
    if (pathText.includes("1k")) score += 20;
    if (pathText.includes("2k")) score += 10;
    if (/\.glb(?:$|\?)/i.test(url)) score += 4;

    candidates.push({ url, score });
  }

  Object.entries(value).forEach(([key, entry]) => {
    if (key === "url") return;
    collectCandidates(entry, [...path, key], candidates);
  });

  return candidates;
}

export const revalidate = 60 * 60 * 24;

export async function GET() {
  try {
    const response = await fetch(POLY_HAVEN_FILES_URL, {
      headers: {
        Accept: "application/json",
        "User-Agent": "trionn-clone-services-showcase/1.0",
      },
      next: {
        revalidate,
      },
    });

    if (!response.ok) {
      throw new Error(`Poly Haven files request failed with ${response.status}.`);
    }

    const payload: unknown = await response.json();
    const candidates = collectCandidates(payload).sort(
      (left, right) => right.score - left.score,
    );
    const best = candidates[0];

    if (!best) {
      throw new Error("No glTF-compatible Rock 09 file was returned by Poly Haven.");
    }

    return NextResponse.json(
      {
        assetId: POLY_HAVEN_ASSET_ID,
        modelUrl: best.url,
        source: "Poly Haven",
        license: "CC0",
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (error) {
    console.error("Poly Haven rock resolver failed:", error);

    return NextResponse.json(
      {
        error: "Unable to resolve the services rock model.",
      },
      {
        status: 502,
      },
    );
  }
}
