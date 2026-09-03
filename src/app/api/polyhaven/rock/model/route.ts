import { NextResponse } from "next/server";

import { getRockGltfBundle } from "@/lib/polyhaven/rockAsset";

export const revalidate = 86400;

function rewriteUri(uri: string) {
  const clean = uri.replace(/^\.\//, "");

  /*
   * GLTFLoader resolves non-http dependency URLs against the model's base
   * path. The model lives at /api/polyhaven/rock/model, whose base path is
   * /api/polyhaven/rock/. Returning an app-root path here caused Three's
   * LoaderUtils to concatenate both paths and request
   * /api/polyhaven/rock/api/polyhaven/rock/file/....
   *
   * Keep dependencies relative to the model endpoint so they resolve to the
   * intended /api/polyhaven/rock/file/... route.
   */
  return `file/${clean}`;
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
