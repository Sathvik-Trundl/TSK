import { adminRouter } from "./adminPage";
import { globalPageRoute } from "./globalPage";
import { projectRouter } from "./projectPage";
import { restRouter } from "./rest";
import { rovoRouter } from "./rovo";
import { router } from "./trpcServer";

export const trpcRouter = router({
  admin: adminRouter,
  project: projectRouter,
  rest: restRouter,
  globalPage: globalPageRoute,
});

export const rovoTRPCRouter = router({
  rovo: rovoRouter,
});
