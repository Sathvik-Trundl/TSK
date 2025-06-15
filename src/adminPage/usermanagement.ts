import { getProjectByID, getUsersByIds } from "./../rest/functions";
import { DateTime } from "luxon";
import { kvs as storage, WhereConditions } from "@forge/kvs";
import { procedure, router } from "../trpcServer";
import { storageKeys } from "../../common/constants";
import { ListResult } from "@forge/api";
import api, { route } from "@forge/api";
import { now } from "d3";

export const userManagementRouter = router({
  createUser: procedure
    .input((value) => value as UserManagementPerUser)
    .mutation(async ({ input }) => {
      const user = input.id!;
      const { projectRoles } = input;

      const UMGKey = storageKeys.USER_MANAGEMENT(user);
      const result = await storage.set(UMGKey, {
        id: user,
        projectRoles,
        createdAt: DateTime.now().toISO(),
        updatedAt: DateTime.now().toISO(),
      });
      return result;
    }),

  updateUser: procedure
    .input((value) => value as UserManagementPerUser)
    .mutation(async ({ input }) => {
      const userId = input.id;
      const { projectRoles } = input;

      if (!userId || typeof userId !== "string") {
        throw new Error("Invalid or missing user ID.");
      }

      if (
        !projectRoles ||
        typeof projectRoles !== "object" ||
        Array.isArray(projectRoles)
      ) {
        throw new Error("Invalid projectRoles format.");
      }

      const UMGKey = storageKeys.USER_MANAGEMENT(userId);
      const currentUserData = await storage.get(UMGKey);

      if (!currentUserData) {
        throw new Error(`No existing data found for user ID: ${userId}`);
      }

      const result = await storage.set(UMGKey, {
        id: userId,
        projectRoles,
        createdAt: (currentUserData as UserManagementPerUser)?.createdAt || now,
        updatedAt: DateTime.now().toISO(),
      });

      return result;
    }),

  deleteUser: procedure
    .input((id) => id as string)
    .mutation(async ({ input: userId }) => {
      if (!userId || typeof userId !== "string") {
        throw new Error("Invalid user ID.");
      }

      const UMGKey = storageKeys.USER_MANAGEMENT(userId);
      const existing = storage.get(UMGKey);

      if (existing === undefined) {
        throw new Error(`User with ID "${userId}" does not exist.`);
      }

      await storage.delete(UMGKey);
      return { success: true, deletedId: userId };
    }),

  getUser: procedure.query(async ({ ctx }) => {
    const user = ctx.accountId!;
    const UMGKey = storageKeys.USER_MANAGEMENT(user);
    return storage.get(UMGKey);
  }),

  getAllUsers: procedure.query(async () => {
    const query = storageKeys.USER_MANAGEMENT("");
    const data: ListResult<UserManagementPerUser> = await storage
      .query()
      .where("key", WhereConditions.beginsWith(query))
      .getMany();

    const entries = data.results ?? [];
    const userIds = entries.map((entry) => entry.value.id);
    const users = await getUsersByIds(userIds);

    const userMap = new Map(users.map((u) => [u.accountId, u]));
    const allProjectIds = new Set<string>();

    entries.forEach((entry) => {
      Object.keys(entry.value.projectRoles).forEach((projectId) =>
        allProjectIds.add(projectId)
      );
    });

    const projectMap = new Map<string, string>();

    await Promise.all(
      Array.from(allProjectIds).map(async (pid) => {
        const project = await getProjectByID(pid);
        if (project) projectMap.set(pid, project.name);
        else projectMap.set(pid, pid); // fallback to ID if name not found
      })
    );

    const final = entries.map(({ value }) => {
      const typedValue = value as UserManagementPerUser;

      const user = userMap.get(typedValue.id);

      const projectRolesByName: any = {};
      Object.entries(typedValue.projectRoles).forEach(([pid, role]) => {
        const pname = projectMap.get(pid) || pid;
        projectRolesByName[pname] = role;
      });

      return {
        id: typedValue.id,
        userLabel: user?.displayName || typedValue.id,
        avatarUrl: user?.avatarUrls?.["24x24"],
        projectRoles: typedValue.projectRoles, // e.g. { '10013': 'Approver' }
        projectRolesDisplay: projectRolesByName, // e.g. { 'Finance App': 'Approver' }
        createdAt: typedValue.createdAt,
        updatedAt: typedValue.updatedAt,
      };
    });

    return { results: final };
  }),

  createConfluencePage: procedure
    .input(
      (value) => value as { spaceKey: string; title: string; content: string }
    )
    .mutation(async ({ input }) => {
      try {
        const { spaceKey, title, content } = input;
        const res = await api
          .asApp()
          .requestConfluence(route`/wiki/api/v2/spaces`);
        console.log(await res.json());

        const response = await api
          .asApp()
          .requestConfluence(route`/wiki/api/v2/pages`, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "page",
              title,
              space: { key: spaceKey },
              body: {
                storage: {
                  value: content,
                  representation: "storage",
                },
              },
            }),
          });

        const data = await response.json();

        if (!response.ok) {
          console.error("Confluence aaa page creation failed:", data);
          throw new Error("Failed to create Confluence page.");
        }

        console.log("Confluence page created successfully:", data);
        return data;
      } catch (err) {
        console.error("createConfluencePage error:", err);
        throw new Error("Error creating Confluence page.");
      }
    }),
});
