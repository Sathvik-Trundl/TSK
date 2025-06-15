import React, { useState } from "react";
import Modal, { ModalBody } from "@atlaskit/modal-dialog";
import AvatarLabel from "@components/appEssentials/AvatarLabel";
import PhaseLozenge from "@components/appEssentials/Lozenge";
import Avatar from "@atlaskit/avatar";
import Textfield from "@atlaskit/textfield";
import Button from "@atlaskit/button";
import { trpcReact } from "@trpcClient/index";

interface RequestDetailModalProps {
  request: ChangeRequest | null;
  onClose: () => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  onClose,
}) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addCommentMutation =
    trpcReact.globalPage.addCommentToRequest.useMutation();

  if (!request) return null;

  const {
    title,
    description,
    reason,
    impact,
    additionalInfo,
    requestedBy,
    requiredApprovals = [],
    phase,
    approvalStatus,
    validationStatus,
    project,
    confluenceLink,
    comments,
  } = request;

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    setIsSubmitting(true);
    try {
      await addCommentMutation.mutateAsync({
        requestId: request.id,
        comment: newComment.trim(),
      });

      request.comments.push({
        user: requestedBy,
        comment: newComment.trim(),
        createdAt: new Date().toISOString()
      });

      setNewComment("");
    } catch (err) {
      console.error("Comment failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      onClose={onClose}
      width="80%"
      shouldScrollInViewport
      aria-label="Request Details Modal"
      autoFocus
    >
      <ModalBody>
        <div className="flex flex-row w-full bg-white max-h-[80vh]">
          {/* LEFT COLUMN */}
          <div className="flex-1 px-8 py-6 pb-4 flex flex-col min-h-0">
            <h2 className="text-2xl font-bold mb-4 text-blue-800">{title}</h2>
            <div
              className="flex-grow overflow-y-auto"
              style={{
                maxHeight: "calc(76vh - 64px)",
                paddingBottom: "0px",
              }}
            >
              {/* Description */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Description
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2 text-gray-900">
                  {description || (
                    <span className="italic text-gray-400">
                      No description provided.
                    </span>
                  )}
                </div>
              </section>

              {/* Reason */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Reason
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2 text-gray-900">
                  {reason || (
                    <span className="italic text-gray-400">
                      No reason provided.
                    </span>
                  )}
                </div>
              </section>

              {/* Impact */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Impact
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2 text-gray-900">
                  {impact || (
                    <span className="italic text-gray-400">
                      No impact provided.
                    </span>
                  )}
                </div>
              </section>

              {/* Additional Info */}
              <section className="mb-4">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Additional Info
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-2 text-gray-900">
                  {additionalInfo || (
                    <span className="italic text-gray-400">
                      No additional info.
                    </span>
                  )}
                </div>
              </section>

              {/* Comments */}
              <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  Comments
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 mb-4 text-gray-900 min-h-[60px] max-h-[200px] overflow-y-auto">
                  {comments && comments.length > 0 ? (
                    <ul className="space-y-4">
                      {comments.map((line, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-b-0"
                        >
                          <div className="flex-shrink-0">
                            <Avatar src={line.user?.avatarUrls?.["48x48"]} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">
                                {line.user?.displayName || "Unknown User"}
                              </span>
                              <span className="text-xs text-gray-400">
                                {line.createdAt &&
                                  new Date(line.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-gray-700 mt-1">
                              {line.comment}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="italic text-gray-400">
                      No comments provided.
                    </span>
                  )}
                </div>
              </section>
            </div>
            <div className="mt-3 flex gap-2 items-start">
              <Textfield
                value={newComment}
                onChange={(e) => setNewComment(e.currentTarget.value)}
                placeholder="Add a comment…"
                isDisabled={isSubmitting}
                elemBeforeInput={<Avatar size="small" />}
                width="100%"
              />
              <Button
                appearance="primary"
                onClick={handleCommentSubmit}
                isDisabled={!newComment.trim() || isSubmitting}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="w-72 border-l border-gray-100 bg-gray-50 px-6 py-6 flex-shrink-0">
            <h3 className="font-semibold text-lg mb-3 text-gray-800">
              Details
            </h3>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Reporter</div>
              <div className="font-medium text-gray-900">
                <AvatarLabel
                  name={requestedBy?.displayName || "Unknown"}
                  avatar={requestedBy?.avatarUrls?.["48x48"]}
                  size="small"
                  appearance="circle"
                />
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Approvers</div>
              <div className="font-medium text-gray-900 flex flex-col gap-1">
                {requiredApprovals.length > 0 ? (
                  requiredApprovals.map((item, idx) => (
                    <AvatarLabel
                      key={item?.displayName + idx}
                      name={item?.displayName || "Unknown"}
                      avatar={item?.avatarUrls?.["48x48"]}
                      size="small"
                      appearance="circle"
                    />
                  ))
                ) : (
                  <span className="italic text-gray-400">
                    No approvers assigned.
                  </span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Phase</div>
              <div className="text-gray-900">
                <PhaseLozenge phase={phase} />
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Approval Status</div>
              <div className="text-gray-900">
                {approvalStatus || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Validation Status</div>
              <div className="text-gray-900">
                {validationStatus || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-500">Project</div>
              <div className="text-gray-900">
                {project?.name || (
                  <span className="italic text-gray-400">N/A</span>
                )}
              </div>
            </div>
            {confluenceLink && (
              <div className="mb-4">
                <div className="text-sm text-gray-500">Confluence Link</div>
                <a
                  href={confluenceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {confluenceLink}
                </a>
              </div>
            )}
          </aside>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default RequestDetailModal;
