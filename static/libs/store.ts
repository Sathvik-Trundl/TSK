import { proxy } from "valtio";

export const globalPageStore = proxy({
  openMeetModal: false,
  openRequestModal: false,
});

export type ChangeRequestFormData = ChangeRequestForm;

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
});

// Utility function to update a field
export function setFormField<T extends keyof ChangeRequestFormData>(
  field: T,
  value: ChangeRequestFormData[T]
) {
  ChangeRequestFormDataState[field] = value;
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
}
