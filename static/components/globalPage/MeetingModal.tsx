import React, { useMemo } from "react";
import Modal from "@atlaskit/modal-dialog";
import Button from "@atlaskit/button/new";
import Select from "@atlaskit/select";
import { DatePicker } from "@atlaskit/datetime-picker";
import { useSnapshot } from "valtio";
import {
  meetingStore,
  resetMeeting,
  validateMeeting,
} from "@libs/meetingStore";
import UserPicker from "@components/appEssentials/UserPicker";
import Field from "@components/appEssentials/Field";
import { trpcReact } from "@trpcClient/index";
import { TimeDropdown } from "@components/appEssentials/TimePicker";
import Textfield from "@atlaskit/textfield";
import moment from "moment-timezone";

// ---- Types ----
type MeetingModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type Option = {
  label: string;
  value: string;
};

const getError = (field: string, snap: any): string => {
  if (!snap.touched[field]) return "";
  switch (field) {
    case "selectedRequest":
      return !snap.selectedRequest ? "Request is required." : "";
    case "date":
      return !snap.date ? "Date is required." : "";
    case "time":
      return !snap.time ? "Time is required." : "";
    case "attendees":
      return !snap.attendees.length ? "At least one required participant." : "";
    case "agenda":
      return !snap.agenda.trim() ? "Agenda is required." : "";
    default:
      return "";
  }
};

const MeetingModal: React.FC<MeetingModalProps> = ({ isOpen, onClose }) => {
  const snap = useSnapshot(meetingStore);
  const fieldsDisabled = !snap.changeRequest;
  const timeZone = moment.tz.guess();

  const { mutate: saveCalendarMeet, isPending } =
    trpcReact.globalPage.createMeeting.useMutation();

  const handleField = (field: keyof typeof meetingStore, value: any): void => {
    meetingStore[field] = value;
    meetingStore.touched[field as keyof typeof meetingStore.touched] = true;
    meetingStore.error = validateMeeting();
  };

  const handleSubmit = () => {
    Object.keys(meetingStore.touched).forEach((k) => {
      meetingStore.touched[k as keyof typeof meetingStore.touched] = true;
    });
    meetingStore.error = validateMeeting();

    saveCalendarMeet(
      { ...JSON.parse(JSON.stringify(snap)), timeZone: timeZone },
      {
        onSuccess(data, variables, context) {
          console.log({ data, variables, context });
        },
        onError(data, variables, context) {
          console.log({ data, variables, context });
        },
      }
    );
  };

  const getAllChangeRequests =
    trpcReact.globalPage.getAllChangeRequests.useQuery();

  const changeRequestMemoMap = useMemo(() => {
    if (!getAllChangeRequests.data) return {};
    return getAllChangeRequests.data.reduce((acc, item) => {
      return {
        ...acc,
        [item.id]: item,
      };
    }, {} as Record<string, ChangeRequest>);
  }, [getAllChangeRequests.data]);

  const changeRequestOptions: Option[] = useMemo(() => {
    if (!getAllChangeRequests.data) return [];
    return getAllChangeRequests.data.map((item: any) => ({
      label: item.title,
      value: item.id,
    }));
  }, [getAllChangeRequests.data]);

  const handleCancel = () => {
    resetMeeting();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose} width="800px">
      <div className="flex flex-row w-full rounded-2xl shadow-lg pt-3 gap-8 overflow-hidden">
        {/* Main Form Section */}
        <div className="flex-1 flex flex-col">
          <h2 className="text-2xl font-bold mb-4 text-blue-800 border-t-gray-600/50 dark:border-b-gray-200/20 border-b px-4 pb-2">
            {snap.name ? snap.name : "Create Meeting"}
          </h2>

          <div className="flex flex-col overflow-y-auto px-4 gap-4">
            {/* Meeting Name */}
            <Field label="Meeting Name" error={getError("name", snap)}>
              <Textfield
                onChange={(e) => handleField("name", e.currentTarget.value)}
                placeholder="Give meeting a name"
              />
            </Field>

            {/* Select Request */}
            <Field
              label="Select Request"
              error={getError("changeRequest", snap)}
            >
              <Select<Option>
                placeholder="Pick a request"
                value={changeRequestOptions.find(
                  (item) => item.value === snap.changeRequest?.id
                )}
                onChange={(option: Option | null) => {
                  if (option) {
                    const reqData = changeRequestMemoMap[option.value];
                    const requiredIds = [
                      ...(reqData.requiredApprovals || []).map(
                        (user: any) => user.accountId
                      ),
                      reqData.requestedBy?.accountId,
                    ].filter(Boolean);

                    const uniqueIds = Array.from(new Set(requiredIds));
                    meetingStore.attendees = uniqueIds;
                    handleField(
                      "changeRequest",
                      changeRequestMemoMap[option.value]
                    );
                  } else {
                    meetingStore.attendees = [];
                    handleField("changeRequest", null);
                  }
                }}
                options={changeRequestOptions}
                isClearable
              />
            </Field>

            {/* Date & Time */}
            <div className="flex gap-4">
              <div className="flex-1">
                <Field label="Start Date" error={getError("startDate", snap)}>
                  <DatePicker
                    onChange={(e: string) => handleField("startDate", e)}
                    value={snap.startDate}
                    placeholder="Select Start Date"
                    isDisabled={fieldsDisabled}
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="Start Time" error={getError("startTime", snap)}>
                  <TimeDropdown
                    value={snap.startTime}
                    onChange={(val) => handleField("startTime", val)}
                    label="Select Start Time"
                    disabled={fieldsDisabled}
                  />
                </Field>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Field label="End Date" error={getError("endDate", snap)}>
                  <DatePicker
                    onChange={(e: string) => handleField("endDate", e)}
                    value={snap.endDate}
                    placeholder="Select End Date"
                    isDisabled={fieldsDisabled}
                  />
                </Field>
              </div>
              <div className="flex-1">
                <Field label="End Time" error={getError("endTime", snap)}>
                  <TimeDropdown
                    value={snap.endTime}
                    onChange={(val) => handleField("endTime", val)}
                    label="Select End Time"
                    disabled={fieldsDisabled}
                  />
                </Field>
              </div>
            </div>

            {/* Participants */}
            <Field label="Participants" error={getError("attendees", snap)}>
              <UserPicker
                placeholder="Select participants"
                isMulti
                value={JSON.parse(JSON.stringify(snap.attendees))}
                onChange={(e: any) => handleField("attendees", e || [])}
                isDisabled={fieldsDisabled}
              />
            </Field>

            {/* Agenda */}
            <div className="mb-6">
              <Field label="Meeting Agenda" error={getError("notes", snap)}>
                <textarea
                  disabled={fieldsDisabled}
                  value={snap.notes}
                  onChange={(e) => handleField("notes", e.target.value)}
                  className="w-full rounded-lg border p-2 min-h-[90px] resize-none appearance-none bg-color.background.input border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add meeting notes here..."
                />
              </Field>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 py-4 px-2 justify-between items-center dark:border-t-gray-200/20 border-t border-t-gray-600/50">
            <div className="text-red-600 font-semibold text-center">
              {snap.error}
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={handleCancel} appearance="subtle">
                Cancel
              </Button>
              <Button
                type="button"
                appearance="primary"
                onClick={handleSubmit}
                isLoading={isPending}
                isDisabled={!!snap.error || fieldsDisabled}
              >
                Create Meeting
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default MeetingModal;
