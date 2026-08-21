import { NextResponse } from "next/server";

import { getRockGltfBundle } from "@/lib/polyhaven/rockAsset";

export const revalidate = 60 * 60 * 24;

function rewriteUri(uri: string) {
  const clean = uri.replace(/^\.\//, "");
  return `/api/polyhaven/rock/file/${clean}`;
}

export async function GET() {
  try {
    const bundle = await getRockGltfBundle();
    const response = await fetch(bundle.gltfUrl, {
      headers: {
        Accept: "model/gltf+json, application/json;q=0.9, */*;q=0.8",
        "User-Agent": "trionn-clone-services-showcase/1.0",
      },
      next: {
        revalidate,
      },
    });

    if (!response.ok) {
      throw new Error(`Rock glTF request failed with ${response.status}.`);
    }

    const gltf = (await response.json()) as {
      buffers?: Array<{ uri?: string }>;
      images?: Array<{ uri?: string }>;
    };

    gltf.buffers?.forEach((buffer) => {
      if (typeof buffer.uri !== "string" || buffer.uri.startsWith("data:")) return;
      buffer.uri = rewriteUri(buffer.uri);
    });

    gltf.images?.forEach((image) => {
      if (typeof image.uri !== "string" || image.uri.startsWith("data:")) return;
      image.uri = rewriteUri(image.uri);
    });

    return NextResponse.json(gltf, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Poly Haven rock glTF proxy failed:", error);

    return NextResponse.json(
      {
        error: "Unable to proxy the services rock model.",
      },
      {
        status: 502,
      },
    );
  }
}
