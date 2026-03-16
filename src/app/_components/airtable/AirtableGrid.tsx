"use client";

import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { api } from "~/trpc/react";
import {
  TextFieldIcon,
  NumberIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  OverflowIcon,
} from "./icons";

type GridRow = Record<string, string | null> & { id: string };

type GroupLevel = { columnId: string; direction: string; order: number };
type DisplayItem =
  | { type: "groupHeader"; key: string; value: string; count: number; columnId: string; depth: number }
  | { type: "row"; row: GridRow };

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

function buildDisplayItems(
  rows: GridRow[],
  groups: GroupLevel[],
  collapsedKeys: Set<string>,
  depth = 0,
  parentKey = ""
): DisplayItem[] {
  if (groups.length === 0 || depth >= groups.length) {
    return rows.map((row) => ({ type: "row", row }));
  }
  const col = groups[depth];
  if (!col) return rows.map((row) => ({ type: "row", row }));

  const partitions = new Map<string, GridRow[]>();
  for (const row of rows) {
    const val = (row[col.columnId] ?? "") as string;
    const key = val || "(empty)";
    if (!partitions.has(key)) partitions.set(key, []);
    partitions.get(key)!.push(row);
  }

  const keys = [...partitions.keys()].sort((a, b) => a.localeCompare(b));
  if (col.direction === "desc") keys.reverse();

  const result: DisplayItem[] = [];
  for (const key of keys) {
    const fullKey = parentKey ? `${parentKey}::${key}` : key;
    const subRows = partitions.get(key)!;
    result.push({
      type: "groupHeader",
      key: fullKey,
      value: key,
      count: subRows.length,
      columnId: col.columnId,
      depth,
    });
    if (!collapsedKeys.has(fullKey)) {
      result.push(
        ...buildDisplayItems(subRows, groups, collapsedKeys, depth + 1, fullKey),
      );
    }
  }
  return result;
}

export function AirtableGrid({ tableId, viewId }: { tableId?: string; viewId?: string }) {
  const utils = api.useUtils();
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState<Set<string>>(new Set());

  const { data, isLoading } = api.tableData.getTableData.useQuery(
    { tableId: tableId!, viewId },
    { enabled: !!tableId },
  );

  const createRow = api.row.create.useMutation({
    onMutate: async () => {
      await utils.tableData.getTableData.cancel({ tableId: tableId!, viewId });
      
      const previousData = utils.tableData.getTableData.getData({ tableId: tableId!, viewId });
      
      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            rows: [...old.rows, {
              id: `temp-${Date.now()}`,
              order: old.rows.length,
              cells: []
            }]
          };
        }
      );
      
      return { previousData };
    },
    onSuccess: (newRow, _variables, context) => {
      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            rows: old.rows.map(row => 
              row.id.startsWith('temp-') ? { ...row, id: newRow.id, order: newRow.order } : row
            )
          };
        }
      );
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(
          { tableId: tableId!, viewId },
          context.previousData
        );
      }
    },
  });

  const createColumn = api.column.create.useMutation({
    onMutate: async () => {
      await utils.tableData.getTableData.cancel({ tableId: tableId!, viewId });
      
      const previousData = utils.tableData.getTableData.getData({ tableId: tableId!, viewId });
      
      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            columns: [...old.columns, {
              id: `temp-${Date.now()}`,
              name: "Untitled",
              type: "text",
              order: old.columns.length,
              config: null
            }]
          };
        }
      );
      
      return { previousData };
    },
    onSuccess: (newColumn, _variables, context) => {
      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            columns: old.columns.map(col => 
              col.id.startsWith('temp-') 
                ? { ...col, id: newColumn.id, order: newColumn.order } 
                : col
            )
          };
        }
      );
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(
          { tableId: tableId!, viewId },
          context.previousData
        );
      }
    },
  });

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

  const handleSelectAll = () => {
    if (!data) return;
    if (selectedRows.size === data.rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.rows.map(row => row.id)));
    }
  };

  const handleRowSelect = (rowId: string) => {
    setSelectedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const isAllSelected = data ? selectedRows.size === data.rows.length && data.rows.length > 0 : false;
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

  const groups = data?.groups ?? [];
  const displayItems = useMemo<DisplayItem[]>(() => {
    if (groups.length === 0) {
      return tableData.map((row) => ({ type: "row" as const, row }));
    }
    return buildDisplayItems(tableData, groups, collapsedGroupKeys);
  }, [tableData, groups, data?.columns, collapsedGroupKeys]);

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
              onChange={() => {}}
              className="h-4 w-4 cursor-pointer rounded border-gray-300"
              style={{
                accentColor: isAllSelected || isSomeSelected ? "#2563eb" : undefined,
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
  }, [data, selectedRows, isAllSelected, isSomeSelected]);

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
                      "h-[30px] border-b border-gray-200 bg-[#f8f8f8] px-2 text-left text-[12px] font-normal text-gray-600",
                      idx === 0 ? "border-l-0" : "border-r",
                      idx === 0 ? "sticky z-10 bg-[#f8f8f8] shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]" : "",
                    ].join(" ")}
                    style={{
                      width: header.column.getSize(),
                      ...(idx === 0 && { left: 0 }),
                    }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
                const col = data?.columns.find((c) => c.id === item.columnId);
                const isCollapsed = collapsedGroupKeys.has(item.key);
                return (
                  <tr
                    key={item.key}
                    className="bg-[#f8fafc] hover:bg-[#f1f5f9]"
                  >
                    {/* Column 1: chevron (when grouping) - sticky */}
                    <td
                      className="sticky left-0 z-10 border-b border-r border-gray-200 bg-[#f8fafc] px-1 py-1 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
                      style={{ width: 48 }}
                    >
                      <button
                        type="button"
                        onClick={() => toggleGroupCollapsed(item.key)}
                        className="flex h-full w-full items-center justify-start pl-1 text-gray-500 hover:text-gray-700"
                        style={{ paddingLeft: `${item.depth * 16 + 4}px` }}
                        aria-expanded={!isCollapsed}
                      >
                        {isCollapsed ? (
                          <ChevronRightIcon />
                        ) : (
                          <ChevronDownIcon />
                        )}
                      </button>
                    </td>
                    {/* Data columns: group content in first cell, rest empty */}
                    {columns.slice(1).map((dataCol, colIndex) => {
                      const isFirstCell = colIndex === 0;
                      return (
                        <td
                          key={dataCol.id}
                          className="border-b border-r border-gray-200 px-2 py-1"
                        >
                          {isFirstCell ? (
                            <div className="flex h-full min-h-[40px] items-center gap-2">
                              <div className="flex min-w-0 flex-1 flex-col justify-center py-1 text-left">
                                <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                                  {col?.name ?? "Field"}
                                </p>
                                <span className="text-[14px] font-semibold text-gray-800">
                                  {item.value}
                                </span>
                              </div>
                              <div className="group/count relative flex h-7 w-7 shrink-0 items-center justify-center">
                                <span className="text-[12px] font-normal text-gray-500 group-hover/count:hidden">
                                  {item.count}
                                </span>
                                <button
                                  type="button"
                                  className="absolute inset-0 hidden items-center justify-center rounded text-gray-400 hover:bg-gray-200 hover:text-gray-600 group-hover/count:flex"
                                  aria-label="Group options"
                                >
                                  <OverflowIcon />
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </td>
                      );
                    })}
                    {/* Add column spacer - stays white so row hover doesn't extend into it */}
                    <td className="border-b-0 w-[48px] bg-white" />
                  </tr>
                );
              }
              const row = item.row;
              const isSelected = selectedRows.has(row.id);
              return (
                <tr
                  key={row.id}
                  className={[
                    "group",
                    isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-[#f8fbff]",
                  ].join(" ")}
                >
                  {/* Column 1: row number + checkbox on hover - sticky */}
                  <td
                    className={[
                      "sticky left-0 z-10 h-[32px] border-b border-r border-gray-200 px-2 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]",
                      isSelected ? "bg-blue-50 group-hover:bg-blue-100" : "bg-white group-hover:bg-[#f8fbff]",
                    ].join(" ")}
                    style={{ width: 48 }}
                  >
                    <div className="group/idx relative flex h-full w-full items-center justify-start text-left text-[13px] text-gray-700">
                      <span className="group-hover/idx:hidden">
                        {tableData.findIndex((r) => r.id === row.id) + 1}
                      </span>
                      <button
                        onClick={() => handleRowSelect(row.id)}
                        className="absolute left-0 top-1/2 hidden h-full w-full -translate-y-1/2 items-center justify-start pl-0 group-hover/idx:flex"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="h-4 w-4 cursor-pointer rounded border-gray-300"
                          style={{ accentColor: "#2563eb" }}
                        />
                      </button>
                    </div>
                  </td>
                  {/* Data columns */}
                  {columns.slice(1).map((col) => {
                    const value = row[col.id!];
                    const isNumber = data?.columns.find((c) => c.id === col.id)?.type === "number";
                    return (
                      <td
                        key={col.id}
                        className={[
                          "h-[32px] border-b border-gray-200 px-2 text-[13px] text-gray-700 border-r",
                          isNumber ? "text-right" : "text-left",
                        ].join(" ")}
                      >
                        {value ?? ""}
                      </td>
                    );
                  })}
                  {/* Add column spacer - stays white so row hover doesn't extend into it */}
                  <td className="w-[48px] border-b-0 bg-white" />
                </tr>
              );
            })}

            {/* Ghost row: add row plus in first column (left pane), add column column empty */}
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
          {data ? `${data.rows.length} record${data.rows.length === 1 ? "" : "s"}` : ""}
        </span>
      </div>
    </div>
  );
}
