import { createContext, useContext } from "react";
import type { DataColumn } from "./types";
import type { GridRow } from "../utils/displayItems";

interface GridRowContextValue {
  dataColumns: DataColumn[];
  tableData: GridRow[];
  selectedRows: Set<string>;
  onRowSelect: (rowId: string) => void;
  onRowContextMenu?: (e: React.MouseEvent<HTMLTableRowElement>, rowId: string) => void;
}

export const GridRowContext = createContext<GridRowContextValue | null>(null);

export function useGridRowContext() {
  const context = useContext(GridRowContext);
  if (!context) {
    throw new Error("useGridRowContext must be used within GridRowContext.Provider");
  }
  return context;
}
