// src/routers/rovoRouter.ts

import { storage } from "@forge/api";
import { procedure, router } from "../trpcServer";
import { z } from "zod";
import { getProjectIssues } from "../rest/functions";

export const rovoRouter = router({
  submitTestCAB: procedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        risk: z.enum(["Low", "Medium", "High"]),
        targetDate: z.string().optional(), // ISO string (yyyy-mm-dd)
      })
    )
    .mutation(async ({ input }) => {
      const { title, description, risk, targetDate } = input;

      const requestId = `cab-${Date.now()}`;
      const cabRequest = {
        id: requestId,
        title,
        description,
        risk,
        targetDate,
        status: "Submitted",
        createdAt: new Date().toISOString(),
      };

      await storage.set(requestId, cabRequest);

      return {
        success: true,
        message: `CAB request '${title}' submitted successfully.`,
        data: cabRequest,
      };
    }),
  fetchAllIssues: procedure
    .input(z.object({ projectKey: z.string() }))
    .query(async ({ input }) => {
      console.log("fetchIssues", input);
      
      const issues = await getProjectIssues(input.projectKey);
      return { issues };
    }),
});
