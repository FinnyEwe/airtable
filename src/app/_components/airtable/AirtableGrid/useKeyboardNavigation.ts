import { useEffect } from "react";
import type { GridRow, DisplayItem } from "../utils/displayItems";
import type { DataColumn, CellPosition } from "./types";

interface UseKeyboardNavigationProps {
  gridRef: { current: HTMLElement | null };
  selectedCell: CellPosition | null;
  editingCell: CellPosition | null;
  displayItems: DisplayItem[];
  dataColumns: DataColumn[];
  onCellSelect: (position: CellPosition) => void;
  onStartEdit: (position: CellPosition) => void;
  onCancelEdit: () => void;
}

export function useKeyboardNavigation({
  gridRef,
  selectedCell,
  editingCell,
  displayItems,
  dataColumns,
  onCellSelect,
  onStartEdit,
  onCancelEdit,
}: UseKeyboardNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      if (editingCell) return;

      const dataRows = displayItems
        .filter((item): item is { type: "row"; row: GridRow } => item.type === "row")
        .map((item) => item.row);

      const currentRowIndex = dataRows.findIndex((r) => r.id === selectedCell.rowId);
      const currentColIndex = dataColumns.findIndex((c) => c.id === selectedCell.columnId);

      if (currentRowIndex === -1 || currentColIndex === -1) return;

      let newRowIndex = currentRowIndex;
      let newColIndex = currentColIndex;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          newRowIndex = Math.max(0, currentRowIndex - 1);
          break;
        case "ArrowDown":
          e.preventDefault();
          newRowIndex = Math.min(dataRows.length - 1, currentRowIndex + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          newColIndex = Math.max(0, currentColIndex - 1);
          break;
        case "ArrowRight":
          e.preventDefault();
          newColIndex = Math.min(dataColumns.length - 1, currentColIndex + 1);
          break;
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            newColIndex = currentColIndex - 1;
            if (newColIndex < 0) {
              newRowIndex = currentRowIndex - 1;
              newColIndex = dataColumns.length - 1;
            }
            if (newRowIndex < 0) {
              newRowIndex = 0;
              newColIndex = 0;
            }
          } else {
            newColIndex = currentColIndex + 1;
            if (newColIndex >= dataColumns.length) {
              newRowIndex = currentRowIndex + 1;
              newColIndex = 0;
            }
            if (newRowIndex >= dataRows.length) {
              newRowIndex = dataRows.length - 1;
              newColIndex = dataColumns.length - 1;
            }
          }
          break;
        case "Enter":
          e.preventDefault();
          onStartEdit({ rowId: selectedCell.rowId, columnId: selectedCell.columnId });
          return;
        case "Escape":
          e.preventDefault();
          onCancelEdit();
          return;
        default:
          return;
      }

      if (newRowIndex !== currentRowIndex || newColIndex !== currentColIndex) {
        onCellSelect({
          rowId: dataRows[newRowIndex]!.id,
          columnId: dataColumns[newColIndex]!.id,
        });
      }
    };

    const gridElement = gridRef.current;
    if (gridElement) {
      gridElement.addEventListener("keydown", handleKeyDown);
      return () => gridElement.removeEventListener("keydown", handleKeyDown);
    }
  }, [selectedCell, displayItems, dataColumns, editingCell, gridRef, onCellSelect, onStartEdit, onCancelEdit]);
}
