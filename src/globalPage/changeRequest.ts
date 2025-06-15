import { z } from "zod";
import { sql } from "@forge/sql";
import crypto from "crypto";
import { procedure, router } from "../trpcServer";
import { DateTime } from "luxon";
import { getProjectsByIds, getUsersByIds } from "../rest/functions";
import { storageKeys } from "../../common/constants";
import { storage } from "@forge/api";

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
      try {
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
            "Pending", // validation status
            "Pending", // approval status
            "Validation Pending", // phase
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
      } catch (error) {
        console.log({ error });
      }
    }),

  // Read a single change request by ID
  getChangeRequest: procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const statement = sql.prepare(
        "SELECT * FROM ChangeRequests WHERE id = ?"
      );
      const result = await statement.bindParams(input.id).execute();
      const request: any = result.rows[0] as ChangeRequestStorage | undefined;
      if (!request) return null;

      const parsedComments: any = JSON.parse(request?.comments || "[]");
      const commentUserIds = parsedComments.map((c: any) => c.user);

      const users = await getUsersByIds([
        request.requestedBy,
        ...request.requiredApprovals,
        ...commentUserIds,
      ]);
      const projects = await getProjectsByIds([request.projectId]);

      const userMap = new Map(users.map((u) => [u.accountId, u]));

      return {
        ...request,
        requestedBy: userMap.get(request.requestedBy),
        requiredApprovals: request.requiredApprovals.map((id: any) =>
          userMap.get(id)
        ),
        project: projects.find((p) => p.id === request.projectId),
        comments: parsedComments.map((c: any) => ({
          ...c,
          user: userMap.get(c.user),
        })),
      } as ChangeRequest;
    }),

  // Read all change requests
  getAllChangeRequests: procedure.query(async ({ ctx }) => {
    const statement = sql.prepare("SELECT * FROM ChangeRequests");
    const result = await statement.execute();
    const requests = (result.rows as ChangeRequestStorage[]) || [];

    const userIds = new Set<string>();
    const projectIds = new Set<string>();

    const user = ctx.accountId!;
    const UMGKey = storageKeys.USER_MANAGEMENT(user);
    const check = await storage.get(UMGKey);

    requests.forEach((req: any) => {
      userIds.add(req.requestedBy);
      req.requiredApprovals.forEach((id: string) => userIds.add(id));
      projectIds.add(req.projectId);

      const commentUsers =
        req.comments && Array.isArray(JSON.parse(req.comments))
          ? JSON.parse(req.comments).map((c: any) => c.user)
          : [];
      commentUsers.forEach((id: string) => userIds.add(id));
    });

    const users = await getUsersByIds(Array.from(userIds));
    const projects = await getProjectsByIds(Array.from(projectIds));

    const userMap = new Map(users.map((u) => [u.accountId, u]));
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    return requests.map((req: any) => {
      const isApprover =
        check?.projectRoles?.[req.projectId] === "Approver" ||
        check?.projectRoles?.[req.projectId] === "Admin";

      return {
        ...req,
        requestedBy: userMap.get(req.requestedBy),
        requiredApprovals: req.requiredApprovals.map((id: string) =>
          userMap.get(id)
        ),
        isApprover,
        project: projectMap.get(req.projectId),
        comments: (req.comments ? JSON.parse(req.comments) : []).map(
          (c: any) => ({
            ...c,
            user: userMap.get(c.user),
          })
        ),
      };
    }) as ChangeRequest[];
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

  approveChangeRequest: procedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const statement = sql.prepare(`
      UPDATE ChangeRequests
      SET approvalStatus = ?, phase = ?, updatedAt = ?
      WHERE id = ?
    `);

      await statement
        .bindParams("Approved", "Approved", DateTime.now().toISO(), input)
        .execute();

      return { success: true };
    }),

  rejectChangeRequest: procedure
    .input(z.string())
    .mutation(async ({ input }) => {
      const statement = sql.prepare(`
      UPDATE ChangeRequests
      SET approvalStatus = ?, phase = ?, updatedAt = ?
      WHERE id = ?
    `);

      await statement
        .bindParams("Rejected", "Rejected", DateTime.now().toISO(), input)
        .execute();

      return { success: true };
    }),

  addCommentToRequest: procedure
    .input(
      z.object({
        requestId: z.string(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const userId = ctx.accountId!;
        const now = DateTime.now().toISO();

        // Fetch current comments
        const fetchStmt = sql.prepare(
          `SELECT comments FROM ChangeRequests WHERE id = ?`
        );
        const result: any = await fetchStmt
          .bindParams(input.requestId)
          .execute();
        const currentComments = result.rows[0]?.comments || "[]";

        const updatedComments = JSON.stringify([
          ...JSON.parse(currentComments),
          {
            user: userId,
            comment: input.comment,
            createdAt: now,
          },
        ]);

        const updateStmt = sql.prepare(
          `UPDATE ChangeRequests SET comments = ?, updatedAt = ? WHERE id = ?`
        );
        await updateStmt
          .bindParams(updatedComments, now, input.requestId)
          .execute();

        return { success: true };
      } catch (error) {
        console.error("Failed to add comment", error);
        return { success: false, error: "Failed to add comment" };
      }
    }),

  changePhase: procedure
    .input(
      z.object({
        id: z.string(),
        phase: z.string(), // Accepts any string for flexibility
      })
    )
    .mutation(async ({ input }) => {
      try {
        const now = DateTime.now().toISO();

        console.log({ now, input });
        const statement = sql.prepare(`
        UPDATE ChangeRequests
        SET phase = ?, updatedAt = ?
        WHERE id = ?
      `);

        await statement.bindParams(input.phase, now, input.id).execute();

        return { success: true };
      } catch (error) {
        console.error("Failed to change phase:", error);
        return { success: false, error: "Failed to change phase" };
      }
    }),
});
