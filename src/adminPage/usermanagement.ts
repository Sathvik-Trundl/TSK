import { getProjectByID, getUsersByIds } from "./../rest/functions";
import { DateTime } from "luxon";
import { kvs as storage, WhereConditions } from "@forge/kvs";
import { procedure, router } from "../trpcServer";
import { storageKeys } from "../../common/constants";
import { ListResult } from "@forge/api";
import { now } from "d3";

export const userManagementRouter = router({
  createUser: procedure
    .input((value) => value as UserManagementPerUser)
    .mutation(async ({ input }) => {
      const user = input.id!;
      const { projectRoles } = input;

      console.log({ user, projectRoles, input });
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
        else projectMap.set(pid, pid); // fallback
      })
    );

    const final = entries.map(({ value }) => {
      const typedValue = value as UserManagementPerUser;

      const user = userMap.get(typedValue.id);
      const projectRolesResolved: any = {};

      Object.entries(typedValue.projectRoles).forEach(([pid, role]) => {
        const pname = projectMap.get(pid) || pid;
        projectRolesResolved[pname] = role;
      });

      return {
        id: typedValue.id,
        userLabel: user?.displayName || typedValue.id,
        avatarUrl: user?.avatarUrls?.["24x24"],
        projectRoles: projectRolesResolved,
        createdAt: typedValue.createdAt,
        updatedAt: typedValue.updatedAt,
      };
    });

    return { results: final };
  }),
});
