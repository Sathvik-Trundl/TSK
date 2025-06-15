import React, { useMemo } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import PhaseLozenge from "../appEssentials/Lozenge";
import { Check, X } from "lucide-react";

type Phase = "Validation Pending" | "Approved" | "Rejected";

interface ChangeRequest {
  id: string;
  title: string;
  phase: Phase;
}

interface KanbanBoardProps {
  requests: ChangeRequest[];
  onSelect: (request: ChangeRequest) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onPhaseChange: (id: string, newPhase: Phase) => void;
}

const PHASES: Phase[] = ["Validation Pending", "Approved", "Rejected"];

const KanbanBoard: React.FC<KanbanBoardProps> = ({
  requests,
  onSelect,
  onApprove,
  onReject,
  onPhaseChange,
}) => {
  const grouped = useMemo(() => {
    const map: Record<Phase, ChangeRequest[]> = {
      "Validation Pending": [],
      Approved: [],
      Rejected: [],
    };

    for (const r of requests) {
      if (map[r.phase]) {
        map[r.phase].push(r);
      } else {
        console.warn(`Unknown phase: ${r.phase}`);
      }
    }

    return map;
  }, [requests]);

  const handleDragEnd = (result: DropResult) => {
    const { draggableId, destination } = result;
    if (!destination) return;

    const newPhase = destination.droppableId as Phase;
    const dragged = requests.find((r) => r.id === draggableId);
    if (dragged && dragged.phase !== newPhase) {
      onPhaseChange(dragged.id, newPhase);
    }
  };

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
                          onClick={() => onSelect(req)}
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
                              onClick={() => onApprove(req.id)}
                              className="text-xs bg-green-500 text-white px-2 py-1 rounded flex items-center gap-1"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => onReject(req.id)}
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
    </DragDropContext>
  );
};

export default KanbanBoard;
