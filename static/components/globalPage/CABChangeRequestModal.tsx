import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
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

type SectionProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
};
const Section = ({ title, children, className }: SectionProps) => (
  <div
    className={`${
      className ?? ""
    } rounded-lg p-6 mb-6 shadow-sm border border-gray-200 gap-2 flex flex-col`}
  >
    {title && (
      <div className="text-lg mb-2 tracking-wide text-color.text.accent.gray font-bold">
        {title}
      </div>
    )}
    {children}
  </div>
);

interface CABChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CABChangeRequestModal = ({
  isOpen,
  onClose,
}: CABChangeRequestModalProps): JSX.Element => {
  const formData = useSnapshot(ChangeRequestFormDataState);
  const sqlMutation = trpcReact.globalPage.createChangeRequest.useMutation();

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormField(field, value);
  };

  const handleSubmit = () => {
    let changeForm = JSON.parse(JSON.stringify(formData)) as ChangeRequestForm;
    changeForm = {
      ...changeForm,
      issueIds: changeForm.issueIds.map((item) => item.toString()),
    };
    sqlMutation.mutate(changeForm, {
      onSuccess: () => {
        console.log("Success");
      },
      onError(error, variables, context) {
        console.log({ error, variables, context });
      },
    });
    // resetChangeRequestFormData();
    // onClose();
  };

  const handleCancel = () => {
    resetChangeRequestFormData();
    onClose();
  };

  return (
    <ModalTransition>
      {isOpen && (
        <Modal onClose={onClose} width="large">
          <ModalHeader>
            <ModalTitle>
              {!formData.title ? "CAB Change Request Form" : formData.title}
            </ModalTitle>
          </ModalHeader>
          <ModalBody>
            <Section title={""} className="my-0 mb-2 pt-3">
              <div className="field-wrapper">
                <Field title="Request Title" htmlFor="title" />
                <TextField
                  id="title"
                  name="title"
                  placeholder="Enter change title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.currentTarget.value)}
                  width="100%"
                />
              </div>
            </Section>

            <Section title="Business Case" className="mb-6">
              <div className="field-wrapper">
                <Field title="Description" htmlFor="description" />
                <TextArea
                  id="description"
                  name="description"
                  placeholder="Describe the change"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="field-wrapper">
                <Field title="Business Justification" htmlFor="reason" />
                <TextArea
                  id="reason"
                  name="reason"
                  placeholder="Provide the business justification"
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
            </Section>

            <Section title="Project & Issues">
              <div className="field-wrapper">
                <Field title="Project" />
                <ProjectPicker
                  placeholder="Select Project"
                  value={formData.projectId ? [formData.projectId] : null}
                  onChange={(e) => handleChange("projectId", e ? e[0] : null)}
                />
              </div>
              <div className="field-wrapper">
                <Field title="Related Issues" />
                <IssuePicker
                  projectId={formData.projectId}
                  value={formData.issueIds ? [...formData.issueIds] : null}
                  onChange={(e) => handleChange("issueIds", e ? e : null)}
                  isMulti
                />
              </div>
            </Section>

            <Section title="Impact & Approvals" className="mb-6">
              <div className="field-wrapper">
                <Field title="Impact Assessment" htmlFor="impact" />
                <TextArea
                  id="impact"
                  name="impact"
                  placeholder="Describe the impact"
                  value={formData.impact}
                  onChange={(e) => handleChange("impact", e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>
              <div className="field-wrapper">
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
              </div>
              <div className="field-wrapper">
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
              </div>
            </Section>
          </ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={handleCancel}>
              Cancel
            </Button>
            <Button appearance="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
};
export default CABChangeRequestModal;
