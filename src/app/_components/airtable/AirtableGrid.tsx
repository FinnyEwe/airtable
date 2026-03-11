"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { api } from "~/trpc/react";

type GridRow = Record<string, string | null> & { id: string };

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

function NumberIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
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

function columnTypeIcon(type: string) {
  switch (type) {
    case "number":
      return <NumberIcon />;
    default:
      return <TextFieldIcon />;
  }
}

function ColumnHeader({ type, label }: { type: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400">{columnTypeIcon(type)}</span>
      <span>{label}</span>
    </div>
  );
}

export function AirtableGrid({ tableId, viewId }: { tableId?: string; viewId?: string }) {
  const { data, isLoading } = api.tableData.getTableData.useQuery(
    { tableId: tableId!, viewId },
    { enabled: !!tableId },
  );

  const tableData = useMemo<GridRow[]>(() => {
    if (!data) return [];
    return data.rows.map((row) => {
      const record: GridRow = { id: row.id };
      for (const cell of row.cells) {
        record[cell.columnId] = cell.value ?? null;
      }
      return record;
    });
  }, [data]);

  const columns = useMemo<ColumnDef<GridRow>[]>(() => {
    const rowExpandCol: ColumnDef<GridRow> = {
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
    };

    if (!data?.columns.length) return [rowExpandCol];

    const dataCols: ColumnDef<GridRow>[] = data.columns.map((col) => ({
      id: col.id,
      accessorKey: col.id,
      header: () => <ColumnHeader type={col.type} label={col.name} />,
      size: 180,
    }));

    return [rowExpandCol, ...dataCols];
  }, [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <span className="text-[13px] text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-white">
      <div className="flex-1 overflow-auto">
        <table className="border-collapse" style={{ tableLayout: "fixed" }}>
          <colgroup>
            {table.getAllColumns().map((col) => (
              <col key={col.id} style={{ width: col.getSize() }} />
            ))}
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
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
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
                      idx === 0 ? "bg-white group-hover:bg-[#f8fbff]" : "",
                    ].join(" ")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
                <td className="h-[32px] border-b border-r border-gray-200" />
              </tr>
            ))}

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

      <div className="flex h-[28px] shrink-0 items-center justify-between border-t border-gray-200 bg-white px-3">
        <button className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700">
          <PlusIcon />
          <span>Add...</span>
        </button>
        <span className="text-[12px] text-gray-400">
          {data ? `${data.rows.length} record${data.rows.length === 1 ? "" : "s"}` : ""}
        </span>
      </div>
    </div>
  );
}
