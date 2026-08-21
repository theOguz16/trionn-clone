import { NextResponse } from "next/server";

import { getRockGltfBundle } from "@/lib/polyhaven/rockAsset";

export const revalidate = 60 * 60 * 24;

export async function GET() {
  try {
    const bundle = await getRockGltfBundle();

    return NextResponse.json(
      {
        assetId: bundle.assetId,
        modelUrl: "/api/polyhaven/rock/model",
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
