import { useState } from "react";
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import TextField from "@atlaskit/textfield";
import TextArea from "@atlaskit/textarea";
import { DatePicker } from "@atlaskit/datetime-picker";
import UserPicker from "@components/appEssentials/UserPicker";
import Button from "@atlaskit/button/new";
import ProjectPicker from "@components/appEssentials/ProjectPicker";
import IssuePicker from "@components/appEssentials/IssuePicker";

interface CABChangeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  changeTitle: string;
  requestedBy: string | null;
  dateSubmitted: string;
  description: string;
  businessJustification: string;
  impactAssessment: string;
  approvalsRequired: string[] | null;
  additionalNotes: string;
  project: string | null;
  issues: string[] | null;
}
/**
 * CABChangeRequestModal component renders a modal with a form for CAB change request submission.
 *
 * @param {boolean} isOpen - Boolean indicating if the modal is open.
 * @param {() => void} onClose - Function to close the modal.
 *
 * @returns {JSX.Element} The rendered modal component.
 */
const CABChangeRequestModal = ({
  isOpen,
  onClose,
}: CABChangeRequestModalProps): JSX.Element => {
  const [formData, setFormData] = useState<FormData>({
    changeTitle: "",
    requestedBy: null,
    dateSubmitted: "",
    description: "",
    businessJustification: "",
    impactAssessment: "",
    approvalsRequired: [],
    additionalNotes: "",
    project: null,
    issues: null,
  });

  const handleChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    console.log("Form submitted:", formData);
    onClose();
  };

  return (
    <ModalTransition>
      {isOpen && (
        <Modal onClose={onClose}>
          <ModalHeader>
            <ModalTitle>CAB Change Request Form</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <TextField
              name="changeTitle"
              placeholder="Enter change title"
              value={formData.changeTitle}
              onChange={(e) =>
                handleChange("changeTitle", e.currentTarget.value)
              }
              label="Change Title"
            />

            <UserPicker
              onChange={(data) =>
                handleChange("requestedBy", data ? data[0] : null)
              }
              value={formData.requestedBy ? [formData.requestedBy] : null}
            />

            <DatePicker
              onChange={(date) => handleChange("dateSubmitted", date)}
              value={formData.dateSubmitted}
              placeholder="Select submission date"
              label="Date Submitted"
            />

            <TextArea
              name="description"
              placeholder="Describe the change"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />

            <TextArea
              name="businessJustification"
              placeholder="Provide the business justification"
              value={formData.businessJustification}
              onChange={(e) =>
                handleChange("businessJustification", e.target.value)
              }
            />

            <TextArea
              name="impactAssessment"
              placeholder="Describe the impact"
              value={formData.impactAssessment}
              onChange={(e) => handleChange("impactAssessment", e.target.value)}
            />

            <UserPicker
              value={formData.approvalsRequired}
              onChange={(val) => handleChange("approvalsRequired", val)}
              placeholder="Select users"
              isMulti
            />

            <TextArea
              name="additionalNotes"
              placeholder="Any additional notes"
              value={formData.additionalNotes}
              onChange={(e) => handleChange("additionalNotes", e.target.value)}
            />

            <ProjectPicker
              placeholder="Select Projects"
              value={formData.project ? [formData.project] : null}
              onChange={(e) => handleChange("project", e ? e[0] : null)}
            />

            <IssuePicker
              projectId={formData.project ?? ""}
              value={formData.issues ? [...formData.issues] : null}
              onChange={(e) => handleChange("issues", e ? e : null)}
              isMulti
            />
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => handleSubmit()}>Submit</Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
};

export default CABChangeRequestModal;
