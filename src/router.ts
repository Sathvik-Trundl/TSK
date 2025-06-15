import { router } from "./trpcServer";
import { adminRouter } from "./adminPage";
import { globalPageRoute } from "./globalPage";
import { projectRouter } from "./projectPage";
import { restRouter } from "./rest";
import { sqlRouter } from "./sql";
import { meetingRouter } from "./meetings";

export const trpcRouter = router({
  admin: adminRouter,
  project: projectRouter,
  rest: restRouter,
  globalPage: globalPageRoute,
  sql: sqlRouter,
  meetings: meetingRouter,
});
