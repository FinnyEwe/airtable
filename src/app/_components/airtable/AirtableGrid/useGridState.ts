import { useState, useCallback } from "react";
import type { ContextMenuState, RowContextMenuState } from "./types";

export function useGridState() {
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [collapsedGroupKeys, setCollapsedGroupKeys] = useState<Set<string>>(
    new Set(),
  );
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);
  const [rowContextMenu, setRowContextMenu] = useState<RowContextMenuState | null>(null);

  const handleRowSelect = (rowId: string) => {
    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const toggleGroupCollapsed = (key: string) => {
    setCollapsedGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleColumnContextMenu = (
    e: React.MouseEvent<HTMLTableCellElement>,
    columnId: string,
    columnType: string,
    isFirstColumn: boolean,
  ) => {
    e.preventDefault();
    setContextMenu({ anchor: e.currentTarget, columnId, columnType, isFirstColumn });
  };

  const handleRowContextMenu = (
    e: React.MouseEvent<HTMLTableRowElement>,
    rowId: string,
  ) => {
    e.preventDefault();
    setRowContextMenu({ anchor: e.currentTarget, rowId });
  };

  return {
    selectedRows,
    setSelectedRows,
    collapsedGroupKeys,
    contextMenu,
    setContextMenu,
    rowContextMenu,
    setRowContextMenu,
    handleRowSelect,
    toggleGroupCollapsed,
    handleColumnContextMenu,
    handleRowContextMenu,
  };
}
