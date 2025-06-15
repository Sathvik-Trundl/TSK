import { getProjectsByIds, getUsersByIds } from "../rest/functions";
import { DateTime } from "luxon";
import { kvs as storage, WhereConditions } from "@forge/kvs";
import { procedure, router } from "../trpcServer";
import { storageKeys } from "../../common/constants";
import { ListResult } from "@forge/api";
import sql from "@forge/sql";
import { v4 } from "uuid";

// --- Helper Functions ---
async function toMeetings(meetingStorage: MeetingsStorage): Promise<Meetings> {
  const changeRequest = await getChangeRequestByID(
    meetingStorage.changeRequestId
  );
  if (!changeRequest) throw new Error("Change request not found");
  const attendees = await getUsersByIds(meetingStorage.attendees);

  return {
    ...meetingStorage,
    changeRequest,
    attendees,
  };
}

function toMeetingsStorage(meeting: Meetings): MeetingsStorage {
  return {
    id: meeting.id,
    title: meeting.title,
    changeRequestId: meeting.changeRequest.id,
    description: meeting.description,
    date: meeting.date,
    attendees: meeting.attendees.map((u) => u.accountId),
    notes: meeting.notes,
    createdAt: meeting.createdAt,
    updatedAt: meeting.updatedAt,
  };
}

async function getChangeRequestByID(id: string): Promise<ChangeRequest | null> {
  const statement = sql.prepare("SELECT * FROM ChangeRequests WHERE id = ?");
  const result = await statement.bindParams(id).execute();
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
}

export const meetingsRouter = router({
  createMeeting: procedure
    .input((value) => value as Meetings)
    .mutation(async ({ input }) => {
      const meetingId = v4();
      if (!meetingId) throw new Error("Meeting ID is required");
      const key = storageKeys.MEETING(meetingId);
      const toStore = toMeetingsStorage(input);
      toStore.createdAt = DateTime.now().toISO();
      toStore.updatedAt = DateTime.now().toISO();
      await storage.set(key, toStore);
      return { success: true, meeting: await toMeetings(toStore) };
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
      return { success: true, meeting: await toMeetings(toStore) };
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
      return toMeetings(storageMeeting);
    }),

  getAllMeetings: procedure.query(async () => {
    const prefix = storageKeys.MEETING("");
    const data: ListResult<MeetingsStorage> = await storage
      .query()
      .where("key", WhereConditions.beginsWith(prefix))
      .getMany();

    const results = data.results ?? [];
    const meetings = await Promise.all(results.map((r) => toMeetings(r.value)));
    return { results: meetings };
  }),
});
