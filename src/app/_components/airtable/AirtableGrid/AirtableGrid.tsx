"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState, useCallback } from "react";
import { api } from "~/trpc/react";
import { PlusIcon } from "../icons";
import {
  buildDisplayItems,
  type GridRow,
  type DisplayItem,
} from "../utils/displayItems";
import { ColumnHeader } from "./ColumnHeader";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { GridDataRow } from "./GridDataRow";
import { useGridMutations } from "./useGridMutations";

export function AirtableGrid({
  tableId,
  viewId,
}: {
  tableId?: string;
  viewId?: string;
}) {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState<Set<string>>(
    new Set(),
  );

  const { data, isLoading } = api.tableData.getTableData.useQuery(
    { tableId: tableId!, viewId },
    { enabled: !!tableId },
  );

  const { createRow, createColumn } = useGridMutations({ tableId, viewId });

  const handleAddRow = () => {
    if (!tableId) return;
    createRow.mutate({
      tableId,
      createdById: "cmmllv5360000exgzm1wtm336",
    });
  };

  const handleAddColumn = () => {
    if (!tableId) return;
    createColumn.mutate({
      name: "Untitled",
      type: "text",
      tableId,
      createdById: "cmmllv5360000exgzm1wtm336",
    });
  };

  const handleSelectAll = useCallback(() => {
    if (!data) return;
    if (selectedRows.size === data.rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.rows.map((row) => row.id)));
    }
  }, [data, selectedRows.size]);

  const handleRowSelect = (rowId: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const isAllSelected =
    data ? selectedRows.size === data.rows.length && data.rows.length > 0 : false;
  const isSomeSelected = selectedRows.size > 0 && !isAllSelected;

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

  const displayItems = useMemo<DisplayItem[]>(() => {
    const groups = data?.groups ?? [];
    if (groups.length === 0) {
      return tableData.map((row) => ({ type: "row" as const, row }));
    }
    return buildDisplayItems(tableData, groups, collapsedGroupKeys);
  }, [tableData, data?.groups, collapsedGroupKeys]);

  const toggleGroupCollapsed = (key: string) => {
    setCollapsedGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const columns = useMemo<ColumnDef<GridRow>[]>(() => {
    const checkboxCol: ColumnDef<GridRow> = {
      id: "checkbox",
      header: () => (
        <button
          onClick={handleSelectAll}
          className="flex h-full w-full items-center justify-center rounded hover:bg-gray-100"
        >
          <div className="relative h-4 w-4">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={() => undefined}
              className="h-4 w-4 cursor-pointer rounded border-gray-300"
              style={{
                accentColor:
                  isAllSelected || isSomeSelected ? "#2563eb" : undefined,
              }}
            />
            {isSomeSelected && !isAllSelected && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-2 w-2 bg-blue-600" />
              </div>
            )}
          </div>
        </button>
      ),
      cell: () => null,
      size: 48,
    };

    if (!data?.columns.length) return [checkboxCol];

    const dataCols: ColumnDef<GridRow>[] = data.columns.map((col) => ({
      id: col.id,
      accessorKey: col.id,
      header: () => <ColumnHeader type={col.type} label={col.name} />,
      size: 180,
    }));

    return [checkboxCol, ...dataCols];
  }, [data, isAllSelected, isSomeSelected, handleSelectAll]);

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

  const dataColumns = data?.columns ?? [];

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
                      "h-[30px] border-b border-gray-200 bg-[#f8f8f8] px-2 text-left text-[12px] font-normal text-gray-600",
                      idx === 0 ? "border-l-0" : "border-r",
                      idx === 0
                        ? "sticky z-10 bg-[#f8f8f8] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]"
                        : "",
                    ].join(" ")}
                    style={{
                      width: header.column.getSize(),
                      ...(idx === 0 && { left: 0 }),
                    }}
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
                <th className="h-[30px] w-[48px] border-b border-r border-gray-200 bg-[#f8f8f8] px-2 text-center">
                  <button
                    onClick={handleAddColumn}
                    disabled={createColumn.isPending}
                    className="flex h-full w-full items-center justify-center text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <PlusIcon />
                  </button>
                </th>
              </tr>
            ))}
          </thead>

          <tbody>
            {displayItems.map((item) => {
              if (item.type === "groupHeader") {
                return (
                  <GroupHeaderRow
                    key={item.key}
                    item={item}
                    columns={dataColumns}
                    isCollapsed={collapsedGroupKeys.has(item.key)}
                    onToggleCollapse={() => toggleGroupCollapsed(item.key)}
                  />
                );
              }
              return (
                <GridDataRow
                  key={item.row.id}
                  row={item.row}
                  dataColumns={dataColumns}
                  tableData={tableData}
                  isSelected={selectedRows.has(item.row.id)}
                  onRowSelect={handleRowSelect}
                />
              );
            })}

            {/* Ghost row: add row */}
            <tr>
              <td className="sticky left-0 z-10 h-[32px] border-b border-r border-gray-200 bg-white px-2 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                <button
                  onClick={handleAddRow}
                  disabled={createRow.isPending}
                  className="flex h-full w-full items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                  aria-label="Insert new record in grid"
                >
                  <PlusIcon />
                </button>
              </td>
              {columns.slice(1).map((col, i) => (
                <td
                  key={col.id}
                  className={[
                    "h-[32px] border-b border-gray-200 bg-white",
                    i === columns.length - 2 ? "border-r border-gray-200" : "",
                  ].join(" ")}
                />
              ))}
              <td className="h-[32px] w-[48px] border-b-0" />
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex h-[28px] shrink-0 items-center justify-between border-t border-gray-200 bg-white px-3">
        <button
          onClick={handleAddRow}
          disabled={createRow.isPending}
          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <PlusIcon />
          <span>Add...</span>
        </button>
        <span className="text-[12px] text-gray-400">
          {data
            ? `${data.rows.length} record${data.rows.length === 1 ? "" : "s"}`
            : ""}
        </span>
      </div>
    </div>
  );
}
