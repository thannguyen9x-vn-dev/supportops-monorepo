import { assetHandlers } from "./asset.handlers";
import { authHandlers } from "./auth.handlers";
import { dashboardHandlers } from "./dashboard.handlers";
import { filesHandlers } from "./files.handlers";
import { settingsHandlers } from "./settings.handlers";
import { teamHandlers } from "./team.handlers";

export const handlers = [
  ...authHandlers,
  ...teamHandlers,
  ...dashboardHandlers,
  ...assetHandlers,
  ...filesHandlers,
  ...settingsHandlers,
];
