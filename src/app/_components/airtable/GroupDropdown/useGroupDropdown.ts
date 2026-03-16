"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "~/trpc/react";
import type { GroupLevel } from "./types";

interface UseGroupDropdownProps {
  tableId: string;
  viewId?: string;
  isOpen: boolean;
}

export function useGroupDropdown({
  tableId,
  viewId,
  isOpen,
}: UseGroupDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupLevels, setGroupLevels] = useState<GroupLevel[]>([]);
  const [fieldPickerRowIndex, setFieldPickerRowIndex] = useState<number | null>(
    null,
  );
  const fieldButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sortButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const addSubgroupButtonRef = useRef<HTMLButtonElement | null>(null);
  const [sortDropdownIndex, setSortDropdownIndex] = useState<number | null>(
    null,
  );

  const utils = api.useUtils();
  const { data } = api.tableData.getTableData.useQuery(
    { tableId, viewId },
    { enabled: !!tableId && isOpen },
  );
  const { data: viewData } = api.view.getById.useQuery(
    { viewId: viewId! },
    { enabled: !!viewId && isOpen },
  );

  const columns = data?.columns ?? [];
  const filteredColumns = searchQuery
    ? columns.filter((col) =>
        col.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : columns;

  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFieldPickerRowIndex(null);
      setSortDropdownIndex(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && viewData?.groups) {
      setGroupLevels(
        viewData.groups.map((g) => ({
          columnId: g.columnId,
          sortDirection: g.direction === "desc" ? "desc" : "asc",
        })),
      );
    }
  }, [isOpen, viewData?.groups]);

  const updateGroups = api.view.updateGroups.useMutation({
    onMutate: async (newGroups) => {
      if (!viewId) return;
      await utils.view.getById.cancel({ viewId });
      await utils.tableData.getTableData.cancel({ tableId, viewId });

      const previousView = utils.view.getById.getData({ viewId });
      const previousTableData = utils.tableData.getTableData.getData({
        tableId,
        viewId,
      });

      const newGroupsFormatted = (newGroups.groups ?? []).map((g, i) => ({
        columnId: g.columnId,
        direction: g.direction,
        order: i,
      }));

      utils.view.getById.setData({ viewId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          groups: newGroupsFormatted.map((g, i) => ({
            id: `temp-${i}`,
            columnId: g.columnId,
            direction: g.direction,
            order: g.order,
          })),
        };
      });

      if (previousTableData) {
        const viewSorts = previousView?.sorts ?? [];
        const sortOrder = [
          ...newGroupsFormatted.map((g) => ({
            columnId: g.columnId,
            direction: g.direction,
          })),
          ...viewSorts.map((s) => ({
            columnId: s.columnId,
            direction: s.direction,
          })),
        ];
        const sortedRows =
          sortOrder.length > 0
            ? [...previousTableData.rows].sort((a, b) => {
                for (const sort of sortOrder) {
                  const aVal =
                    a.cells.find((c) => c.columnId === sort.columnId)?.value ??
                    "";
                  const bVal =
                    b.cells.find((c) => c.columnId === sort.columnId)?.value ??
                    "";
                  const cmp = String(aVal).localeCompare(String(bVal));
                  if (cmp !== 0) return sort.direction === "asc" ? cmp : -cmp;
                }
                return 0;
              })
            : previousTableData.rows;

        utils.tableData.getTableData.setData({ tableId, viewId }, {
          ...previousTableData,
          groups: newGroupsFormatted,
          rows: sortedRows,
        });
      }

      return { previousView, previousTableData };
    },
    onSuccess: (updatedView) => {
      if (viewId) {
        utils.view.getById.setData({ viewId }, updatedView);
      }
      void utils.tableData.getTableData.invalidate({ tableId, viewId });
    },
    onError: (_err, _variables, context) => {
      if (context?.previousView && viewId) {
        utils.view.getById.setData({ viewId }, context.previousView);
      }
      if (context?.previousTableData) {
        utils.tableData.getTableData.setData(
          { tableId, viewId: viewId! },
          context.previousTableData,
        );
      }
    },
  });

  const persistGroups = useCallback(
    (levels: GroupLevel[]) => {
      if (!viewId) return;
      updateGroups.mutate({
        viewId,
        groups: levels.map((l) => ({
          columnId: l.columnId,
          direction: l.sortDirection,
        })),
      });
    },
    [viewId, updateGroups],
  );

  const handleSelectField = (col: (typeof columns)[0]) => {
    if (groupLevels.length === 0) {
      const next = [{ columnId: col.id, sortDirection: "asc" as const }];
      setGroupLevels(next);
      persistGroups(next);
    } else if (fieldPickerRowIndex !== null) {
      const next = [...groupLevels];
      if (fieldPickerRowIndex < next.length) {
        next[fieldPickerRowIndex] = {
          ...next[fieldPickerRowIndex]!,
          columnId: col.id,
          sortDirection: next[fieldPickerRowIndex]!.sortDirection ?? "asc",
        };
      } else {
        next.push({ columnId: col.id, sortDirection: "asc" });
      }
      setGroupLevels(next);
      setFieldPickerRowIndex(null);
      persistGroups(next);
    }
  };

  const handleAddSubgroup = () => {
    setFieldPickerRowIndex(groupLevels.length);
  };

  const handleRemoveLevel = (index: number) => {
    const next = groupLevels.filter((_, i) => i !== index);
    setGroupLevels(next);
    persistGroups(next);
    if (fieldPickerRowIndex === index) setFieldPickerRowIndex(null);
    else if (fieldPickerRowIndex !== null && fieldPickerRowIndex > index) {
      setFieldPickerRowIndex(fieldPickerRowIndex - 1);
    }
    if (sortDropdownIndex === index) setSortDropdownIndex(null);
    else if (sortDropdownIndex !== null && sortDropdownIndex > index) {
      setSortDropdownIndex(sortDropdownIndex - 1);
    }
  };

  const handleRemoveAllGroups = () => {
    setGroupLevels([]);
    persistGroups([]);
  };

  const handleSortDirectionSelect = (
    index: number,
    direction: "asc" | "desc",
  ) => {
    const next = groupLevels.map((level, i) =>
      i === index ? { ...level, sortDirection: direction } : level,
    );
    setGroupLevels(next);
    setSortDropdownIndex(null);
    persistGroups(next);
  };

  const getColumnById = (id: string) => columns.find((c) => c.id === id);

  const usedColumnIds = new Set(groupLevels.map((g) => g.columnId));
  const availableForPicker = filteredColumns.filter(
    (col) =>
      fieldPickerRowIndex === null ||
      !usedColumnIds.has(col.id) ||
      groupLevels[fieldPickerRowIndex]?.columnId === col.id,
  );

  return {
    searchQuery,
    setSearchQuery,
    groupLevels,
    fieldPickerRowIndex,
    setFieldPickerRowIndex,
    sortDropdownIndex,
    setSortDropdownIndex,
    fieldButtonRefs,
    sortButtonRefs,
    addSubgroupButtonRef,
    columns,
    filteredColumns,
    availableForPicker,
    getColumnById,
    handleSelectField,
    handleAddSubgroup,
    handleRemoveLevel,
    handleRemoveAllGroups,
    handleSortDirectionSelect,
  };
}
