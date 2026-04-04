import withSerwist from "@serwist/next";
import type { NextConfig } from "next";

const baseConfig: NextConfig = {
  allowedDevOrigins: ["dev.juntos.casa"],
};

export default process.env.NODE_ENV === "production"
  ? withSerwist({
      swSrc: "src/sw.ts",
      swDest: "public/sw.js",
    })(baseConfig)
  : baseConfig;
