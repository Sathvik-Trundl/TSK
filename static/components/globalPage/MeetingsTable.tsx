import React, { useState, useRef, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Users2 } from "lucide-react";

interface Attendee {
  displayName?: string;
  emailAddress?: string;
}

const AttendeesAccordion: React.FC<{ attendees?: Attendee[] }> = ({
  attendees,
}) => {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Bonus: Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !popupRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  if (!attendees || attendees.length === 0) return <span>-</span>;

  const names = attendees.map(
    (a) => a.displayName || a.emailAddress || "Attendee"
  );

  // For button: Show first + count
  const label =
    names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        className="flex items-center gap-1 text-xs text-gray-700 dark:text-gray-200 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-expanded={open}
        title="Show attendees"
      >
        <Users2 className="w-4 h-4 opacity-60" />
        <span className="text-xs">{label}</span>
        {open ? (
          <ChevronUp className="w-3 h-3 opacity-60" />
        ) : (
          <ChevronDown className="w-3 h-3 opacity-60" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.18 }}
            className=" mt-2 min-w-[200px] rounded shadow-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-2 px-4"
          >
            <div className="font-semibold mb-2 text-xs text-gray-700 dark:text-gray-300">
              Attendees
            </div>
            <ul className="space-y-1">
              {attendees.map((a, idx) => (
                <li
                  key={idx}
                  className="text-xs text-gray-800 dark:text-gray-200"
                >
                  {a.displayName || a.emailAddress}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface Attendee {
  displayName?: string;
  emailAddress?: string;
}

interface Meetings {
  name: string;
  attendees?: Attendee[];
  changeRequest?: { title: string };
}

const meetingsColumns: ColumnDef<Meetings>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: (info) => (
      <span className="flex items-center gap-2 font-medium text-sky-700 dark:text-sky-300">
        {info.getValue() as string}
      </span>
    ),
    size: 220,
  },
  {
    accessorKey: "attendees",
    header: "Attendees",
    cell: ({ row }) => (
      <AttendeesAccordion attendees={row.original.attendees} />
    ),
    enableSorting: false,
    size: 220,
  },
  {
    accessorKey: "changeRequest.title",
    header: "Change Request",
    cell: ({ row }) => (
      <span className="truncate block max-w-[160px]">
        {row.original.changeRequest?.title || "-"}
      </span>
    ),
    size: 180,
  },
];

interface MeetingsTableProps {
  meetings: Meetings[];
}

const MeetingsTable: React.FC<MeetingsTableProps> = ({ meetings }) => {
  const [sorting, setSorting] = useState<SortingState>([]);

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
      <div className="p-6 text-center text-gray-400 text-base">
        No meetings found.
      </div>
    );
  }

  return (
    <div className="rounded-xl shadow-lg border border-gray-200 overflow-x-auto bg-white dark:bg-gray-800/60">
      <AnimatePresence>
        <table className="min-w-full table-fixed">
          <colgroup>
            <col style={{ width: "220px" }} />
            <col style={{ width: "220px" }} />
            <col style={{ width: "180px" }} />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-bold dark:text-gray-300 text-gray-600 uppercase tracking-wider bg-gray-100 dark:bg-gray-700/80 sticky top-0 z-10"
                  >
                    <span className="flex items-center gap-1 select-none cursor-pointer">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-sky-50 dark:hover:bg-gray-700/40 transition"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 whitespace-nowrap text-base text-gray-800 dark:text-gray-200 max-w-xs truncate"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </AnimatePresence>
    </div>
  );
};

export default MeetingsTable;
