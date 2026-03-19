import { useState, useCallback } from "react";
import type { CellPosition } from "./types";

interface UseCellSelectionReturn {
  selectedCell: CellPosition | null;
  editingCell: CellPosition | null;
  handleCellClick: (rowId: string, columnId: string) => void;
  handleCellDoubleClick: (rowId: string, columnId: string) => void;
  setSelectedCell: React.Dispatch<React.SetStateAction<CellPosition | null>>;
  setEditingCell: React.Dispatch<React.SetStateAction<CellPosition | null>>;
}

export function useCellSelection(
  gridRef: { current: HTMLElement | null }
): UseCellSelectionReturn {
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null);

  const handleCellClick = useCallback((rowId: string, columnId: string) => {
    setSelectedCell({ rowId, columnId });
    setEditingCell(null);
    gridRef.current?.focus();
  }, [gridRef]);

  const handleCellDoubleClick = useCallback((rowId: string, columnId: string) => {
    setSelectedCell({ rowId, columnId });
    setEditingCell({ rowId, columnId });
  }, []);

  return {
    selectedCell,
    editingCell,
    handleCellClick,
    handleCellDoubleClick,
    setSelectedCell,
    setEditingCell,
  };
}
