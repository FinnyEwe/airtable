"use client";

import { ChevronDownIcon, ChevronRightIcon, OverflowIcon } from "../icons";
import type { DisplayItem } from "../utils/displayItems";

interface Column {
  id: string;
  name: string;
  type: string;
}

interface GroupHeaderRowProps {
  item: Extract<DisplayItem, { type: "groupHeader" }>;
  columns: Column[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function GroupHeaderRow({
  item,
  columns,
  isCollapsed,
  onToggleCollapse,
}: GroupHeaderRowProps) {
  const col = columns.find((c) => c.id === item.columnId);
  const dataColumns = columns;

  return (
    <tr className="bg-[#f8fafc] hover:bg-[#f1f5f9]">
      <td
        className="sticky left-0 z-10 border-b border-r border-gray-200 bg-[#f8fafc] px-1 py-1 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]"
        style={{ width: 48 }}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
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
      {dataColumns.map((dataCol, colIndex) => {
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
      <td className="border-b-0 w-[48px] bg-white" />
    </tr>
  );
}
