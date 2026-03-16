"use client";

import type { GridRow } from "../utils/displayItems";

interface DataColumn {
  id: string;
  name: string;
  type: string;
}

interface GridDataRowProps {
  row: GridRow;
  dataColumns: DataColumn[];
  tableData: GridRow[];
  isSelected: boolean;
  onRowSelect: (rowId: string) => void;
}

export function GridDataRow({
  row,
  dataColumns,
  tableData,
  isSelected,
  onRowSelect,
}: GridDataRowProps) {
  const rowIndex = tableData.findIndex((r) => r.id === row.id) + 1;

  return (
    <tr
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
      {dataColumns.map((col) => {
        const value = row[col.id];
        const isNumber = col.type === "number";
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
      <td className="w-[48px] border-b-0 bg-white" />
    </tr>
  );
}
