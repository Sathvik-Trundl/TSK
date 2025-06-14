// components/RequestDetailModal.tsx
import React from "react";
import Modal, { ModalTitle } from "@atlaskit/modal-dialog";

interface Props {
  request: ChangeRequest | null;
  onClose: () => void;
}

const RequestDetailModal: React.FC<Props> = ({ request, onClose }) => {
  if (!request) return null;

  return (
    <Modal onClose={onClose}>
      <ModalTitle>{request.title}</ModalTitle>
      <p>
        <strong>Requested By:</strong> {request.requestedBy.displayName}
      </p>
      <p>
        <strong>Description:</strong> {request.description}
      </p>
      <p>
        <strong>Reason:</strong> {request.reason}
      </p>
      <p>
        <strong>Impact:</strong> {request.impact}
      </p>
      <p>
        <strong>Phase:</strong> {request.phase}
      </p>
      <p>
        <strong>Approval Status:</strong> {request.approvalStatus}
      </p>
      <p>
        <strong>Validation Status:</strong> {request.validationStatus}
      </p>
      <p>
        <strong>Project ID:</strong> {request.projectId}
      </p>
      <p>
        <strong>Additional Info:</strong> {request.additionalInfo}
      </p>
      <p>
        <strong>Confluence Link:</strong>{" "}
        <a
          href={request.confluenceLink}
          target="_blank"
          rel="noopener noreferrer"
        >
          {request.confluenceLink}
        </a>
      </p>
      {/* Add more fields as necessary */}
    </Modal>
  );
};

export default RequestDetailModal;
