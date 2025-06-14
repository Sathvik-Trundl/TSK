import { z } from "zod";
import { procedure, router } from "../trpcServer";

export const restRouter = router({
  testInput: procedure
    .input(z.object({ name: z.string() }))
    .query(async ({ input }) => {
      console.log("testInput-success", input);
      return { name: input.name };
    }),
  getAllIssues: procedure.query(async () => {}),
});

