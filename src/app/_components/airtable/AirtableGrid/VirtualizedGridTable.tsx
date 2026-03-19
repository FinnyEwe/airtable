"use client";

import { useRef, useImperativeHandle, forwardRef } from "react";
import { useVirtualizer, type Virtualizer } from "@tanstack/react-virtual";
import { flexRender, type Table as TanStackTable } from "@tanstack/react-table";
import type { GridRow, DisplayItem } from "../utils/displayItems";
import { PlusIcon } from "../icons";
import { GroupHeaderRow } from "./GroupHeaderRow";
import { GridDataRow } from "./GridDataRow";
import { COLUMN_WIDTHS } from "./constants";

const ROW_HEIGHT = 32;

interface VirtualizedGridTableProps {
  table: TanStackTable<GridRow>;
  displayItems: DisplayItem[];
  dataColumns: Array<{ id: string; name: string; type: string }>;
  collapsedGroupKeys: Set<string>;
  onToggleGroupCollapse: (key: string) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onColumnContextMenu: (
    e: React.MouseEvent<HTMLTableCellElement>,
    columnId: string,
    columnType: string,
    isFirstColumn: boolean,
  ) => void;
  totalCount?: number;
}

export interface VirtualizedGridTableHandle {
  virtualizer: Virtualizer<HTMLDivElement, Element>;
}

export const VirtualizedGridTable = forwardRef<VirtualizedGridTableHandle, VirtualizedGridTableProps>(
  function VirtualizedGridTable(
    {
      table,
      displayItems,
      dataColumns,
      collapsedGroupKeys,
      onToggleGroupCollapse,
      onAddRow,
      onAddColumn,
      onColumnContextMenu,
      totalCount,
    },
    ref
  ) {
  const columns = table.getAllColumns();
  const parentRef = useRef<HTMLDivElement>(null);

  // Use totalCount if available (from first page), otherwise use displayItems length
  const itemCount = totalCount ?? displayItems.length;

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10, // Render 10 extra rows above/below viewport
  });

  // Expose virtualizer to parent via ref
  useImperativeHandle(ref, () => ({
    virtualizer,
  }), [virtualizer]);

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div ref={parentRef} className="flex-1 overflow-auto">
      <table className="border-collapse" style={{ tableLayout: "fixed" }}>
        <colgroup>
          {columns.map((col) => (
            <col key={col.id} style={{ width: col.getSize() }} />
          ))}
          <col style={{ width: COLUMN_WIDTHS.ADD_BUTTON }} />
        </colgroup>

        <thead className="sticky top-0 z-20">
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
                  onContextMenu={
                    header.column.id !== "checkbox"
                      ? (e) => {
                          const col = dataColumns.find((c) => c.id === header.column.id);
                          onColumnContextMenu(
                            e,
                            header.column.id,
                            col?.type ?? "text",
                            idx === 1,
                          );
                        }
                      : undefined
                  }
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
              <th 
                className="border-b border-r border-gray-200 bg-[#f8f8f8] px-2 text-center"
                style={{ height: 30, width: COLUMN_WIDTHS.ADD_BUTTON }}
              >
                <button
                  onClick={onAddColumn}
                  className="flex h-full w-full items-center justify-center text-gray-400 hover:text-gray-600"
                >
                  <PlusIcon />
                </button>
              </th>
            </tr>
          ))}
        </thead>

        <tbody>
          {/* Spacer for rows above viewport */}
          {virtualItems.length > 0 && (
            <tr>
              <td style={{ height: virtualItems[0]?.start ?? 0 }} />
            </tr>
          )}

          {/* Render only visible rows */}
          {virtualItems.map((virtualRow) => {
            const item = displayItems[virtualRow.index];
            if (!item) return null;

            if (item.type === "groupHeader") {
              return (
                <GroupHeaderRow
                  key={item.key}
                  item={item}
                  columns={dataColumns}
                  isCollapsed={collapsedGroupKeys.has(item.key)}
                  onToggleCollapse={() => onToggleGroupCollapse(item.key)}
                />
              );
            }
            return <GridDataRow key={item.row.id} row={item.row} />;
          })}

          {/* Spacer for rows below viewport */}
          {virtualItems.length > 0 && (
            <tr>
              <td 
                style={{ 
                  height: Math.max(
                    0,
                    virtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end ?? 0)
                  ) 
                }} 
              />
            </tr>
          )}

          {/* Add row button */}
          <tr>
            <td 
              className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white px-2 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
              style={{ height: 32 }}
            >
              <button
                onClick={onAddRow}
                className="flex h-full w-full items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Insert new record in grid"
              >
                <PlusIcon />
              </button>
            </td>
            {columns.slice(1).map((col, i) => (
              <td
                key={col.id}
                style={{ height: 32 }}
                className={[
                  "border-b border-gray-200 bg-white",
                  i === columns.length - 2 ? "border-r border-gray-200" : "",
                ].join(" ")}
              />
            ))}
            <td 
              className="border-b-0" 
              style={{ height: 32, width: COLUMN_WIDTHS.ADD_BUTTON }}
            />
          </tr>
        </tbody>
      </table>
    </div>
  );
});
