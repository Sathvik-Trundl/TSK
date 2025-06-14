// import { storage } from "@forge/api";
import { mergeRouters, procedure, router } from "../trpcServer";
export const commonRouter = router({
  projectHello: procedure.query(async () => {
    return "projectHello";
  }),
});

export const projectRouter = mergeRouters(commonRouter);
