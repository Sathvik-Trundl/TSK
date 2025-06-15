import { useMemo, useState } from "react";
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

interface ChangeRequest {
  id: string;
  title: string;
  phase: Phase;
}

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

  const { mutate: onPhaseChange } =
    trpcReact.globalPage.changePhase.useMutation();
  const approveChangeRequest =
    trpcReact.globalPage.approveChangeRequest.useMutation();
  const rejectChangeRequest =
    trpcReact.globalPage.rejectChangeRequest.useMutation();

  const { data: requests } =
    trpcReact.globalPage.getAllChangeRequests.useQuery();

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination || !requests) return;

    const newPhase = destination.droppableId as Phase;
    const dragged = requests.find((r) => r.id === draggableId);
    if (dragged && dragged.phase !== newPhase) {
      onPhaseChange({ id: dragged.id, phase: newPhase });
    }
  };

  const handleApprove = (id: string) => {
    approveChangeRequest.mutate(id, {
      onSuccess: () => {
        // refetchRequests();
      },
      onError: (err) => {
        console.error("Approval failed:", err);
      },
    });
  };

  const handleReject = (id: string) => {
    rejectChangeRequest.mutate(id, {
      onError: (err) => {
        console.error("Rejection failed:", err);
      },
    });
  };

  const grouped = useMemo(() => {
    // Always build map using PHASES for guaranteed columns
    const map = PHASES.reduce((acc, phase) => {
      acc[phase] = [];
      return acc;
    }, {} as Record<Phase, ChangeRequest[]>);

    if (requests) {
      for (const r of requests) {
        if (PHASES.includes(r.phase as Phase)) {
          map[r.phase as Phase].push(r);
        } else {
          console.warn(`Unknown phase: ${r.phase}`);
        }
      }
    }

    return map;
  }, [requests]);

  if (!requests) return <div></div>;

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-6 overflow-x-auto p-4 h-[calc(100vh-120px)]">
        {PHASES.map((phase) => (
          <Droppable droppableId={phase} key={phase}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-col min-w-[280px] w-[300px] bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm transition ${
                  snapshot.isDraggingOver ? "bg-blue-100" : ""
                }`}
              >
                <h3 className="text-md font-bold text-gray-700 mb-4">
                  {phase}
                </h3>

                {grouped[phase].map((req, idx) => (
                  <Draggable draggableId={req.id} index={idx} key={req.id}>
                    {(dragProvided) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className="bg-white border border-gray-300 p-3 mb-3 rounded-md shadow hover:shadow-md transition"
                      >
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="text-blue-600 font-medium hover:underline"
                        >
                          {req.title}
                        </button>
                        <div className="text-sm text-gray-600 my-1">
                          <PhaseLozenge phase={req.phase} />
                        </div>
                        {req.phase === "Validation Pending" && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
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
            )}
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
  );
};
export default KanbanBoard;
