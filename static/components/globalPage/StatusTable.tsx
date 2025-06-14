// components/StatusTable.tsx
import React from "react";
import PhaseLozenge from "../appEssentials/Lozenge";

interface Props {
  requests: ChangeRequest[];
  onSelect: (request: ChangeRequest) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const StatusTable: React.FC<Props> = ({
  requests,
  onSelect,
  onApprove,
  onReject,
}) => (
  <table className="min-w-full divide-y divide-gray-200">
    <thead>
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Request Name
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Phase
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {requests.map((req) => (
        <tr key={req.id}>
          <td className="px-6 py-4 whitespace-nowrap">
            <button
              onClick={() => onSelect(req)}
              className="text-blue-600 hover:underline"
            >
              {req.title}
            </button>
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <PhaseLozenge phase={req.phase} />
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            {req.phase.toLowerCase() === "Validation Pending".toLowerCase() && (
              <>
                <button
                  onClick={() => onApprove(req.id)}
                  className="text-green-600 bg-elevation.surface.raised hover:bg-elevation.surface.raised.hovered px-2 py-2 rounded-lg mr-4"
                >
                  ✔️
                </button>
                <button
                  onClick={() => onReject(req.id)}
                  className="text-red-600 bg-elevation.surface.raised hover:bg-elevation.surface.raised.hovered px-2 py-2 rounded-lg"
                >
                  ❌
                </button>
              </>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default StatusTable;
