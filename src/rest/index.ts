// import { z } from "zod";
import { procedure, router } from "../trpcServer";
import {
  getAllProjects,
  getIssuesByIds,
  getProjectsByIds,
  getUsersByIds,
  queryIssues,
  queryProjects,
  queryUsers,
  getProjectByID,
} from "./functions";

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
  getUsersByIds: procedure
    .input((value) => value as string[])
    .query(async ({ input }) => {
      const allUsers = await getUsersByIds(input);
      console.log("getUsersByIds-success");
      return allUsers;
    }),
  getProjectByID: procedure
    .input((value) => value as string | number)
    .query(async ({ input }) => {
      const allUsers = await getProjectByID(input);
      console.log("getProjectByID-success");
      return allUsers;
    }),
  queryProjects: procedure
    .input((value) => value as string)
    .query(async ({ input }) => {
      const projects = await queryProjects(input);
      console.log("queryProjects-success");
      return projects;
    }),

  getProjectsById: procedure
    .input((value) => value as string[])
    .query(async ({ input }) => {
      const projects = await getProjectsByIds(input);
      return projects;
    }),
  queryIssues: procedure
    .input((input) => input as { projectId: string; query: string })
    .query(async ({ input }) => {
      const issues = await queryIssues(input.projectId, input.query);
      return issues;
    }),

  getIssuesById: procedure
    .input((ids) => ids as string[])
    .query(async ({ input }) => {
      const issues = await getIssuesByIds(input);
      return issues;
    }),
});
