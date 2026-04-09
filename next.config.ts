import path from "path";
import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  outputFileTracingIncludes: {
    // Payload serves the checked-in media collection from the local filesystem.
    // Vercel needs these files explicitly traced into the server bundle.
    "**/*": ["./media/**/*"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@payload-config": path.resolve(process.cwd(), "src/payload.config.ts"),
    };

    return config;
  },
};

export default withPayload(nextConfig);
