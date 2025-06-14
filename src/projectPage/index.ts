import { mergeRouters, procedure, router } from "../trpcServer";

export const commonRouter = router({
  projectHello: procedure.query(async ({ ctx }) => {
    console.log(ctx);

    return "projectHello";
  }),
});

export const projectRouter = mergeRouters(commonRouter);
