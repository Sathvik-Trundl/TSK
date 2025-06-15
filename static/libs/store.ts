import { proxy } from "valtio";

export const globalPageStore = proxy({
  openMeetModal: false,
  openRequestModal: false,
});

export type ChangeRequestFormData = ChangeRequestForm & { error: string } & {
  touched: Record<string, boolean>;
};

// Initial state
export const ChangeRequestFormDataState = proxy<ChangeRequestFormData>({
  title: "",
  requestedBy: "",
  description: "",
  reason: "",
  impact: "",
  requiredApprovals: [],
  additionalInfo: "",
  projectId: "",
  issueIds: [],
  error: "",
  touched: {}, // NEW!
});

// Utility function to update a field
export function setFormField<T extends keyof ChangeRequestFormData>(
  field: T,
  value: ChangeRequestFormData[T]
) {
  ChangeRequestFormDataState[field] = value;
  ChangeRequestFormDataState.touched[field as string] = true;
}

// Reset function
export function resetChangeRequestFormData() {
  ChangeRequestFormDataState.title = "";
  ChangeRequestFormDataState.requestedBy = "";
  ChangeRequestFormDataState.description = "";
  ChangeRequestFormDataState.reason = "";
  ChangeRequestFormDataState.impact = "";
  ChangeRequestFormDataState.requiredApprovals = [];
  ChangeRequestFormDataState.additionalInfo = "";
  ChangeRequestFormDataState.projectId = "";
  ChangeRequestFormDataState.issueIds = [];
  ChangeRequestFormDataState.error = "";
  ChangeRequestFormDataState.touched = {};
}

export function validateChangeRequestForm() {
  const s = ChangeRequestFormDataState;

  if (!s.title.trim()) return "Title is required.";
  if (!s.requestedBy || !s.requestedBy.trim()) return "Requester is required.";
  if (!s.description.trim()) return "Description is required.";
  if (!s.reason.trim()) return "Business justification is required.";
  if (!s.impact.trim()) return "Impact assessment is required.";
  if (!s.projectId || !s.projectId.trim()) return "Project is required.";
  if (!Array.isArray(s.requiredApprovals) || s.requiredApprovals.length === 0)
    return "At least one approver is required.";
  return "";
}
