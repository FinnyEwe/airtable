"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "~/trpc/react";
import type { Column } from "~/types/tableData";
import type { SortLevel } from "./types";

interface UseSortDropdownProps {
  tableId: string;
  viewId?: string;
  isOpen: boolean;
}

export function useSortDropdown({
  tableId,
  viewId,
  isOpen,
}: UseSortDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortLevels, setSortLevels] = useState<SortLevel[]>([]);
  const [fieldPickerRowIndex, setFieldPickerRowIndex] = useState<number | null>(
    null
  );
  const [directionDropdownIndex, setDirectionDropdownIndex] = useState<
    number | null
  >(null);
  const fieldButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const directionButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const addSortButtonRef = useRef<HTMLButtonElement | null>(null);

  const utils = api.useUtils();
  const { data } = api.tableData.getTableData.useQuery(
    { tableId, viewId },
    { enabled: !!tableId && isOpen }
  );
  const { data: viewData } = api.view.getById.useQuery(
    { viewId: viewId! },
    { enabled: !!viewId && isOpen }
  );

  const columns: Column[] = (data?.columns ?? []).sort(
    (a, b) => a.order - b.order
  );
  const filteredColumns = searchQuery
    ? columns.filter((col) =>
        col.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : columns;

  useEffect(() => {
    if (isOpen) setSearchQuery("");
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFieldPickerRowIndex(null);
      setDirectionDropdownIndex(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && viewData?.sorts) {
      setSortLevels(
        viewData.sorts.map((s) => ({
          columnId: s.columnId,
          direction: (s.direction === "desc" ? "desc" : "asc") as "asc" | "desc",
        }))
      );
    }
  }, [isOpen, viewData?.sorts]);

  const updateSorts = api.view.updateSorts.useMutation({
    onMutate: async (newSorts) => {
      if (!viewId) return;
      await utils.view.getById.cancel({ viewId });
      await utils.tableData.getTableData.cancel({ tableId, viewId });

      const previousView = utils.view.getById.getData({ viewId });
      const previousTableData = utils.tableData.getTableData.getData({
        tableId,
        viewId,
      });

      const newSortsFormatted = newSorts.sorts.map((s, i) => ({
        columnId: s.columnId,
        direction: s.direction,
        order: i,
      }));

      utils.view.getById.setData({ viewId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          sorts: newSortsFormatted.map((s, i) => ({
            id: `temp-${i}`,
            columnId: s.columnId,
            direction: s.direction,
            order: i,
          })),
        };
      });

      if (previousTableData) {
        const viewGroups = previousView?.groups ?? [];
        const sortOrder = [
          ...viewGroups.map((g) => ({
            columnId: g.columnId,
            direction: g.direction,
          })),
          ...newSortsFormatted,
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
            : [...previousTableData.rows].sort((a, b) => a.order - b.order);
        utils.tableData.getTableData.setData({ tableId, viewId }, {
          ...previousTableData,
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
      if (context?.previousTableData && viewId) {
        utils.tableData.getTableData.setData(
          { tableId, viewId },
          context.previousTableData
        );
      }
    },
    onSettled: () => {
      void utils.tableData.getTableData.invalidate({ tableId, viewId });
    },
  });

  const persistSorts = useCallback(
    (levels: SortLevel[]) => {
      if (!viewId) return;
      updateSorts.mutate({
        viewId,
        sorts: levels.map((l) => ({
          columnId: l.columnId,
          direction: l.direction,
        })),
      });
    },
    [viewId, updateSorts]
  );

  const getColumnById = useCallback(
    (id: string) => columns.find((c) => c.id === id),
    [columns]
  );

  const handleSelectColumn = useCallback(
    (col: Column) => {
      if (sortLevels.length === 0) {
        const next = [{ columnId: col.id, direction: "asc" as const }];
        setSortLevels(next);
        persistSorts(next);
      } else if (fieldPickerRowIndex !== null) {
        const next = [...sortLevels];
        if (fieldPickerRowIndex < next.length) {
          next[fieldPickerRowIndex] = {
            ...next[fieldPickerRowIndex]!,
            columnId: col.id,
            direction: next[fieldPickerRowIndex]!.direction ?? "asc",
          };
        } else {
          next.push({ columnId: col.id, direction: "asc" });
        }
        setSortLevels(next);
        setFieldPickerRowIndex(null);
        persistSorts(next);
      }
    },
    [sortLevels, fieldPickerRowIndex, persistSorts]
  );

  const handleAddSort = useCallback(() => {
    setFieldPickerRowIndex(sortLevels.length);
  }, [sortLevels.length]);

  const handleRemoveSort = useCallback(
    (index: number) => {
      const next = sortLevels.filter((_, i) => i !== index);
      setSortLevels(next);
      persistSorts(next);
      setFieldPickerRowIndex((prev) => {
        if (prev === index) return null;
        if (prev !== null && prev > index) return prev - 1;
        return prev;
      });
      setDirectionDropdownIndex((prev) => {
        if (prev === index) return null;
        if (prev !== null && prev > index) return prev - 1;
        return prev;
      });
    },
    [sortLevels, persistSorts]
  );

  const handleDirectionSelect = useCallback(
    (index: number, direction: "asc" | "desc") => {
      const next = sortLevels.map((level, i) =>
        i === index ? { ...level, direction } : level
      );
      setSortLevels(next);
      setDirectionDropdownIndex(null);
      persistSorts(next);
    },
    [sortLevels, persistSorts]
  );

  const usedColumnIds = new Set(sortLevels.map((s) => s.columnId));
  const availableForPicker = filteredColumns.filter(
    (col) =>
      fieldPickerRowIndex === null ||
      !usedColumnIds.has(col.id) ||
      sortLevels[fieldPickerRowIndex]?.columnId === col.id
  );

  return {
    searchQuery,
    setSearchQuery,
    sortLevels,
    fieldPickerRowIndex,
    setFieldPickerRowIndex,
    directionDropdownIndex,
    setDirectionDropdownIndex,
    fieldButtonRefs,
    directionButtonRefs,
    addSortButtonRef,
    columns,
    filteredColumns,
    availableForPicker,
    getColumnById,
    handleSelectColumn,
    handleAddSort,
    handleRemoveSort,
    handleDirectionSelect,
  };
}
