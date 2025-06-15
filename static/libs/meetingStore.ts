// meetingStore.ts
import { DateTime } from "luxon";
import { proxy } from "valtio";

export const userOptions = [
  { id: "1", name: "Sathvik Dachepalli" },
  { id: "2", name: "Gaurav Sachar" },
  { id: "3", name: "Jane Doe" },
  { id: "4", name: "John Smith" },
];

export const requestOptions = [
  { id: "req-1", title: "Request A" },
  { id: "req-2", title: "Request B" },
];

type MeetingStore = {
  changeRequest: ChangeRequest | null;
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  attendees: string[];
  notes: string;
  error: string;
  touched: {
    date: boolean;
    time: boolean;
    attendees: boolean;
    notes: boolean;
  };
  start?: {
    dateTime: DateTime;
    timezone: string;
  };
  end?: {
    dateTime: DateTime;
    timezone: string;
  };
};

export const meetingStore: MeetingStore = proxy({
  changeRequest: null,
  name: "",
  startDate: "",
  startTime: "",
  endDate: "",
  endTime: "",
  attendees: [],
  notes: "",
  error: "",
  touched: {
    date: false,
    time: false,
    attendees: false,
    notes: false,
  },
  start: undefined,
  end: undefined,
});

export function validateMeeting() {
  const s = meetingStore;
  if (!s.name.trim()) return "Name is required.";
  if (!s.changeRequest) return "Request is required.";
  if (!s.startDate || !s.endDate) return "Date is required.";
  if (!s.startTime || !s.endTime) return "Time is required.";
  if (!s.attendees.length) return "At least one required participant.";
  if (!s.notes.trim()) return "notes is required.";
  const startDateTime = DateTime.fromISO(
    `${s.startDate}T${s.startTime}`
  ).toUTC();
  const endDateTime = DateTime.fromISO(`${s.endDate}T${s.endTime}`).toUTC();
  if (endDateTime <= startDateTime) return "End time must be after start time.";
  return "";
}

export function resetMeeting() {
  meetingStore.name = "";
  meetingStore.changeRequest = null;
  meetingStore.startDate = "";
  meetingStore.startTime = "";
  meetingStore.endDate = "";
  meetingStore.endTime = "";
  meetingStore.attendees = [];
  meetingStore.notes = "";
  meetingStore.error = "";
  meetingStore.touched = {
    date: false,
    time: false,
    attendees: false,
    notes: false,
  };
  meetingStore.start = undefined;
  meetingStore.end = undefined;
}
