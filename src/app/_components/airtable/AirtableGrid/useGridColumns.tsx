import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type { GridRow } from "../utils/displayItems";
import { ColumnHeader } from "./ColumnHeader";
import { COLUMN_WIDTHS } from "./constants";

interface UseGridColumnsProps {
  data: {
    columns: Array<{ id: string; name: string; type: string }>;
    hiddenColumnIds?: string[];
  } | undefined;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  onSelectAll: () => void;
  sortedColumnIds: Set<string>;
  filteredColumnIds: Set<string>;
}

export function useGridColumns({
  data,
  isAllSelected,
  isSomeSelected,
  onSelectAll,
  sortedColumnIds,
  filteredColumnIds,
}: UseGridColumnsProps) {
  const columns = useMemo<ColumnDef<GridRow>[]>(() => {
    const checkboxCol: ColumnDef<GridRow> = {
      id: "checkbox",
      header: () => {
        return (
          <button
            onClick={onSelectAll}
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
        );
      },
      cell: () => null,
      size: COLUMN_WIDTHS.CHECKBOX,
    };

    if (!data?.columns.length) return [checkboxCol];

    const hiddenSet = new Set(data.hiddenColumnIds ?? []);
    const visibleColumns = data.columns.filter((col) => !hiddenSet.has(col.id));

    const dataCols: ColumnDef<GridRow>[] = visibleColumns.map((col) => ({
      id: col.id,
      accessorKey: col.id,
      header: () => <ColumnHeader type={col.type} label={col.name} />,
      size: COLUMN_WIDTHS.DEFAULT,
    }));

    return [checkboxCol, ...dataCols];
  }, [data, isAllSelected, isSomeSelected, onSelectAll, sortedColumnIds, filteredColumnIds]);

  return { columns };
}
