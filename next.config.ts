import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/work",
        destination: "https://trionn.com/work",
        permanent: false,
      },
      {
        source: "/work/:slug",
        destination: "https://trionn.com/work/:slug",
        permanent: false,
      },
      {
        source: "/services",
        destination: "https://trionn.com/services",
        permanent: false,
      },
      {
        source: "/contact",
        destination: "https://trionn.com/contact",
        permanent: false,
      },
      {
        source: "/trionn-story",
        destination: "https://trionn.com/trionn-story",
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/models/trionn-test-model.optimized.glb",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/partners/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
