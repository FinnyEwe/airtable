"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";

type Row = {
  id: number;
  name: string;
  notes: string;
  assignee: string;
  status: string;
  attachments: string;
  attachmentsExtra: string;
};

const defaultData: Row[] = [
  { id: 1, name: "", notes: "", assignee: "", status: "", attachments: "", attachmentsExtra: "" },
  { id: 2, name: "", notes: "", assignee: "", status: "", attachments: "", attachmentsExtra: "" },
  { id: 3, name: "", notes: "", assignee: "", status: "", attachments: "", attachmentsExtra: "" },
];

function CheckboxIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    </svg>
  );
}

function TextFieldIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="15" y2="18" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function AttachmentIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
}

function PercentIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="19" y1="5" x2="5" y2="19" />
      <circle cx="6.5" cy="6.5" r="2.5" />
      <circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ExpandRowIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function ColumnHeader({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400">{icon}</span>
      <span>{label}</span>
    </div>
  );
}

export function AirtableGrid({ tableId, viewId }: { tableId?: string; viewId?: string }) {
  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        id: "rowExpand",
        header: () => (
          <div className="flex h-full w-full items-center justify-center">
            <CheckboxIcon />
          </div>
        ),
        cell: ({ row }) => (
          <div className="group relative flex h-full w-full items-center">
            <span className="w-6 text-center text-[11px] text-gray-400">
              {row.index + 1}
            </span>
            <button className="absolute right-1 hidden h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-200 group-hover:flex">
              <ExpandRowIcon />
            </button>
          </div>
        ),
        size: 68,
      },
      {
        accessorKey: "name",
        header: () => (
          <ColumnHeader icon={<TextFieldIcon />} label="Name" />
        ),
        size: 280,
      },
      {
        accessorKey: "notes",
        header: () => (
          <ColumnHeader icon={<TextFieldIcon />} label="Notes" />
        ),
        size: 180,
      },
      {
        accessorKey: "assignee",
        header: () => (
          <ColumnHeader icon={<PersonIcon />} label="Assignee" />
        ),
        size: 145,
      },
      {
        accessorKey: "status",
        header: () => (
          <ColumnHeader icon={<StatusIcon />} label="Status" />
        ),
        cell: () => null,
        size: 145,
      },
      {
        accessorKey: "attachments",
        header: () => (
          <ColumnHeader icon={<AttachmentIcon />} label="Attachments" />
        ),
        cell: () => null,
        size: 145,
      },
      {
        accessorKey: "attachmentsExtra",
        header: () => (
          <ColumnHeader icon={<PercentIcon />} label="Attachment..." />
        ),
        cell: () => (
          <div className="flex items-center gap-1 text-[11px] text-gray-400">
            <span>Required field(s) are...</span>
            <InfoIcon />
          </div>
        ),
        size: 180,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      {/* Scrollable table area */}
      <div className="flex-1 overflow-auto">
        <table className="border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            {table.getAllColumns().map((col) => (
              <col key={col.id} style={{ width: col.getSize() }} />
            ))}
            {/* Extra column for the + button */}
            <col style={{ width: 48 }} />
          </colgroup>

          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => (
                  <th
                    key={header.id}
                    className={[
                      "h-[30px] border-b border-r border-gray-200 bg-[#f8f8f8] px-2 text-left text-[12px] font-normal text-gray-600",
                      idx === 0 ? "border-l-0" : "",
                    ].join(" ")}
                    style={{ width: header.column.getSize() }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
                {/* + column header */}
                <th className="h-[30px] border-b border-r border-gray-200 bg-[#f8f8f8] px-2 text-center">
                  <button className="flex h-full w-full items-center justify-center text-gray-400 hover:text-gray-600">
                    <PlusIcon />
                  </button>
                </th>
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="group hover:bg-[#f8fbff]">
                {row.getVisibleCells().map((cell, idx) => (
                  <td
                    key={cell.id}
                    className={[
                      "h-[32px] border-b border-r border-gray-200 px-2 text-[13px] text-gray-700",
                      idx === 0
                        ? "bg-white group-hover:bg-[#f8fbff]"
                        : "",
                    ].join(" ")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                {/* Empty extra cell */}
                <td className="h-[32px] border-b border-r border-gray-200" />
              </tr>
            ))}

            {/* Add row */}
            <tr>
              <td className="h-[32px] border-b border-r border-gray-200 px-2">
                <button className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-600">
                  <PlusIcon />
                </button>
              </td>
              <td
                className="h-[32px] border-b border-gray-200"
                colSpan={columns.length}
              />
            </tr>
          </tbody>
        </table>
      </div>

      {/* Bottom status bar */}
      <div className="flex h-[28px] shrink-0 items-center justify-between border-t border-gray-200 bg-white px-3">
        <button className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700">
          <PlusIcon />
          <span>Add...</span>
        </button>
        <span className="text-[12px] text-gray-400">3 records</span>
      </div>
    </div>
  );
}
