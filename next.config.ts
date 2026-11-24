import type { NextConfig } from "next";
import { SAJU_BASE_PATH } from "./lib/paths";

const config: NextConfig = {
  basePath: SAJU_BASE_PATH,
  devIndicators: false,
  serverExternalPackages: ["elysia"],
};

export default config;
