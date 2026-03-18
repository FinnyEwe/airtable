import { createContext, useContext } from "react";
import type { CellPosition } from "./types";

interface GridCellContextValue {
  selectedCell: CellPosition | null;
  editingCell: CellPosition | null;
  onCellClick: (rowId: string, columnId: string) => void;
  onCellDoubleClick: (rowId: string, columnId: string) => void;
  onCellUpdate: (rowId: string, columnId: string, value: string | null) => void;
  onCancelEdit: () => void;
}

export const GridCellContext = createContext<GridCellContextValue | null>(null);

export function useGridCellContext() {
  const context = useContext(GridCellContext);
  if (!context) {
    throw new Error("useGridCellContext must be used within GridCellContext.Provider");
  }
  return context;
}
