import withSerwist from "@serwist/next";
import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  allowedDevOrigins: ["dev.juntos.casa"],
  async redirects() {
    return [
      {
        // Override the default Next.js favicon.ico so browsers get our custom icon
        source: "/favicon.ico",
        destination: "/icon",
        permanent: false,
      },
    ];
  },
};

// Only wrap with Serwist in production — it injects webpack config which
// conflicts with Turbopack used by `next dev`.
export default process.env.NODE_ENV === "production"
  ? withSerwist({
      swSrc: "src/sw.ts",
      swDest: "public/sw.js",
    })(baseConfig)
  : baseConfig;
