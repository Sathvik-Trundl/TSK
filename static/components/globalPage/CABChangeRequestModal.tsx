import Modal, { ModalBody } from "@atlaskit/modal-dialog";
import TextField from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import UserPicker from "@components/appEssentials/UserPicker";
import Button from "@atlaskit/button/new";
import ProjectPicker from "@components/appEssentials/ProjectPicker";
import IssuePicker from "@components/appEssentials/IssuePicker";
import Field from "@components/appEssentials/Field";
import { useSnapshot } from "valtio";
import {
  setFormField,
  ChangeRequestFormDataState,
  resetChangeRequestFormData,
  validateChangeRequestForm,
} from "@libs/store";
import { trpcReact } from "@trpcClient/index";
import { useProductContext } from "@libs/util";
import { useEffect } from "react";

// Replace with your actual ChangeRequestForm type!
// type ChangeRequestForm = {
//   title: string;
//   description: string;
//   reason: string;
//   impact: string;
//   additionalInfo: string;
//   projectId: string | null;
//   issueIds: string[];
//   requiredApprovals: any[];
// };

interface CABChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  refetchRequests: () => void;
}

const getChangeRequestError = (field: string, snap: any): string => {
  if (!snap.touched?.[field]) return "";
  switch (field) {
    case "title":
      return !snap.title.trim() ? "Title is required." : "";
    case "requestedBy":
      return !snap.requestedBy || !snap.requestedBy.trim()
        ? "Requester is required."
        : "";
    case "description":
      return !snap.description.trim() ? "Description is required." : "";
    case "reason":
      return !snap.reason.trim() ? "Business justification is required." : "";
    case "impact":
      return !snap.impact.trim() ? "Impact assessment is required." : "";
    case "projectId":
      return !snap.projectId || !snap.projectId.trim()
        ? "Project is required."
        : "";
    case "requiredApprovals":
      return !Array.isArray(snap.requiredApprovals) ||
        snap.requiredApprovals.length === 0
        ? "At least one approver is required."
        : "";
    default:
      return "";
  }
};

const CABChangeRequestModal = ({
  isOpen,
  onClose,
  refetchRequests,
}: CABChangeRequestModalProps): JSX.Element | null => {
  const viewContext = useProductContext();
  const formData = useSnapshot(ChangeRequestFormDataState);
  const sqlMutation = trpcReact.globalPage.createChangeRequest.useMutation();

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormField(field, value);
    ChangeRequestFormDataState.error = validateChangeRequestForm();
  };

  const { data: projectData } = trpcReact.rest.getProjectByID.useQuery(
    formData.projectId || "",
    { enabled: !!formData.projectId }
  );
  const { data: issueObjects = [] } = trpcReact.rest.getIssuesById.useQuery(
    (formData.issueIds ?? []).map((u) => {
      return u;
    }),
    { enabled: formData.issueIds?.length > 0 }
  );
  const { data: userObjects = [] } = trpcReact.rest.getUsersByIds.useQuery(
    (formData.requiredApprovals ?? []).map((u) => {
      return u;
    }),
    { enabled: formData.requiredApprovals?.length > 0 }
  );

  const handleSubmit = () => {
    function omit<T extends object, K extends keyof T>(
      obj: T,
      keys: K[]
    ): Omit<T, K> {
      const clone = { ...obj };
      for (const key of keys) {
        delete clone[key];
      }
      return clone;
    }

    // In handleSubmit:
    const formClean = omit(JSON.parse(JSON.stringify(formData)), [
      "touched",
      "error",
    ]) as ChangeRequestStorage;

    const changeForm = {
      ...formClean,
      projectId: formClean.projectId,
      issueIds: formClean.issueIds?.map((item) => item.toString()) ?? [],
    };

    sqlMutation.mutate(changeForm, {
      onSuccess: () => {
        refetchRequests();
      },
    });
    resetChangeRequestFormData();
    onClose();
  };

  const handleCancel = () => {
    resetChangeRequestFormData();
    onClose();
  };

  useEffect(() => {
    if (isOpen && viewContext.data?.accountId) {
      setFormField("requestedBy", viewContext.data.accountId);
    }
  }, [isOpen, viewContext.data?.accountId]);

  if (!isOpen) return null;

  return (
    <Modal
      onClose={onClose}
      width="80%"
      shouldScrollInViewport
      aria-label="CAB Change Request Modal"
      autoFocus
    >
      <ModalBody>
        <div className="flex flex-row w-full bg-white max-h-[80vh] rounded-lg shadow border border-gray-100">
          {/* LEFT COLUMN: FORM */}
          <div className="flex-1 px-8 py-6 flex flex-col min-h-0">
            <h2 className="text-2xl font-bold mb-6 text-blue-800">
              Change Request Form
            </h2>
            <div
              className="flex-grow overflow-y-auto pr-1"
              style={{
                maxHeight: "calc(76vh - 64px)",
                paddingBottom: 0,
              }}
            >
              <section className="mb-6">
                <Field
                  title="Request Title"
                  htmlFor="title"
                  error={getChangeRequestError("title", formData)}
                >
                  <TextField
                    id="title"
                    name="title"
                    placeholder="Enter change title"
                    value={formData.title}
                    onChange={(e) =>
                      handleChange("title", e.currentTarget.value)
                    }
                    width="100%"
                  />
                </Field>
              </section>

              <section className="mb-6">
                <Field
                  title="Description"
                  htmlFor="description"
                  error={getChangeRequestError("description", formData)}
                >
                  <TextArea
                    id="description"
                    name="description"
                    placeholder="Describe the change"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    style={{ width: "100%" }}
                  />
                </Field>
              </section>

              <section className="mb-6">
                <Field
                  title="Request by"
                  htmlFor="requestedBy"
                  error={getChangeRequestError("requestedBy", formData)}
                >
                  <UserPicker
                    placeholder="Describe the change"
                    value={[formData.requestedBy]}
                    onChange={(e) =>
                      handleChange("requestedBy", e ? e[0] : null)
                    }
                  />
                </Field>
              </section>

              <section className="mb-6">
                <Field
                  title="Business Justification"
                  htmlFor="reason"
                  error={getChangeRequestError("reason", formData)}
                >
                  <TextArea
                    id="reason"
                    name="reason"
                    placeholder="Provide the business justification"
                    value={formData.reason}
                    onChange={(e) => handleChange("reason", e.target.value)}
                    style={{ width: "100%" }}
                  />
                </Field>
              </section>

              <section className="mb-6">
                <Field
                  title="Project"
                  error={getChangeRequestError("projectId", formData)}
                >
                  <ProjectPicker
                    placeholder="Select Project"
                    value={formData.projectId ? [formData.projectId] : null}
                    onChange={(e) => handleChange("projectId", e ? e[0] : null)}
                  />
                </Field>
              </section>

              <section className="mb-6">
                <Field
                  title="Related Issues"
                  error={getChangeRequestError("issueIds", formData)}
                >
                  <IssuePicker
                    projectId={formData.projectId}
                    value={formData.issueIds ? [...formData.issueIds] : null}
                    onChange={(e) => handleChange("issueIds", e ? e : null)}
                    isMulti
                  />
                </Field>
              </section>

              <section className="mb-6">
                <Field
                  title="Impact Assessment"
                  htmlFor="impact"
                  error={getChangeRequestError("impact", formData)}
                >
                  <TextArea
                    id="impact"
                    name="impact"
                    placeholder="Describe the impact"
                    value={formData.impact}
                    onChange={(e) => handleChange("impact", e.target.value)}
                    style={{ width: "100%" }}
                  />
                </Field>
              </section>

              <section className="mb-6">
                <Field
                  title="Approvals Required"
                  error={getChangeRequestError("requiredApprovals", formData)}
                >
                  <UserPicker
                    value={
                      JSON.parse(
                        JSON.stringify(formData.requiredApprovals)
                      ) as string[]
                    }
                    onChange={(val) => handleChange("requiredApprovals", val)}
                    placeholder="Select users"
                    isMulti
                  />
                </Field>
              </section>

              <section className="mb-6">
                <Field title="Additional Notes" htmlFor="additionalInfo">
                  <TextArea
                    id="additionalInfo"
                    name="additionalInfo"
                    placeholder="Any additional notes"
                    value={formData.additionalInfo}
                    onChange={(e) =>
                      handleChange("additionalInfo", e.target.value)
                    }
                    style={{ width: "100%" }}
                  />
                </Field>
              </section>
            </div>
            {/* Sticky Actions */}
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-white pt-4 pb-1 mt-3 sticky bottom-0">
              <Button appearance="subtle" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                appearance="primary"
                onClick={handleSubmit}
                isDisabled={!!formData.error}
              >
                Submit
              </Button>
            </div>
          </div>
          {/* RIGHT COLUMN: PREVIEW PANEL */}
          <aside className="w-72 border-l border-gray-100 bg-gray-50 px-6 py-6 flex-shrink-0 hidden md:block">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Preview
            </h3>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Title</div>
              <div className="font-medium text-gray-900">
                {formData.title || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Project</div>
              <div className="font-medium text-gray-900">
                {projectData?.name || (
                  <span className="italic text-gray-400">-</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Issues</div>
              <div className="font-medium text-gray-900">
                {issueObjects.length > 0 ? (
                  issueObjects.map((issue) => issue.key || issue.id).join(", ")
                ) : (
                  <span className="italic text-gray-400">-</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Approvals</div>
              <div className="font-medium text-gray-900">
                {userObjects.length > 0 ? (
                  userObjects
                    .map((u) => u.displayName || u.accountId)
                    .join(", ")
                ) : (
                  <span className="italic text-gray-400">-</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Impact</div>
              <div className="font-medium text-gray-900">
                {formData.impact || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Reason</div>
              <div className="font-medium text-gray-900">
                {formData.reason || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Additional Info</div>
              <div className="font-medium text-gray-900">
                {formData.additionalInfo || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
            </div>
          </aside>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CABChangeRequestModal;
