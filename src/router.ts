import { adminRouter } from "./adminPage";
import { globalPageRoute } from "./globalPage";
import { projectRouter } from "./projectPage";
import { restRouter } from "./rest";
import { router } from "./trpcServer";

export const trpcRouter = router({
  admin: adminRouter,
  project: projectRouter,
  rest: restRouter,
  globalPage: globalPageRoute,
});
