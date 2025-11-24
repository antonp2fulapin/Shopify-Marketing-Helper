import { flatRoutes } from "remix-flat-routes";
import type { AppConfig } from "@remix-run/dev";

const config: AppConfig = {
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "esm",
  tailwind: false,
  routes: async (defineRoutes) => {
    return flatRoutes("./app/routes", defineRoutes);
  },
};

export default config;
