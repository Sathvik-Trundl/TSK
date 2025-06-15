import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import PhaseLozenge from "../appEssentials/Lozenge";
import { Check, X } from "lucide-react";

// Define your columns
function getColumns(
  onSelect: (request: ChangeRequest) => void,
  onApprove: (id: string) => void,
  onReject: (id: string) => void
): ColumnDef<ChangeRequest>[] {
  return [
    {
      accessorKey: "title",
      header: "Request Name",
      cell: (info) => (
        <button
          onClick={() => onSelect(info.row.original)}
          className="dark:text-blue-500  text-blue-600 font-semibold hover:underline transition"
        >
          {info.getValue() as string}
        </button>
      ),
    },
    {
      accessorKey: "phase",
      header: "Phase",
      cell: (info) => <PhaseLozenge phase={info.getValue() as Phase} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: (info) =>
        info.row.original.phase.toLowerCase() === "validation pending" && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(info.row.original.id)}
              className="flex items-center gap-1 justify-center text-white bg-green-500 hover:bg-green-600 px-3 py-1.5 rounded-xl shadow transition"
              title="Approve"
            >
              <Check /> Approve
            </button>
            <button
              onClick={() => onReject(info.row.original.id)}
              className="flex items-center gap-1 text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-xl shadow transition"
              title="Reject"
            >
              <X /> Reject
            </button>
          </div>
        ),
    },
  ];
}

interface Props {
  requests: ChangeRequest[];
  onSelect: (request: ChangeRequest) => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isLoading?: boolean;
}

const StatusTable: React.FC<Props> = ({
  requests,
  onSelect,
  onApprove,
  onReject,
  isLoading,
}) => {
  const columns = React.useMemo(
    () => getColumns(onSelect, onApprove, onReject),
    [onSelect, onApprove, onReject, requests]
  );
  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-2xl shadow-lg border border-gray-200 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-4 text-left text-sm font-bold dark:text-gray-300 text-gray-600 uppercase tracking-wider"
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-gray-400 text-lg font-medium"
              >
                Loading requests...
              </td>
            </tr>
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-gray-200 dark:hover:bg-gray-600/20 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-6 py-4 whitespace-nowrap text-base text-gray-700"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="py-8 text-center text-gray-400 text-lg font-medium"
              >
                No requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StatusTable;
