// import { z } from "zod";
import { procedure, router } from "../trpcServer";
import { getAllProjects, queryUsers } from "./functions";

export const restRouter = router({
  getAllProjects: procedure.query(async () => {
    const allProjects = await getAllProjects();
    console.log("getAllProjects-success");
    return allProjects;
  }),
  queryUsers: procedure
    .input((value) => value as string)
    .query(async ({ input }) => {
      const allUsers = await queryUsers(input);
      console.log("queryUsers-success");
      return allUsers;
    }),
});
