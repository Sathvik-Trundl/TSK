import { z } from "zod";
import { sql } from "@forge/sql";
import crypto from "crypto";
import { procedure, router } from "../trpcServer";

export const sqlRouter = router({
  // Create a new change request
  createChangeRequest: procedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        reason: z.string().optional(),
        impact: z.string().optional(),
        projectId: z.string(),
        requiredApprovals: z.array(z.string()).optional(),
        issueIds: z.array(z.string()).optional(),
        additionalInfo: z.string().optional(),
        confluenceLink: z.string().optional(),
        changeWindowStart: z.string().optional(),
        changeWindowEnd: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const id = crypto.randomUUID();
      const requestedBy = ctx.accountId ?? "unknown";

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
          requestedBy,
          input.description ?? null,
          input.reason ?? null,
          input.impact ?? null,
          input.changeWindowStart ?? null,
          input.changeWindowEnd ?? null,
          "In-Progress",
          "In-Progress",
          "Validation Pending",
          input.projectId,
          input.requiredApprovals
            ? JSON.stringify(input.requiredApprovals)
            : null,
          input.issueIds ? JSON.stringify(input.issueIds) : null,
          input.additionalInfo ?? null,
          input.confluenceLink ?? null
        )
        .execute();

      return { success: true, id };
    }),

  // Retrieve a single change request by ID
  getChangeRequest: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const statement = sql.prepare(
        "SELECT * FROM ChangeRequests WHERE id = ?"
      );
      const result = await statement.bindParams(input.id).execute();
      return result.rows[0] ?? null;
    }),

  // Retrieve all change requests
  getAllChangeRequests: procedure.query(async () => {
    const statement = sql.prepare("SELECT * FROM ChangeRequests");
    const result = await statement.execute();
    return result.rows;
  }),

  // Update an existing change request
  updateChangeRequest: procedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        reason: z.string().optional(),
        impact: z.string().optional(),
        projectId: z.string().optional(),
        requiredApprovals: z.array(z.string()).optional(),
        issueIds: z.array(z.string()).optional(),
        additionalInfo: z.string().optional(),
        confluenceLink: z.string().optional(),
        changeWindowStart: z.string().optional(),
        changeWindowEnd: z.string().optional(),
        validationStatus: z.string().optional(),
        approvalStatus: z.string().optional(),
        phase: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const fields: string[] = [];
      const values: any[] = [];

      for (const [key, value] of Object.entries(input)) {
        if (key !== "id" && value !== undefined) {
          fields.push(`${key} = ?`);
          if (["requiredApprovals", "issueIds"].includes(key)) {
            values.push(JSON.stringify(value));
          } else {
            values.push(value);
          }
        }
      }

      if (fields.length === 0) {
        throw new Error("No fields provided for update.");
      }

      const statement = sql.prepare(
        `UPDATE ChangeRequests SET ${fields.join(", ")} WHERE id = ?`
      );
      await statement.bindParams(...values, input.id).execute();

      return { success: true };
    }),

  // Delete a change request by ID
  deleteChangeRequest: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const statement = sql.prepare("DELETE FROM ChangeRequests WHERE id = ?");
      await statement.bindParams(input.id).execute();

      return { success: true };
    }),
});

export type SQLRouter = typeof sqlRouter;
