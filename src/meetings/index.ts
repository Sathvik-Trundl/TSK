import { mergeRouters, procedure, router } from "../trpcServer";
// import { run } from "./meeting";
export const commonRouter = router({
  run: procedure.query(async () => {
    try {
      console.log("before calling");
      // const result = await run();
      console.log("After calling");
      // return result;
      return "HI";
    } catch (error) {
      console.log("inside Catch");
      throw { error: error };
    }
  }),
});

export const meetingRouter = mergeRouters(commonRouter);
