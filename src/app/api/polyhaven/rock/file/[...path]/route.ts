import { NextResponse } from "next/server";

import {
  getRockGltfBundle,
  resolveIncludedFile,
} from "@/lib/polyhaven/rockAsset";

export const revalidate = 86400;

export async function GET(
  _request: Request,
  context: { params: Promise<{ path: string[] }> },
) {
  try {
    const { path } = await context.params;
    const requestPath = path.join("/");
    const bundle = await getRockGltfBundle();
    const included = resolveIncludedFile(bundle, requestPath);

    if (!included) {
      return NextResponse.json(
        { error: "Rock dependency not found." },
        { status: 404 },
      );
    }

    const response = await fetch(included.url, {
      headers: {
        "User-Agent": "trionn-clone-services-showcase/1.0",
      },
      next: {
        revalidate,
      },
    });

    if (!response.ok) {
      throw new Error(`Rock dependency request failed with ${response.status}.`);
    }

    const body = await response.arrayBuffer();
    const contentType =
      response.headers.get("content-type") ??
      (requestPath.endsWith(".bin")
        ? "application/octet-stream"
        : requestPath.endsWith(".jpg") || requestPath.endsWith(".jpeg")
          ? "image/jpeg"
          : requestPath.endsWith(".png")
            ? "image/png"
            : "application/octet-stream");

    return new NextResponse(body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("Poly Haven rock dependency proxy failed:", error);

    return NextResponse.json(
      { error: "Unable to proxy rock dependency." },
      { status: 502 },
    );
  }
}
