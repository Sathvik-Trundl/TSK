import { z } from "zod";
import { sql } from "@forge/sql";
import crypto from "crypto";
import { procedure, router } from "../trpcServer";
import { DateTime } from "luxon";
import { getProjectsByIds, getUsersByIds } from "../rest/functions";

export const changeRequest = router({
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
      const now = DateTime.now().toISO();

      const statement = sql.prepare(`
        INSERT INTO ChangeRequests (
          id, title, requestedBy, description, reason, impact,
          validationStatus, approvalStatus, phase, projectId, requiredApprovals,
          issueIds, additionalInfo, confluenceLink, createdAt, updatedAt
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
          "Pending",
          "Pending",
          "Draft",
          input.projectId,
          JSON.stringify(input.requiredApprovals),
          JSON.stringify(input.issueIds),
          input.additionalInfo ?? "",
          "",
          now,
          now
        )
        .execute();

      return { success: true, id };
    }),

  // Read a single change request by ID
  getChangeRequest: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const statement = sql.prepare(
        "SELECT * FROM ChangeRequests WHERE id = ?"
      );
      const result = await statement.bindParams(input.id).execute();
      const request = result.rows[0] as ChangeRequestStorage | undefined;
      if (!request) return null;

      const users = await getUsersByIds([
        request.requestedBy,
        ...request.requiredApprovals,
      ]);
      const projects = await getProjectsByIds([request.projectId]);

      return {
        ...request,
        requestedBy: users.find((u) => u.accountId === request.requestedBy),
        requiredApprovals: request.requiredApprovals.map((id) =>
          users.find((u) => u.accountId === id)
        ),
        project: projects.find((p) => p.id === request.projectId),
        comments: [],
      } as ChangeRequest;
    }),

  // Read all change requests
  getAllChangeRequests: procedure.query(async () => {
    const statement = sql.prepare("SELECT * FROM ChangeRequests");
    const result = await statement.execute();
    const requests = (result.rows as ChangeRequestStorage[]) || [];

    const userIds = new Set<string>();
    const projectIds = new Set<string>();

    requests.forEach((req) => {
      userIds.add(req.requestedBy);
      req.requiredApprovals.forEach((id: string) => userIds.add(id));
      projectIds.add(req.projectId);
    });

    const users = await getUsersByIds(Array.from(userIds));
    const projects = await getProjectsByIds(Array.from(projectIds));

    const userMap = new Map(users.map((u) => [u.accountId, u]));
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    return requests.map((req) => ({
      ...req,
      requestedBy: userMap.get(req.requestedBy),
      requiredApprovals: req.requiredApprovals.map((id: string) =>
        userMap.get(id)
      ),
      project: projectMap.get(req.projectId),
      comments: [],
    })) as ChangeRequest[];
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
        validationStatus: z.string().optional(),
        approvalStatus: z.string().optional(),
        phase: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const fields = [];
      const values = [];

      for (const [key, value] of Object.entries(input)) {
        if (key !== "id" && value !== undefined) {
          fields.push(`${key} = ?`);
          values.push(
            ["requiredApprovals", "issueIds"].includes(key)
              ? JSON.stringify(value)
              : value
          );
        }
      }

      if (fields.length === 0) {
        return { success: false, message: "No fields to update." };
      }

      values.push(input.id);

      const statement = sql.prepare(`
        UPDATE ChangeRequests
        SET ${fields.join(", ")}, updatedAt = ?
        WHERE id = ?
      `);

      await statement
        .bindParams(...values, DateTime.now().toISO(), input.id)
        .execute();

      return { success: true };
    }),

  // Delete a change request
  deleteChangeRequest: procedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const statement = sql.prepare("DELETE FROM ChangeRequests WHERE id = ?");
      await statement.bindParams(input.id).execute();
      return { success: true };
    }),
});
