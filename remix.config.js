import { createRoutesFromFolders } from "@remix-run/v1-route-convention";

/**
 * @type {import('@remix-run/dev').AppConfig}
 */
export const cacheDirectory = "./node_modules/.cache/remix";
export const ignoredRouteFiles = [
  "**/.*",
  "**/*.css",
  "**/*.test.{js,jsx,ts,tsx}",
];
export function routes(defineRoutes) {
  // uses the v1 convention, works in v1.15+ and v2
  return createRoutesFromFolders(defineRoutes);
}
