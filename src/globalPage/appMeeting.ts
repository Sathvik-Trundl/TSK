import { DateTime } from "luxon";
import { kvs as storage, WhereConditions } from "@forge/kvs";
import { procedure, router } from "../trpcServer";
import { storageKeys } from "../../common/constants";
import { ListResult } from "@forge/api";
import sql from "@forge/sql";
import { v4 } from "uuid";
import { createMeeting } from "../meetings/meeting";
import { getProjectsByIds, getUsersByIds } from "../rest/functions";

// ----------------------
// Helper: Batch Change Requests with User/Project Enrichment
// ----------------------
async function getChangeRequestsByIds(ids: string[]): Promise<ChangeRequest[]> {
  if (!ids.length) return [];
  const placeholders = ids.map(() => "?").join(", ");
  const statement = sql.prepare(
    `SELECT * FROM ChangeRequests WHERE id IN (${placeholders})`
  );
  const result = await statement.bindParams(...ids).execute();
  const requests = result.rows as ChangeRequestStorage[];

  // Gather unique users/projects needed
  const userIds = new Set<string>();
  const projectIds = new Set<string>();
  requests.forEach((req) => {
    userIds.add(req.requestedBy);
    req.requiredApprovals.forEach((id) => userIds.add(id));
    projectIds.add(req.projectId);
  });

  const [users, projects] = await Promise.all([
    getUsersByIds([...userIds]),
    getProjectsByIds([...projectIds]),
  ]);

  const userMap = new Map(users.map((u) => [u.accountId, u]));
  const projectMap = new Map(projects.map((p) => [p.id, p]));

  return requests.map((request) => {
    const requestedByUser = userMap.get(request.requestedBy);
    const requiredApprovalUsers = request.requiredApprovals
      .map((id) => userMap.get(id))
      .filter((user): user is User => user !== undefined);

    if (!requestedByUser) {
      throw new Error(`User not found for requestedBy: ${request.requestedBy}`);
    }

    return {
      ...request,
      requestedBy: requestedByUser,
      requiredApprovals: requiredApprovalUsers,
      project: projectMap.get(request.projectId),
      comments: [],
    };
  });
}

// ----------------------
// Helper: Batch Meeting Conversion
// ----------------------
function toMeetingsBatch(
  meetingStorage: MeetingsStorage,
  changeRequestMap: Map<string, ChangeRequest>,
  userMap: Map<string, User>
): Meetings {
  const changeRequest = changeRequestMap.get(meetingStorage.changeRequestId);
  if (!changeRequest) {
    throw new Error(
      `Change request not found for ID: ${meetingStorage.changeRequestId}`
    );
  }
  const attendees = (meetingStorage.attendees || [])
    .map((aid: string) => userMap.get(aid))
    .filter((user): user is User => user !== undefined);

  return {
    ...meetingStorage,
    changeRequest,
    attendees,
  };
}
function toMeetingsStorage(meeting: Meetings): MeetingsStorage {
  if (!meeting.changeRequest || !meeting.changeRequest.id) {
    throw new Error(
      "Invalid input: changeRequest or changeRequest.id is missing"
    );
  }
  return {
    id: meeting.id,
    name: meeting.name,
    changeRequestId: meeting.changeRequest.id,
    description: meeting.description,
    start: {
      dateTime: meeting.startDate + "T" + meeting.startTime,
      timeZone: meeting.timeZone,
    },
    end: {
      dateTime: meeting.endDate + "T" + meeting.endTime,
      timeZone: meeting.timeZone,
    },
    startDate: meeting.startDate,
    endDate: meeting.endDate,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    attendees: meeting.attendees as unknown as string[],
    notes: meeting.notes,
    createdAt: meeting.createdAt,
    updatedAt: meeting.updatedAt,
    timeZone: meeting.timeZone,
  };
}

async function toMeetingRun(meeting: Meetings) {
  const users = await getUsersByIds(meeting.attendees as unknown as string[]);
  const attendees = users.map((u) => ({
    emailAddress: { address: u.emailAddress, name: u.displayName },
    type: "required",
  }));
  return {
    ...meeting,
    start: {
      dateTime: meeting.startDate + "T" + meeting.startTime,
      timeZone: meeting.timeZone,
    },
    end: {
      dateTime: meeting.endDate + "T" + meeting.endTime,
      timeZone: meeting.timeZone,
    },
    attendees,
    changeRequestId: meeting.changeRequest?.id || "",
  };
}

// ----------------------
// Meetings Router (batched)
// ----------------------
export const meetingsRouter = router({
  createMeeting: procedure
    .input((value) => value as Meetings)
    .mutation(async ({ input, ctx }) => {
      const meetingId = v4();
      if (!meetingId) throw new Error("Meeting ID is required");
      const key = storageKeys.MEETING(meetingId);

      try {
        const toStore = toMeetingsStorage({ ...input, id: meetingId });
        const toMeetingRunner = await toMeetingRun({ ...input, id: meetingId });
        toStore.createdAt = DateTime.now().toISO();
        toStore.updatedAt = DateTime.now().toISO();

        const getUserById = await getUsersByIds([ctx.accountId!]);

        await storage.set(key, toStore);
        await createMeeting(
          toMeetingRunner as unknown as MeetingsStorage,
          getUserById[0].emailAddress
        );

        return { success: true };
      } catch (error) {
        console.error("Failed to create meeting", error);
        throw error;
      }
    }),

  updateMeeting: procedure
    .input((value) => value as Meetings)
    .mutation(async ({ input }) => {
      const meetingId = input.id;
      if (!meetingId) throw new Error("Meeting ID is required");
      const key = storageKeys.MEETING(meetingId);
      const existing = (await storage.get(key)) as MeetingsStorage | undefined;

      if (!existing) {
        throw new Error(`Meeting not found: ${meetingId}`);
      }

      const toStore = toMeetingsStorage(input);
      toStore.createdAt = existing.createdAt ?? DateTime.now().toISO();
      toStore.updatedAt = DateTime.now().toISO();
      await storage.set(key, toStore);

      // --- Batching for return
      const [changeRequests, users] = await Promise.all([
        getChangeRequestsByIds([toStore.changeRequestId]),
        getUsersByIds((toStore.attendees || []) as string[]),
      ]);
      const changeRequestMap = new Map(changeRequests.map((cr) => [cr.id, cr]));
      const userMap = new Map(users.map((u) => [u.accountId, u]));
      const meeting = toMeetingsBatch(toStore, changeRequestMap, userMap);

      return { success: true, meeting };
    }),

  deleteMeeting: procedure
    .input((id) => id as string)
    .mutation(async ({ input: meetingId }) => {
      const key = storageKeys.MEETING(meetingId);
      const existing = await storage.get(key);
      if (!existing) throw new Error(`Meeting not found: ${meetingId}`);
      await storage.delete(key);
      return { success: true, deletedId: meetingId };
    }),

  getMeeting: procedure
    .input((id) => id as string)
    .query(async ({ input: meetingId }) => {
      const key = storageKeys.MEETING(meetingId);
      const storageMeeting = (await storage.get(key)) as
        | MeetingsStorage
        | undefined;
      if (!storageMeeting) throw new Error(`Meeting not found: ${meetingId}`);

      const [changeRequests, users] = await Promise.all([
        getChangeRequestsByIds([storageMeeting.changeRequestId]),
        getUsersByIds((storageMeeting.attendees || []) as string[]),
      ]);
      const changeRequestMap = new Map(changeRequests.map((cr) => [cr.id, cr]));
      const userMap = new Map(users.map((u) => [u.accountId, u]));
      return toMeetingsBatch(storageMeeting, changeRequestMap, userMap);
    }),

  getAllMeetings: procedure.query(async () => {
    const prefix = storageKeys.MEETING("");
    const data: ListResult<MeetingsStorage> = await storage
      .query()
      .where("key", WhereConditions.beginsWith(prefix))
      .getMany();

    const results = data.results ?? [];
    if (!results.length) return { results: [] };

    // Batched IDs
    const allChangeRequestIds = results.map((r) => r.value.changeRequestId);
    const allAttendeeIds = results.flatMap((r) => r.value.attendees || []);
    const [changeRequests, users] = await Promise.all([
      getChangeRequestsByIds([...new Set(allChangeRequestIds)]),
      getUsersByIds([...new Set(allAttendeeIds)]),
    ]);
    const changeRequestMap = new Map(changeRequests.map((cr) => [cr.id, cr]));
    const userMap = new Map(users.map((u) => [u.accountId, u]));

    const meetings = results.map((r) =>
      toMeetingsBatch(r.value, changeRequestMap, userMap)
    );
    return { results: meetings };
  }),

  getTopFiveUpcomingMeetings: procedure.query(async () => {
    const prefix = storageKeys.MEETING("");
    const data: ListResult<MeetingsStorage> = await storage
      .query()
      .where("key", WhereConditions.beginsWith(prefix))
      .getMany();

    const results = data.results ?? [];
    if (!results.length) return { results: [] };

    const allChangeRequestIds = results.map((r) => r.value.changeRequestId);
    const allAttendeeIds = results.flatMap((r) => r.value.attendees || []);
    const [changeRequests, users] = await Promise.all([
      getChangeRequestsByIds([...new Set(allChangeRequestIds)]),
      getUsersByIds([...new Set(allAttendeeIds)]),
    ]);
    const changeRequestMap = new Map(changeRequests.map((cr) => [cr.id, cr]));
    const userMap = new Map(users.map((u) => [u.accountId, u]));

    const meetings = results.map((r) =>
      toMeetingsBatch(r.value, changeRequestMap, userMap)
    );

    const now = DateTime.now();
    const upcoming = meetings
      .filter((m) => DateTime.fromISO(m.start.dateTime) > now)
      .sort(
        (a, b) =>
          DateTime.fromISO(a.start.dateTime).toMillis() -
          DateTime.fromISO(b.start.dateTime).toMillis()
      );

    return { results: upcoming.slice(0, 5) };
  }),

  getMyMeetings: procedure.query(async ({ ctx }) => {
    if (!ctx.accountId) throw new Error("User not authenticated");

    const prefix = storageKeys.MEETING("");
    const data: ListResult<MeetingsStorage> = await storage
      .query()
      .where("key", WhereConditions.beginsWith(prefix))
      .getMany();

    const results = data.results ?? [];
    if (!results.length) return { results: [] };

    const allChangeRequestIds = results.map((r) => r.value.changeRequestId);
    const allAttendeeIds = results.flatMap((r) => r.value.attendees || []);
    const [changeRequests, users] = await Promise.all([
      getChangeRequestsByIds([...new Set(allChangeRequestIds)]),
      getUsersByIds([...new Set(allAttendeeIds)]),
    ]);
    const changeRequestMap = new Map(changeRequests.map((cr) => [cr.id, cr]));
    const userMap = new Map(users.map((u) => [u.accountId, u]));

    const meetings = results.map((r) =>
      toMeetingsBatch(r.value, changeRequestMap, userMap)
    );

    // Only meetings where user is creator or attendee
    const myMeetings = meetings.filter(
      (m) =>
        m.changeRequest?.requestedBy?.accountId === ctx.accountId ||
        (Array.isArray(m.attendees) &&
          m.attendees.some((u) => u?.accountId === ctx.accountId))
    );
    return { results: myMeetings };
  }),
});
