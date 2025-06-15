// utils/formatDateTime.ts
function formatDateTime(dateTime?: string, timeZone?: string): string {
  if (!dateTime) return "-";
  try {
    return new Date(dateTime).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: timeZone || "UTC",
    });
  } catch {
    return dateTime;
  }
}

// columns/meetingsColumns.ts
import { ColumnDef } from "@tanstack/react-table";

const meetingsColumns: ColumnDef<Meetings>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => info.getValue() as string,
  },
  {
    accessorKey: "start.dateTime",
    header: "Start",
    cell: ({ row }) =>
      formatDateTime(row.original.start.dateTime, row.original.start.timeZone),
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.start.dateTime).getTime() -
      new Date(rowB.original.start.dateTime).getTime(),
  },
  {
    accessorKey: "end.dateTime",
    header: "End",
    cell: ({ row }) =>
      formatDateTime(row.original.end.dateTime, row.original.end.timeZone),
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.end.dateTime).getTime() -
      new Date(rowB.original.end.dateTime).getTime(),
  },
  {
    accessorKey: "attendees",
    header: "Attendees",
    cell: ({ row }) =>
      row.original.attendees
        ?.map((a) => a.displayName || a.emailAddress)
        .join(", ") || "-",
    enableSorting: false,
  },
  {
    accessorKey: "changeRequest.title",
    header: "Change Request",
    cell: ({ row }) => row.original.changeRequest?.title || "-",
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: (info) => (info.getValue() as string) || "-",
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: (info) => formatDateTime(info.getValue() as string),
    sortingFn: (rowA, rowB) =>
      new Date(rowA.original.createdAt).getTime() -
      new Date(rowB.original.createdAt).getTime(),
  },
];

// components/MeetingsTable.tsx
import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";

interface MeetingsTableProps {
  meetings: Meetings[];
}

const MeetingsTable: React.FC<MeetingsTableProps> = ({ meetings }) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: meetings ?? [],
    columns: meetingsColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (!meetings || meetings.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">No meetings found.</div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow p-4">
      <table className="min-w-full border-collapse">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-2 text-left bg-gray-100 cursor-pointer select-none"
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext()
                  )}
                  {header.column.getIsSorted() === "asc" && " ▲"}
                  {header.column.getIsSorted() === "desc" && " ▼"}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-2 max-w-xs truncate">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MeetingsTable;
