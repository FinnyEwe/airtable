"use client";

import { useState, useMemo, useCallback } from "react";
import { Dropdown } from "~/app/_components/ui/Dropdown";
import { api } from "~/trpc/react";
import { SearchIcon, QuestionIcon } from "../icons";
import { columnTypeIcon } from "../utils/columnUtils";
import type { Column } from "~/types/tableData";

interface HideColumnsDropdownProps {
  tableId: string | undefined;
  viewId?: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

function ColumnToggle({ checked }: { checked: boolean }) {
  return (
    <span
      role="img"
      aria-label={checked ? "Visible" : "Hidden"}
      className={`flex shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? "bg-green-500" : "bg-gray-300"
      }`}
      style={{ width: 24, height: 14 }}
    >
      <span
        className={`block h-2 w-2 shrink-0 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${
          checked ? "translate-x-[12px]" : "translate-x-0"
        }`}
        style={{ width: 8 }}
      />
    </span>
  );
}

function HideColumnsContent({
  columns,
  hiddenColumnIds,
  onToggleColumn,
  onHideAll,
  onShowAll,
  searchQuery,
  onSearchChange,
}: {
  columns: Column[];
  hiddenColumnIds: Set<string>;
  onToggleColumn: (columnId: string) => void;
  onHideAll: () => void;
  onShowAll: () => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
}) {
  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) return columns;
    const q = searchQuery.toLowerCase();
    return columns.filter(
      (col) => col.name.toLowerCase().includes(q)
    );
  }, [columns, searchQuery]);

  return (
    <div className="flex min-w-[20rem] flex-col">
      {/* Header with search */}
      <div className="flex items-center border-b border-gray-200 px-3 py-2">
        <input
          type="text"
          placeholder="Find a field"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 border-none bg-transparent px-0 py-1 text-sm text-gray-700 placeholder-gray-400 outline-none"
          autoFocus
        />
        <button
          type="button"
          className="flex items-center rounded text-gray-400 hover:text-gray-600"
          aria-label="Learn more about hiding fields"
        >
          <QuestionIcon />
        </button>
      </div>

      {/* Column list */}
      <div
        className="overflow-y-auto px-3 py-2"
        style={{
          minHeight: 100,
          maxHeight: "calc(100vh - 380px)",
        }}
      >
        {filteredColumns.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-500">
            No fields match
          </p>
        ) : (
          <ul className="space-y-1">
            {filteredColumns.map((col) => {
              const isVisible = !hiddenColumnIds.has(col.id);
              return (
                <li key={col.id}>
                  <button
                    type="button"
                    onClick={() => onToggleColumn(col.id)}
                    className="flex w-full items-center gap-3 rounded px-1 py-1.5 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <ColumnToggle checked={isVisible} />
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-500">
                      {columnTypeIcon(col.type)}
                    </span>
                    <span className="flex-1 truncate text-sm text-gray-700">
                      {col.name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Hide all / Show all */}
      <div className="border-t border-gray-200 px-3 py-2">
        <div className="flex gap-2 text-xs font-medium">
          <button
            type="button"
            onClick={onHideAll}
            className="flex-1 rounded py-1.5 text-center text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          >
            Hide all
          </button>
          <button
            type="button"
            onClick={onShowAll}
            className="flex-1 rounded py-1.5 text-center text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          >
            Show all
          </button>
        </div>
      </div>
    </div>
  );
}

export function HideColumnsDropdown({
  tableId,
  viewId,
  anchorRef,
  isOpen,
  onClose,
}: HideColumnsDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const utils = api.useUtils();
  const { data } = api.tableData.getTableData.useQuery(
    { tableId: tableId!, viewId },
    { enabled: !!tableId && isOpen }
  );

  const updateVisibility = api.view.updateColumnVisibility.useMutation({
    onMutate: async (newVisibility) => {
      if (!tableId || !viewId) return;
      await utils.tableData.getTableData.cancel({ tableId, viewId });

      const previous = utils.tableData.getTableData.getData({
        tableId,
        viewId,
      });

      utils.tableData.getTableData.setData({ tableId, viewId }, (old) => {
        if (!old) return old;
        return { ...old, hiddenColumnIds: newVisibility.hiddenColumnIds };
      });

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous && tableId && viewId) {
        utils.tableData.getTableData.setData(
          { tableId, viewId },
          context.previous,
        );
      }
    },
    onSettled: () => {
      void utils.tableData.getTableData.invalidate({ tableId: tableId!, viewId });
    },
  });

  const columns = useMemo(
    () => (data?.columns ?? []).sort((a, b) => a.order - b.order),
    [data?.columns]
  );

  const hiddenColumnIds = useMemo(
    () => new Set(data?.hiddenColumnIds ?? []),
    [data?.hiddenColumnIds]
  );

  const handleToggleColumn = useCallback(
    (columnId: string) => {
      if (!viewId) return;
      const next = new Set(hiddenColumnIds);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      updateVisibility.mutate({
        viewId,
        hiddenColumnIds: Array.from(next),
      });
    },
    [viewId, hiddenColumnIds, updateVisibility]
  );

  const handleHideAll = useCallback(() => {
    if (!viewId) return;
    updateVisibility.mutate({
      viewId,
      hiddenColumnIds: columns.map((c) => c.id),
    });
  }, [viewId, columns, updateVisibility]);

  const handleShowAll = useCallback(() => {
    if (!viewId) return;
    updateVisibility.mutate({ viewId, hiddenColumnIds: [] });
  }, [viewId, updateVisibility]);

  if (!tableId) return null;

  return (
    <Dropdown
      open={isOpen}
      onClose={onClose}
      anchor={anchorRef.current}
      content={
        <HideColumnsContent
          columns={columns}
          hiddenColumnIds={hiddenColumnIds}
          onToggleColumn={handleToggleColumn}
          onHideAll={handleHideAll}
          onShowAll={handleShowAll}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
      }
      width={320}
      maxHeight={500}
    />
  );
}
