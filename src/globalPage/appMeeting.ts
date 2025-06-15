import { getProjectsByIds, getUsersByIds } from "../rest/functions";
import { DateTime } from "luxon";
import { kvs as storage, WhereConditions } from "@forge/kvs";
import { procedure, router } from "../trpcServer";
import { storageKeys } from "../../common/constants";
import { ListResult } from "@forge/api";
import sql from "@forge/sql";
import { v4 } from "uuid";
import { createMeeting } from "../meetings/meeting";

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
      dateTime: meeting.startDate + "T" + meeting.endTime,
      timeZone: meeting.timeZone,
    },
    startDate: meeting.startDate,
    endDate: meeting.endDate,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
    attendees: meeting.attendees.map((u) => u.accountId),
    notes: meeting.notes,
    createdAt: meeting.createdAt,
    updatedAt: meeting.updatedAt,
    timeZone: meeting.timeZone,
  };
}

async function toMeetingRun(meeting: Meetings) {
  const users = await getUsersByIds(meeting.attendees as unknown as string[]);
  const attendees = users.map((u) => {
    return {
      emailAddress: {
        address: u.emailAddress,
        name: u.displayName,
      },
      type: "required",
    };
  });
  return {
    ...meeting,
    start: {
      dateTime: meeting.startDate + "T" + meeting.startTime,
      timeZone: meeting.timeZone,
    },
    end: {
      dateTime: meeting.startDate + "T" + meeting.endTime,
      timeZone: meeting.timeZone,
    },
    attendees,
    changeRequestId: meeting.changeRequest?.id || "",
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
  getTopFiveUpcomingMeetings: procedure.query(async () => {
    const prefix = storageKeys.MEETING("");
    const data: ListResult<MeetingsStorage> = await storage
      .query()
      .where("key", WhereConditions.beginsWith(prefix))
      .getMany();

    const results = data.results ?? [];
    // Map to Meetings (which resolves changeRequest and attendees)
    const meetings = await Promise.all(results.map((r) => toMeetings(r.value)));

    // Filter to future meetings
    const now = DateTime.now();
    const upcoming = meetings
      .filter((m) => DateTime.fromISO(m.start.dateTime) > now)
      .sort(
        (a, b) =>
          DateTime.fromISO(a.start.dateTime).toMillis() -
          DateTime.fromISO(b.start.dateTime).toMillis()
      )
      .slice(0, 5);

    return { results: upcoming };
  }),
  getMyMeetings: procedure.query(async ({ ctx }) => {
    if (!ctx.accountId) throw new Error("User not authenticated");

    const prefix = storageKeys.MEETING("");
    const data: ListResult<MeetingsStorage> = await storage
      .query()
      .where("key", WhereConditions.beginsWith(prefix))
      .getMany();

    const results = data.results ?? [];
    const meetings = await Promise.all(results.map((r) => toMeetings(r.value)));

    // Find meetings where user is creator or attendee
    const myMeetings = meetings.filter(
      (m) =>
        m.changeRequest?.requestedBy?.accountId === ctx.accountId ||
        (Array.isArray(m.attendees) &&
          m.attendees.some((u) => u.accountId === ctx.accountId))
    );

    return { results: myMeetings };
  }),
});
