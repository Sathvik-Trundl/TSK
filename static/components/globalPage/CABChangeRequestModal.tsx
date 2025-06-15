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
} from "@libs/store";
import { trpcReact } from "@trpcClient/index";

// Replace with your actual ChangeRequestForm type!
type ChangeRequestForm = {
  title: string;
  description: string;
  reason: string;
  impact: string;
  additionalInfo: string;
  projectId: string | null;
  issueIds: string[];
  requiredApprovals: any[];
};

interface CABChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CABChangeRequestModal = ({
  isOpen,
  onClose,
}: CABChangeRequestModalProps): JSX.Element | null => {
  const formData = useSnapshot(ChangeRequestFormDataState);
  const sqlMutation = trpcReact.globalPage.createChangeRequest.useMutation();

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormField(field, value);
  };

  const handleSubmit = () => {
    let changeForm = JSON.parse(JSON.stringify(formData)) as ChangeRequestForm;
    changeForm = {
      ...changeForm,
      projectId: changeForm.projectId,
      issueIds: changeForm.issueIds?.map((item) => item.toString()) ?? [],
    };
    sqlMutation.mutate(changeForm, {
      onSuccess: () => {
        // Optionally: show toast or notification
      },
    });
    // resetChangeRequestFormData();
    // onClose();
  };

  const handleCancel = () => {
    resetChangeRequestFormData();
    onClose();
  };

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
              {formData.title || "CAB Change Request Form"}
            </h2>
            <div
              className="flex-grow overflow-y-auto pr-1"
              style={{
                maxHeight: "calc(76vh - 64px)",
                paddingBottom: 0,
              }}
            >
              {/* Title */}
              <section className="mb-6">
                <Field title="Request Title" htmlFor="title" />
                <TextField
                  id="title"
                  name="title"
                  placeholder="Enter change title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.currentTarget.value)}
                  width="100%"
                />
              </section>
              {/* Description */}
              <section className="mb-6">
                <Field title="Description" htmlFor="description" />
                <TextArea
                  id="description"
                  name="description"
                  placeholder="Describe the change"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  style={{ width: "100%" }}
                />
              </section>
              {/* Reason */}
              <section className="mb-6">
                <Field title="Business Justification" htmlFor="reason" />
                <TextArea
                  id="reason"
                  name="reason"
                  placeholder="Provide the business justification"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  style={{ width: "100%" }}
                />
              </section>
              {/* Project */}
              <section className="mb-6">
                <Field title="Project" />
                <ProjectPicker
                  placeholder="Select Project"
                  value={formData.projectId ? [formData.projectId] : null}
                  onChange={(e) => handleChange("projectId", e ? e[0] : null)}
                />
              </section>
              {/* Related Issues */}
              <section className="mb-6">
                <Field title="Related Issues" />
                <IssuePicker
                  projectId={formData.projectId}
                  value={formData.issueIds ? [...formData.issueIds] : null}
                  onChange={(e) => handleChange("issueIds", e ? e : null)}
                  isMulti
                />
              </section>
              {/* Impact */}
              <section className="mb-6">
                <Field title="Impact Assessment" htmlFor="impact" />
                <TextArea
                  id="impact"
                  name="impact"
                  placeholder="Describe the impact"
                  value={formData.impact}
                  onChange={(e) => handleChange("impact", e.target.value)}
                  style={{ width: "100%" }}
                />
              </section>
              {/* Approvals Required */}
              <section className="mb-6">
                <Field title="Approvals Required" />
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
              </section>
              {/* Additional Notes */}
              <section className="mb-6">
                <Field title="Additional Notes" htmlFor="additionalInfo" />
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
              </section>
            </div>
            {/* Sticky Actions */}
            <div className="flex justify-end gap-2 border-t border-gray-100 bg-white pt-4 pb-1 mt-3 sticky bottom-0">
              <Button appearance="subtle" onClick={handleCancel}>
                Cancel
              </Button>
              <Button appearance="primary" onClick={handleSubmit}>
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
                {formData.projectId || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Issues</div>
              <div className="font-medium text-gray-900">
                {formData.issueIds && formData.issueIds.length > 0 ? (
                  formData.issueIds.join(", ")
                ) : (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Approvals</div>
              <div className="font-medium text-gray-900">
                {formData.requiredApprovals &&
                formData.requiredApprovals.length > 0 ? (
                  formData.requiredApprovals
                    .map((u: any) => u.displayName || u)
                    .join(", ")
                ) : (
                  <span className="italic text-gray-400">N/A</span>
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
