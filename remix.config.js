import { createRoutesFromFolders } from "@remix-run/v1-route-convention";

/** @type {import('@remix-run/dev').AppConfig} */
export default {
  appDirectory: "app",
  assetsBuildDirectory: "public/build",
  future: {},
  ignoredRouteFiles: ["**/.*"],
  publicPath: "/build/",
  routes(defineRoutes) {
    return createRoutesFromFolders(defineRoutes);
  },
  serverBuildPath: "build/index.js",
};
