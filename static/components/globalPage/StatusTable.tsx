import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import PhaseLozenge from "../appEssentials/Lozenge";
import { Check, Edit2, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { trpcReact } from "@trpcClient/index";

const convertToChangeRequestForm = (
  changeRequest: ChangeRequest
): ChangeRequestForm => {
  return {
    id: changeRequest.id,
    additionalInfo: changeRequest.additionalInfo,
    description: changeRequest.description,
    impact: changeRequest.impact,
    reason: changeRequest.reason,
    title: changeRequest.title,
    projectId: changeRequest.project.id,
    issueIds: changeRequest.issueIds,
    requiredApprovals: changeRequest.requiredApprovals.map(
      (item) => item.accountId
    ),
    requestedBy: changeRequest.requestedBy.accountId,
  };
};

type ButtonDef = {
  key: string;
  label: string;
  icon: JSX.Element;
  className: string;
  title: string;
  onClick: () => void;
  show: boolean;
};

function getButtons(
  row: ChangeRequest,
  onApprove: (id: string, phase: Phase) => void,
  onReject: (id: string, phase: Phase) => void,
  onEdit: (request: ChangeRequestForm) => void,
  onDelete: (id: string) => void
): ButtonDef[] {
  const phase = row.phase.toLowerCase()
  const approver = row?.approver;

  const handlers = {
    approve: () => onApprove(row.id, row.phase),
    reject: () => onReject(row.id, row.phase),
    edit: () => onEdit(convertToChangeRequestForm(row)),
    delete: () => onDelete(row.id),
  };

  let btns: ButtonDef[] = [
    {
      key: "edit",
      label: "Edit",
      icon: <Edit2 className="flex-shrink-0" width={18} />,
      className: "bg-blue-600 hover:bg-blue-700",
      title: "Edit",
      onClick: handlers.edit,
      show: true,
    },
    {
      key: "delete",
      label: "Delete",
      icon: <Trash2 className="flex-shrink-0" width={18} />,
      className: "bg-red-600 hover:bg-red-700",
      title: "Delete",
      onClick: handlers.delete,
      show: true,
    },
  ];

  if (
    (phase.toLowerCase() === "validation pending".toLowerCase() ||
      phase.toLowerCase() === "In-Progress".toLowerCase()) &&
    approver
  ) {
    btns = [
      {
        key: "approve",
        label: "Approve",
        icon: <Check className="flex-shrink-0" width={18} />,
        className: "bg-teal-700 hover:bg-green-600",
        title: "Approve",
        onClick: handlers.approve,
        show: true,
      },
      {
        key: "reject",
        label: "Reject",
        icon: <X className="flex-shrink-0" width={18} />,
        className: "bg-orange-700 hover:bg-red-600",
        title: "Reject",
        onClick: handlers.reject,
        show: true,
      },
      ...btns,
    ];
  }
  return btns.filter((b) => b.show);
}

const ActionButtonGroup: React.FC<{ buttons: ButtonDef[] }> = ({ buttons }) => (
  <div className="flex gap-1 w-full justify-center">
    {buttons.map((btn) => (
      <motion.button
        key={btn.key}
        type="button"
        className={`
          group flex items-center overflow-hidden rounded
          px-1.5 py-1 text-white transition-all duration-200
          w-[32px] hover:w-full max-w-[90px] text-sm shadow ${btn.className}
        `}
        title={btn.title}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.97 }}
        onClick={btn.onClick}
      >
        {btn.icon}
        <span
          className={`
            ml-1 whitespace-nowrap
            max-w-0 group-hover:max-w-fit
            opacity-0 group-hover:opacity-100
            transition-all duration-200 
          `}
        >
          {btn.label}
        </span>
      </motion.button>
    ))}
  </div>
);

function getColumns(
  onSelect: (request: ChangeRequest) => void,
  onApprove: (id: string, phase: Phase) => void,
  onReject: (id: string, phase: Phase) => void,
  onEdit: (request: ChangeRequestForm) => void,
  onDelete: (id: string) => void
): ColumnDef<ChangeRequest>[] {
  return [
    {
      accessorKey: "title",
      header: "Request Name",
      size: 220,
      cell: (info) => (
        <button
          onClick={() => onSelect(info.row.original)}
          className="dark:text-sky-500 text-blue-600 font-semibold hover:underline transition w-full text-left truncate"
        >
          {info.getValue() as string}
        </button>
      ),
    },
    {
      accessorKey: "phase",
      header: "Phase",
      size: 120,
      cell: (info) => <PhaseLozenge phase={info.getValue() as Phase} />,
    },
    {
      id: "actions",
      header: "Actions",
      size: 128, // Very compact!
      cell: (info) => (
        <ActionButtonGroup
          buttons={getButtons(
            info.row.original,
            (id, phase) => onApprove(id, phase),
            (id, phase) => onReject(id, phase),
            (request) => onEdit(request),
            (id) => onDelete(id)
          )}
        />
      ),
    },
  ];
}

interface StatusTableProps {
  requests: ChangeRequest[];
  onSelect: (request: ChangeRequest) => void;
  onApprove: (id: string, phase: Phase) => void;
  onReject: (id: string, phase: Phase) => void;
  onEdit: (request: ChangeRequestForm) => void;
  isLoading?: boolean;
}

const StatusTable: React.FC<StatusTableProps> = ({
  requests,
  onSelect,
  onApprove,
  onReject,
  onEdit,
  isLoading,
}) => {
  const deleteChangeRequest =
    trpcReact.globalPage.deleteChangeRequest.useMutation();

  const trpcContext = trpcReact.useUtils();
  const onDelete = React.useCallback(
    (id: string) => {
      deleteChangeRequest.mutate(
        { id },
        {
          onSuccess: () => {
            trpcContext.globalPage.getAllChangeRequests.refetch();
          },
        }
      );
    },
    [deleteChangeRequest, trpcContext]
  );

  const columns = React.useMemo(
    () => getColumns(onSelect, onApprove, onReject, onEdit, onDelete),
    [onSelect, onApprove, onReject, onEdit, onDelete]
  );

  const table = useReactTable({
    data: requests,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: { onApprove, onReject, onEdit },
  });

  return (
    <div className="rounded-md shadow-lg border border-gray-200 overflow-x-auto bg-white dark:bg-gray-700/20">
      <AnimatePresence>
        <table className="min-w-full table-fixed">
          <colgroup>
            <col style={{ width: "220px" }} />
            <col style={{ width: "120px" }} />
            <col style={{ width: "128px" }} />
          </colgroup>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-xs font-bold dark:text-gray-300 text-gray-600 uppercase tracking-wider dark:bg-gray-700/80"
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
                  className="hover:bg-gray-100 dark:hover:bg-gray-800/40 transition"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-3 whitespace-nowrap text-base text-gray-700 dark:text-gray-200"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
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
      </AnimatePresence>
    </div>
  );
};
export default StatusTable;
