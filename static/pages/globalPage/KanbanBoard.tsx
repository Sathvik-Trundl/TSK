import { useMemo, useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import PhaseLozenge from "@components/appEssentials/Lozenge";
import { Check, X } from "lucide-react";
import { trpcReact } from "@trpcClient/index";
import RequestDetailModal from "@components/globalPage/RequestDetailModal";
import Navigation from "@components/globalPage/Navigation";
import Loader from "@components/Loader";

const PHASES: Phase[] = [
  "Validation Pending",
  "In-Progress",
  "In-Discussion",
  "Approved",
];

const KanbanBoard = () => {
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(
    null
  );
  const [localRequests, setLocalRequests] = useState<ChangeRequest[]>([]);
  const [dragSourcePhase, setDragSourcePhase] = useState<Phase | null>(null);

  const { mutate: onPhaseChange } =
    trpcReact.globalPage.changePhase.useMutation();
  const approveChangeRequest =
    trpcReact.globalPage.approveChangeRequest.useMutation();
  const rejectChangeRequest =
    trpcReact.globalPage.rejectChangeRequest.useMutation();
  const { data: requests, isLoading } =
    trpcReact.globalPage.getAllChangeRequests.useQuery();

  const handleApprove = (id: string, currentPhase: Phase) => {
    setLocalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, phase: "Approved" } : r))
    );
    approveChangeRequest.mutate(
      { id, currentPhase },
      {
        onSuccess: () => {
          // refetchRequests();
        },
        onError: (err) => {
          console.error("Approval failed:", err);
        },
      }
    );
  };

  const handleReject = (id: string, currentPhase: Phase) => {
    setLocalRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, phase: "Rejected" } : r))
    );
    rejectChangeRequest.mutate(
      { id, currentPhase },
      {
        onSuccess: () => {
          // refetchRequests();
        },
        onError: (err) => {
          console.error("Rejection failed:", err);
        },
      }
    );
  };

  // Sync local requests with fetched ones
  useEffect(() => {
    if (requests) setLocalRequests(requests);
  }, [requests]);

  const grouped = useMemo(() => {
    const map = PHASES.reduce((acc, phase) => {
      acc[phase] = [];
      return acc;
    }, {} as Record<Phase, ChangeRequest[]>);

    localRequests.forEach((r) => {
      if (PHASES.includes(r.phase as Phase)) {
        map[r.phase as Phase].push(r);
      } else {
        console.warn(`Unknown phase: ${r.phase}`);
      }
    });

    console.log({ map });

    return map;
  }, [localRequests]);

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination, source } = result;
    if (!destination) return;

    const fromPhase = source.droppableId as Phase;
    const toPhase = destination.droppableId as Phase;

    const fromIdx = PHASES.indexOf(fromPhase);
    const toIdx = PHASES.indexOf(toPhase);

    // Only allow forward movement
    if (toIdx <= fromIdx) return;

    const dragged = localRequests.find((r) => r.id === draggableId);
    if (!dragged || dragged.phase === toPhase) return;

    // Optimistic update for real-time UI
    setLocalRequests((prev) =>
      prev.map((r) => (r.id === dragged.id ? { ...r, phase: toPhase } : r))
    );

    // Persist to backend
    onPhaseChange(
      { id: dragged.id, phase: toPhase },
      {
        onError: () => {
          // Rollback on error
          setLocalRequests((prev) =>
            prev.map((r) =>
              r.id === dragged.id ? { ...r, phase: fromPhase } : r
            )
          );
        },
        onSuccess: () => {
          // Optionally refetch if needed
          // refetch();
        },
      }
    );
  };

  if (isLoading) return <Loader type="full" />;

  return (
    <div className="flex flex-col">
      <Navigation />

      <DragDropContext
        onDragStart={(start) =>
          setDragSourcePhase(start.source.droppableId as Phase)
        }
        onDragEnd={(result) => {
          setDragSourcePhase(null);
          handleDragEnd(result);
        }}
      >
        <div className="flex gap-6 overflow-x-auto p-4 justify-center h-[calc(100vh-120px)]">
          {PHASES.map((phase) => (
            <Droppable droppableId={phase} key={phase}>
              {(provided, snapshot) => {
                const isBackwardDrop =
                  dragSourcePhase &&
                  PHASES.indexOf(phase) < PHASES.indexOf(dragSourcePhase);
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col min-w-[280px] w-[300px] border bg-blue-500/10 border-gray-200 rounded-lg p-4 shadow-sm transition ${
                      snapshot.isDraggingOver
                        ? "bg-blue-500/60 dark:bg-blue-500/40"
                        : ""
                    } ${
                      snapshot.isDraggingOver
                        ? isBackwardDrop
                          ? "bg-red-100 dark:bg-red-900/40 opacity-50"
                          : "bg-blue-500/60 dark:bg-blue-500/40"
                        : ""
                    }`}
                  >
                    <h3 className="text-md font-bold text-gray-700 mb-4 dark:text-white">
                      {phase}
                      {snapshot.isDraggingOver && isBackwardDrop && (
                        <span className="text-xs text-red-500 font-semibold">
                          ⛔ Backward Move Not Allowed
                        </span>
                      )}
                    </h3>

                    {grouped[phase].map((req, idx) => (
                      <Draggable draggableId={req.id} index={idx} key={req.id}>
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className="bg-white border border-gray-300 p-3 mb-3 rounded-md shadow hover:shadow-md transition flex flex-col gap-2"
                          >
                            <div>
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="text-blue-600 font-medium hover:underline text-left"
                              >
                                {req.title}
                              </button>
                            </div>

                            {/* Middle: Phase + Approver Avatars */}
                            <div className="flex items-center gap-2 justify-between">
                              <PhaseLozenge phase={req.phase} />
                              <div className="flex -space-x-2 self-end justify-end">
                                {req.requiredApprovals?.length > 3 ? (
                                  <>
                                    {req.requiredApprovals
                                      .slice(0, 2)
                                      .map((user) => (
                                        <img
                                          key={user.accountId}
                                          src={user.avatarUrls["48x48"]}
                                          alt={user.displayName}
                                          title={user.displayName}
                                          className="w-6 h-6 rounded-full border-2 border-white shadow"
                                        />
                                      ))}
                                    <div
                                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold border-2 border-white shadow"
                                      title={req.requiredApprovals
                                        .slice(2)
                                        .map((user) => user.displayName)
                                        .join(", ")}
                                    >
                                      +{req.requiredApprovals.length - 2}
                                    </div>
                                  </>
                                ) : req.requiredApprovals?.length > 0 ? (
                                  req.requiredApprovals.map((user) => (
                                    <img
                                      key={user.accountId}
                                      src={user.avatarUrls["48x48"]}
                                      alt={user.displayName}
                                      title={user.displayName}
                                      className="w-6 h-6 rounded-full border-2 border-white shadow"
                                    />
                                  ))
                                ) : (
                                  <span className="text-gray-400 text-xs">
                                    No approvers
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Bottom: Approve/Reject buttons if not Approved and user is Approver */}
                            {req.phase !== "Approved" && req.isApprover && (
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() =>
                                    handleApprove(req.id, req.phase)
                                  }
                                  className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1"
                                >
                                  <Check size={14} /> Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleReject(req.id, req.phase)
                                  }
                                  className="text-xs bg-red-500 text-white px-2 py-1 rounded flex items-center gap-1"
                                >
                                  <X size={14} /> Reject
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          ))}
        </div>
        {selectedRequest && (
          <RequestDetailModal
            request={selectedRequest as any}
            onClose={() => setSelectedRequest(null)}
          />
        )}
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
