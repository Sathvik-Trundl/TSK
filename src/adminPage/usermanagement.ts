import { DateTime } from "luxon";
import { kvs as storage, WhereConditions } from "@forge/kvs";
import { procedure, router } from "../trpcServer";
import { storageKeys } from "../../common/constants";
import { ListResult } from "@forge/api";

export const userManagementRouter = router({
  createUser: procedure
    .input((value) => value as UserManagementPerUser)
    .mutation(async ({ ctx, input }) => {
      const user = ctx.accountId!;
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

  getUser: procedure.query(async ({ ctx }) => {
    const user = ctx.accountId!;
    const UMGKey = storageKeys.USER_MANAGEMENT(user);
    return storage.get(UMGKey);
  }),

  getAllUsers: procedure.query(async () => {
    const query = storageKeys.USER_MANAGEMENT("");
    return storage
      .query()
      .where("key", WhereConditions.beginsWith(query))
      .getMany() as Promise<ListResult<UserManagementPerUser>>;
  }),
});
