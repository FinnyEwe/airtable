"use client";

import type { GridRow } from "../utils/displayItems";
import { EditableCell } from "./EditableCell";
import { useGridRowContext } from "./useGridRowContext";
import { useGridCellContext } from "./useGridCellContext";

interface GridDataRowProps {
  row: GridRow;
}

export function GridDataRow({ row }: GridDataRowProps) {
  const { dataColumns, tableData, selectedRows, onRowSelect, onRowContextMenu } = useGridRowContext();
  const { selectedCell, editingCell, onCellClick, onCellDoubleClick, onCellUpdate, onCancelEdit } = useGridCellContext();
  
  const rowIndex = tableData.findIndex((r) => r.id === row.id) + 1;
  const isSelected = selectedRows.has(row.id);

  return (
    <tr
      onContextMenu={onRowContextMenu ? (e) => onRowContextMenu(e, row.id) : undefined}
      className={[
        "group",
        isSelected ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-[#f8fbff]",
      ].join(" ")}
    >
      <td
        className={[
          "sticky left-0 z-10 h-[32px] border-b border-r border-gray-200 px-2 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]",
          isSelected
            ? "bg-blue-50 group-hover:bg-blue-100"
            : "bg-white group-hover:bg-[#f8fbff]",
        ].join(" ")}
        style={{ width: 48 }}
      >
        <div className="group/idx relative flex h-full w-full items-center justify-start text-left text-[13px] text-gray-700">
          <span className="group-hover/idx:hidden">{rowIndex}</span>
          <button
            onClick={() => onRowSelect(row.id)}
            className="absolute left-0 top-1/2 hidden h-full w-full -translate-y-1/2 items-center justify-start pl-0 group-hover/idx:flex"
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => undefined}
              className="h-4 w-4 cursor-pointer rounded border-gray-300"
              style={{ accentColor: "#2563eb" }}
            />
          </button>
        </div>
      </td>
      {dataColumns.map((col) => (
        <EditableCell
          key={col.id}
          rowId={row.id}
          columnId={col.id}
          value={row[col.id]}
          isNumber={col.type === "number"}
        />
      ))}
      <td className="w-[48px] border-b-0 bg-white" />
    </tr>
  );
}
