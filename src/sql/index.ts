import { z } from "zod";
import { sql } from "@forge/sql";
import crypto from "crypto";
import { procedure, router } from "../trpcServer";

export const sqlRouter = router({
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
    return result.rows;
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
      const userId = ctx.accountId!;
      const id = crypto.randomUUID();
      const changeWindowStart = null;
      const changeWindowEnd = null;
      const confluenceLink = null;

      const statement = sql.prepare(`
        INSERT INTO ChangeRequests (
          id, title, requestedBy, description, reason, impact,
          changeWindowStart, changeWindowEnd, validationStatus,
          approvalStatus, phase, projectId, requiredApprovals,
          issueIds, additionalInfo, confluenceLink
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
          changeWindowStart,
          changeWindowEnd,
          "In-Progress",
          "In-Progress",
          "Validation pending",
          input.projectId,
          JSON.stringify(input.requiredApprovals),
          JSON.stringify(input.issueIds),
          input.additionalInfo ?? "",
          confluenceLink
        )
        .execute();

      return { success: true, id };
    }),
});

export type SQLRouter = typeof sqlRouter;
