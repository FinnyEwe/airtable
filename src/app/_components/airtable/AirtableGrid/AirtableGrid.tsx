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
import { useRecordData } from "./useRecordData";
import { useGridState } from "./useGridState";
import { useGridColumns } from "./useGridColumns";
import { VirtualizedGridTable, type VirtualizedGridTableHandle } from "./VirtualizedGridTable";
import { GridToolbar as GridFooterToolbar } from "./GridToolbar";
import { GridToolbar as GridTopToolbar } from "../GridToolbar";
import { SearchProvider } from "./SearchContext";
import { api } from "~/trpc/react";

export function AirtableGrid({
  tableId,
  viewId,
}: {
  tableId?: string;
  viewId?: string;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const virtualizerRef = useRef<VirtualizedGridTableHandle>(null);

  const {
    selectedCell,
    editingCell,
    handleCellClick,
    handleCellDoubleClick,
    setSelectedCell,
    setEditingCell,
  } = useCellSelection(gridRef);

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

  // Don't pass searchQuery to useRecordData - we want ALL records
  const { data, isLoading, totalCount, hasNextPage, isFetchingNextPage, mutations } = useRecordData({
    tableId,
    viewId,
    searchQuery: undefined, // Changed from searchQuery to undefined
    virtualizer: virtualizerRef.current?.virtualizer,
    setSelectedCell,
    setEditingCell,
  });

  const { data: viewData } = api.view.getById.useQuery(
    { viewId: viewId! },
    { enabled: !!viewId }
  );

  const sortedColumnIds = useMemo(() => {
    return new Set(viewData?.sorts?.map((s) => s.columnId) ?? []);
  }, [viewData?.sorts]);

  const filteredColumnIds = useMemo(() => {
    return new Set(viewData?.filters?.map((f) => f.columnId) ?? []);
  }, [viewData?.filters]);

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
      count: 100000,
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
    sortedColumnIds,
    filteredColumnIds,
  });

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row: GridRow) => row.id,
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
    sortedColumnIds,
    filteredColumnIds,
  }), [dataColumns, tableData, selectedRows, handleRowSelect, handleRowContextMenu, sortedColumnIds, filteredColumnIds]);

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
    <SearchProvider tableData={tableData} dataColumns={dataColumns}>
      <div className="flex flex-1 flex-col overflow-hidden">
        <GridTopToolbar tableId={tableId} viewId={viewId} />
        
        <GridRowContext.Provider value={gridRowContextValue}>
          <GridCellContext.Provider value={gridCellContextValue}>
            <div 
              ref={gridRef}
              tabIndex={0}
              className="flex flex-1 flex-col overflow-hidden bg-white outline-none"
            >
              <VirtualizedGridTable
                ref={virtualizerRef}
                table={table}
                displayItems={displayItems}
                dataColumns={dataColumns}
                collapsedGroupKeys={collapsedGroupKeys}
                onToggleGroupCollapse={toggleGroupCollapsed}
                onAddRow={handleAddRow}
                onAddColumn={handleAddColumn}
                onColumnContextMenu={handleColumnContextMenu}
                totalCount={totalCount}
                sortedColumnIds={sortedColumnIds}
                filteredColumnIds={filteredColumnIds}
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

              <GridFooterToolbar
                onAddRow={handleAddRow}
                onBulkInsert={handleBulkInsert}
                onClearAll={handleClearAll}
                recordCount={totalCount ?? data?.rows.length ?? 0}
                isBulkInserting={mutations.bulkInsert.isPending}
              />
              
              {isFetchingNextPage && (
                <div className="fixed bottom-4 right-4 rounded bg-blue-500 px-3 py-1 text-xs text-white shadow-lg">
                  Loading more rows...
                </div>
              )}
            </div>
          </GridCellContext.Provider>
        </GridRowContext.Provider>
      </div>
    </SearchProvider>
  );
}
