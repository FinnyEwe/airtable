"use client";

import { useReactTable, getCoreRowModel } from "@tanstack/react-table";
import { useMemo, useCallback, useRef } from "react";
import { buildDisplayItems, type GridRow } from "../utils/displayItems";
import { ColumnContextMenu } from "./ColumnContextMenu";
import { RowContextMenu } from "./RowContextMenu";
import { useKeyboardNavigation } from "./useKeyboardNavigation";
import { useCellSelection } from "./useCellSelection";
import { GridRowContext } from "./useGridRowContext";
import { GridCellContext } from "./useGridCellContext";
import { useTableData } from "./useTableData";
import { useGridState } from "./useGridState";
import { useGridColumns } from "./useGridColumns";
import { GridTable } from "./GridTable";
import { GridToolbar } from "./GridToolbar";

export function AirtableGrid({
  tableId,
  viewId,
  searchQuery = "",
}: {
  tableId?: string;
  viewId?: string;
  searchQuery?: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, mutations } = useTableData({
    tableId,
    viewId,
    searchQuery,
  });

  const {
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
  } = useGridState();

  const {
    selectedCell,
    editingCell,
    handleCellClick,
    handleCellDoubleClick,
    setSelectedCell,
    setEditingCell,
  } = useCellSelection(gridRef);

  const handleSelectAll = useCallback(() => {
    if (!data) return;
    if (selectedRows.size === data.rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.rows.map((row) => row.id)));
    }
  }, [data, selectedRows.size, setSelectedRows]);

  const isAllSelected =
    data ? selectedRows.size === data.rows.length && data.rows.length > 0 : false;
  const isSomeSelected = selectedRows.size > 0 && !isAllSelected;

  const tableData = useMemo<GridRow[]>(() => {
    if (!data) return [];
    return data.rows.map((row) => {
      const record: GridRow = { id: row.id };
      for (const cell of row.cells) {
        record[cell.columnId] = cell.value ?? null;
      }
      return record;
    });
  }, [data]);

  const displayItems = useMemo(() => {
    const groups = data?.groups ?? [];
    if (groups.length === 0) {
      return tableData.map((row) => ({ type: "row" as const, row }));
    }
    return buildDisplayItems(tableData, groups, collapsedGroupKeys);
  }, [tableData, data?.groups, collapsedGroupKeys]);

  const dataColumns = useMemo(() => {
    const hiddenSet = new Set(data?.hiddenColumnIds ?? []);
    return (data?.columns ?? []).filter((col) => !hiddenSet.has(col.id));
  }, [data?.columns, data?.hiddenColumnIds]);

  const handleDeleteColumn = (columnId: string) => {
    mutations.deleteColumn.mutate({ columnId });
    setContextMenu(null);
  };

  const handleDeleteRow = (rowId: string) => {
    mutations.deleteRow.mutate({ rowId });
    setRowContextMenu(null);
  };

  const handleAddRow = () => {
    if (!tableId) return;
    mutations.createRow.mutate({ tableId });
  };

  const handleAddColumn = () => {
    if (!tableId) return;
    mutations.createColumn.mutate({
      name: "Untitled",
      type: "text",
      tableId,
    });
  };

  const handleBulkInsert = () => {
    if (!tableId) return;
    mutations.bulkInsert.mutate({
      tableId,
      count: 10000,
    });
  };

  const handleClearAll = () => {
    if (!tableId) return;
    if (!confirm("Are you sure you want to delete all rows? This cannot be undone.")) {
      return;
    }
    mutations.clearAll.mutate({ tableId });
  };

  const { columns } = useGridColumns({
    data,
    isAllSelected,
    isSomeSelected,
    onSelectAll: handleSelectAll,
  });

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.id,
  });

  useKeyboardNavigation({
    gridRef,
    selectedCell,
    editingCell,
    displayItems,
    dataColumns,
    onCellSelect: setSelectedCell,
    onStartEdit: setEditingCell,
    onCancelEdit: () => setEditingCell(null),
  });

  const gridRowContextValue = useMemo(() => ({
    dataColumns,
    tableData,
    selectedRows,
    onRowSelect: handleRowSelect,
    onRowContextMenu: handleRowContextMenu,
  }), [dataColumns, tableData, selectedRows, handleRowSelect]);

  const gridCellContextValue = useMemo(() => ({
    selectedCell,
    editingCell,
    onCellClick: handleCellClick,
    onCellDoubleClick: handleCellDoubleClick,
    onCellUpdate: (rowId: string, columnId: string, value: string | null) => {
      mutations.updateCell.mutate({ rowId, columnId, value });
      setEditingCell(null);
    },
    onCancelEdit: () => setEditingCell(null),
  }), [selectedCell, editingCell, handleCellClick, handleCellDoubleClick, mutations.updateCell, setEditingCell]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-white">
        <span className="text-[13px] text-gray-400">Loading...</span>
      </div>
    );
  }

  return (
    <GridRowContext.Provider value={gridRowContextValue}>
      <GridCellContext.Provider value={gridCellContextValue}>
        <div 
          ref={gridRef}
          tabIndex={0}
          className="flex flex-1 flex-col overflow-hidden bg-white outline-none"
        >
          <GridTable
            table={table}
            displayItems={displayItems}
            dataColumns={dataColumns}
            collapsedGroupKeys={collapsedGroupKeys}
            onToggleGroupCollapse={toggleGroupCollapsed}
            onAddRow={handleAddRow}
            onAddColumn={handleAddColumn}
            onColumnContextMenu={handleColumnContextMenu}
            isAddingRow={mutations.createRow.isPending}
            isAddingColumn={mutations.createColumn.isPending}
          />

          <ColumnContextMenu
            open={!!contextMenu}
            onClose={() => setContextMenu(null)}
            anchor={contextMenu?.anchor ?? null}
            columnId={contextMenu?.columnId ?? ""}
            columnType={contextMenu?.columnType ?? "text"}
            isFirstColumn={contextMenu?.isFirstColumn ?? false}
            onDeleteColumn={handleDeleteColumn}
          />

          <RowContextMenu
            open={!!rowContextMenu}
            onClose={() => setRowContextMenu(null)}
            anchor={rowContextMenu?.anchor ?? null}
            rowId={rowContextMenu?.rowId ?? ""}
            onDeleteRow={handleDeleteRow}
          />

          <GridToolbar
            onAddRow={handleAddRow}
            onBulkInsert={handleBulkInsert}
            onClearAll={handleClearAll}
            isAddingRow={mutations.createRow.isPending}
            isBulkInserting={mutations.bulkInsert.isPending}
            isClearing={mutations.clearAll.isPending}
            recordCount={data?.rows.length ?? 0}
          />
        </div>
      </GridCellContext.Provider>
    </GridRowContext.Provider>
  );
}
