"use client";

import { useState, useMemo, useCallback } from "react";
import { api } from "~/trpc/react";
import { ToolbarDropdown } from "../ToolbarDropdown";
import { columnTypeIcon } from "../utils/columnUtils";

interface HideColumnsDropdownProps {
  tableId: string | undefined;
  viewId?: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
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
          context.previous
        );
      }
    },
    onSettled: () => {
      void utils.tableData.getTableData.invalidate({
        tableId: tableId!,
        viewId,
      });
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

  const filteredColumns = useMemo(() => {
    if (!searchQuery.trim()) return columns;
    const q = searchQuery.toLowerCase();
    return columns.filter((col) => col.name.toLowerCase().includes(q));
  }, [columns, searchQuery]);

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
    <ToolbarDropdown
      open={isOpen}
      onClose={onClose}
      anchor={anchorRef.current}
      width={320}
    >
      <ToolbarDropdown.SearchHeader
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <ToolbarDropdown.List minHeight={100}>
        {filteredColumns.length === 0 ? (
          <ToolbarDropdown.Empty>No fields match</ToolbarDropdown.Empty>
        ) : (
          <ul className="space-y-1 px-3">
            {filteredColumns.map((col) => (
              <ToolbarDropdown.ToggleRow
                key={col.id}
                checked={!hiddenColumnIds.has(col.id)}
                icon={columnTypeIcon(col.type)}
                label={col.name}
                onClick={() => handleToggleColumn(col.id)}
              />
            ))}
          </ul>
        )}
      </ToolbarDropdown.List>

      <ToolbarDropdown.Footer>
        <ToolbarDropdown.FooterAction onClick={handleHideAll}>
          Hide all
        </ToolbarDropdown.FooterAction>
        <ToolbarDropdown.FooterAction onClick={handleShowAll}>
          Show all
        </ToolbarDropdown.FooterAction>
      </ToolbarDropdown.Footer>
    </ToolbarDropdown>
  );
}
