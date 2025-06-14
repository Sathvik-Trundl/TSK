import { mergeRouters } from "../trpcServer";
import { userManagementRouter } from "./usermanagement";

export const adminRouter = mergeRouters(
  userManagementRouter
);
