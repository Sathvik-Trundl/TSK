import { z } from "zod";
import { sql } from "@forge/sql";
import crypto from "crypto";
import { procedure, router } from "../trpcServer";
import { DateTime } from "luxon";
import { getUsersByIds } from "../rest/functions";

export const changeRequest = router({
  // Get a single change request by ID
  getChangeRequest: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const statement = sql.prepare(
        "SELECT * FROM ChangeRequests WHERE id = ?"
      );
      const result = await statement.bindParams(input.id).execute();
      return result.rows[0] ?? null;
    }),

  // Get all change requests
  getAllChangeRequests: procedure.query(async () => {
    const statement = sql.prepare("SELECT * FROM ChangeRequests");
    const result = await statement.execute();
    const requests = result.rows as ChangeRequestStorage[];
    const userSet = new Set<string>();
    requests.forEach((request) => {
      userSet.add(request.requestedBy);
      request.requiredApprovals.forEach((user) => userSet.add(user));
    });
    const users = await getUsersByIds(Array.from(userSet.values()));
    const userMap = new Map(users.map((u) => [u.accountId, u]));
    return requests.map((request) => ({
      ...request,
      requestedBy: userMap.get(request.requestedBy),
      requiredApprovals: request.requiredApprovals.map((id) => userMap.get(id)),
      comments: [],
    })) as ChangeRequest[];
  }),

  // Create a new change request
  createChangeRequest: procedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        reason: z.string(),
        impact: z.string(),
        projectId: z.string(),
        requiredApprovals: z.array(z.string()),
        issueIds: z.array(z.string()),
        additionalInfo: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("input", input);
      const userId = ctx.accountId!;
      const id = crypto.randomUUID();

      try {
        const statement = sql.prepare(`
          INSERT INTO ChangeRequests (
            id, title, requestedBy, description, reason, impact,
            validationStatus, approvalStatus, phase, projectId, requiredApprovals,
            issueIds, additionalInfo, confluenceLink,createdAt, updatedAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        await statement
          .bindParams(
            id,
            input.title,
            userId,
            input.description,
            input.reason,
            input.impact,
            "In-Progress",
            "In-Progress",
            "Validation Pending",
            input.projectId,
            JSON.stringify(input.requiredApprovals),
            JSON.stringify(input.issueIds),
            input.additionalInfo ?? "",
            "",
            DateTime.now().toISO(),
            DateTime.now().toISO()
          )
          .execute();

        console.log("created change request", id);

        return { success: true, id };
      } catch (error) {
        console.error("error creating change request", error);
        throw { success: false, error };
      }
    }),
});
