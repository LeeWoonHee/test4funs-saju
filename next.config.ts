import type { NextConfig } from "next";

const config: NextConfig = {
  basePath: "/saju",
  devIndicators: false,
  serverExternalPackages: ["@electric-sql/pglite", "elysia"],
};

export default config;
