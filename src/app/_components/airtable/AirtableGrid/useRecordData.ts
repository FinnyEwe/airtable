"use client";

import { useEffect, useRef, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { api } from "~/trpc/react";
import type { Virtualizer } from "@tanstack/react-virtual";
import type { CellPosition } from "./types";

interface UseRecordDataProps {
  tableId?: string;
  viewId?: string;
  searchQuery?: string;
  filters?: Array<{ columnId: string; operator: string; value: string | null }>;
  sorts?: Array<{ columnId: string; direction: "asc" | "desc" }>;
  virtualizer?: Virtualizer<HTMLDivElement, Element>;
  setSelectedCell?: Dispatch<SetStateAction<CellPosition | null>>;
  setEditingCell?: Dispatch<SetStateAction<CellPosition | null>>;
}

export function useRecordData({
  tableId,
  viewId,
  searchQuery,
  filters = [],
  sorts = [],
  virtualizer,
  setSelectedCell,
  setEditingCell,
}: UseRecordDataProps) {
  const utils = api.useUtils();
  const tempToRealIdRef = useRef<Map<string, string>>(new Map());
  const pendingCellUpdatesRef = useRef<Map<string, Array<{ columnId: string; value: string | null }>>>(new Map());

  // Infinite query with keyset pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = api.record.list.useInfiniteQuery(
    {
      tableId: tableId!,
      filters,
      sorts,
      search: searchQuery?.trim() || undefined,
    },
    {
      enabled: !!tableId,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      staleTime: 60_000, // 60 seconds
    }
  );

  // Eager background loading - fetch all pages automatically
  useEffect(() => {
    if (data && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [data, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Get total count (only from first page)
  const totalCount = data?.pages[0]?.total;

  // Flatten all pages into a single records array
  const allRecords = useMemo(() => {
    if (!data) return [];
    return data.pages.flatMap(page => page.records);
  }, [data]);

  // Get columns from tableData query (still needed for column metadata)
  const { data: tableData } = api.tableData.getTableData.useQuery(
    {
      tableId: tableId!,
      viewId,
      search: searchQuery?.trim() || undefined,
    },
    { enabled: !!tableId }
  );

  const columns = tableData?.columns ?? [];
  const groups = tableData?.groups ?? [];
  const hiddenColumnIds = tableData?.hiddenColumnIds ?? [];
  
  // Compute first visible data column (skip checkbox column)
  const firstVisibleDataColumn = useMemo(() => {
    return columns.find((col, idx) => idx > 0); // Skip checkbox (first column)
  }, [columns]);

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const createRecord = api.record.create.useMutation({
    onMutate: async (variables) => {
      const queryKey = { tableId: tableId!, filters, sorts, search: searchQuery?.trim() || undefined };
      
      // 1. CANCEL IN-FLIGHT QUERIES (prevent race conditions)
      await utils.record.list.cancel(queryKey);
      
      // 2. SNAPSHOT CURRENT CACHE (for rollback on error)
      const previousData = utils.record.list.getInfiniteData(queryKey);
      
      // 3. CREATE TEMPORARY RECORD (instant UI)
      const tempId = `temp-${Date.now()}`;
      const newRecord = {
        id: tempId,
        order: (allRecords[allRecords.length - 1]?.order ?? -1) + 1,
        data: {},
      };
      
      // 4. IMMEDIATELY INSERT INTO CACHE
      utils.record.list.setInfiniteData(queryKey, (old) => {
        if (!old) return old;
        
        const lastPageIdx = old.pages.length - 1;
        const lastPage = old.pages[lastPageIdx];
        if (!lastPage) return old;
        
        return {
          ...old,
          pages: old.pages.map((page, i) => ({
            ...page,
            total: i === 0 && page.total ? page.total + 1 : page.total,
            records: i === lastPageIdx 
              ? [...page.records, newRecord]
              : page.records,
          })),
        };
      });
      
      // 5. AUTO-FOCUS FIRST CELL + SCROLL TO NEW ROW
      if (firstVisibleDataColumn && setSelectedCell && setEditingCell) {
        const newRowIndex = allRecords.length; // Index of new row
        
        setSelectedCell({
          rowId: tempId,
          columnId: firstVisibleDataColumn.id,
        });
        setEditingCell({
          rowId: tempId,
          columnId: firstVisibleDataColumn.id,
        });
        
        // Scroll to the new row
        if (virtualizer) {
          requestAnimationFrame(() => {
            virtualizer.scrollToIndex(newRowIndex, { align: "end" });
          });
        }
      }
      
      return { previousData, queryKey, tempId };
    },
    onSuccess: (realRecord, variables, context) => {
      if (!context?.tempId) return;
      
      const queryKey = context.queryKey;
      
      // 1. MAP TEMP ID → REAL ID
      tempToRealIdRef.current.set(context.tempId, realRecord.id);
      
      // 2. REPLACE TEMP ROW WITH REAL ROW IN CACHE (avoid invalidation flicker)
      utils.record.list.setInfiniteData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            records: page.records.map((record) => {
              if (record.id !== context.tempId) return record;
              
              // Merge any queued edits from the temp record into the real record
              const realData = typeof realRecord.data === 'object' && realRecord.data !== null 
                ? realRecord.data 
                : {};
              const tempData = typeof record.data === 'object' && record.data !== null
                ? record.data
                : {};
              
              return {
                ...realRecord,
                data: { ...realData, ...tempData } as Record<string, unknown>,
              };
            }),
          })),
        };
      });
      
      // 3. UPDATE ACTIVE CELL TO USE REAL ID
      if (setSelectedCell) {
        setSelectedCell((prev: CellPosition | null) =>
          prev?.rowId === context.tempId ? { ...prev, rowId: realRecord.id } : prev
        );
      }
      if (setEditingCell) {
        setEditingCell((prev: CellPosition | null) =>
          prev?.rowId === context.tempId ? { ...prev, rowId: realRecord.id } : prev
        );
      }
      
      // 4. FLUSH QUEUED EDITS
      const pendingUpdates = pendingCellUpdatesRef.current.get(context.tempId);
      if (pendingUpdates) {
        for (const update of pendingUpdates) {
          void updateCell.mutate({
            rowId: realRecord.id,
            columnId: update.columnId,
            value: update.value,
          });
        }
        pendingCellUpdatesRef.current.delete(context.tempId);
      }
      
      // Only invalidate count (not the list, to avoid refetch)
      void utils.record.count.invalidate({ tableId: tableId! });
    },
    onError: (err, variables, context) => {
      // ROLLBACK: Restore snapshot if mutation fails
      if (context?.previousData) {
        utils.record.list.setInfiniteData(context.queryKey, context.previousData);
      }
      if (setSelectedCell) setSelectedCell(null);
      if (setEditingCell) setEditingCell(null);
    },
  });

  const updateCell = api.record.updateCell.useMutation({
    onMutate: async (variables) => {
      const queryKey = { tableId: tableId!, filters, sorts, search: searchQuery?.trim() || undefined };
      
      // If this is a temp record, queue the update and update cache optimistically
      if (variables.rowId.startsWith('temp-')) {
        const pending = pendingCellUpdatesRef.current.get(variables.rowId) ?? [];
        pending.push({ columnId: variables.columnId, value: variables.value });
        pendingCellUpdatesRef.current.set(variables.rowId, pending);
        
        // Update cache optimistically (user sees their typing immediately)
        utils.record.list.setInfiniteData(queryKey, (old) => {
          if (!old) return old;
          
          return {
            ...old,
            pages: old.pages.map(page => ({
              ...page,
              records: page.records.map(record => {
                if (record.id !== variables.rowId) return record;
                
                return {
                  ...record,
                  data: {
                    ...record.data,
                    [variables.columnId]: variables.value,
                  },
                };
              }),
            })),
          };
        });
        
        return { queryKey, isTemp: true };
      }
      
      await utils.record.list.cancel(queryKey);
      const previousData = utils.record.list.getInfiniteData(queryKey);
      
      utils.record.list.setInfiniteData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            records: page.records.map(record => {
              if (record.id !== variables.rowId) return record;
              
              return {
                ...record,
                data: {
                  ...record.data,
                  [variables.columnId]: variables.value,
                },
              };
            }),
          })),
        };
      });
      
      return { previousData, queryKey, isTemp: false };
    },
    onSuccess: (data, variables, context) => {
      // Don't invalidate for temp records (they're queued)
      if (!context?.isTemp) {
        // Don't invalidate to avoid refetch - optimistic update is enough
      }
    },
    onError: (err, variables, context) => {
      if (context?.previousData && !context.isTemp) {
        utils.record.list.setInfiniteData(context.queryKey, context.previousData);
      }
    },
  });

  const deleteRecord = api.record.delete.useMutation({
    onMutate: async (variables) => {
      const queryKey = { tableId: tableId!, filters, sorts, search: searchQuery?.trim() || undefined };
      
      await utils.record.list.cancel(queryKey);
      const previousData = utils.record.list.getInfiniteData(queryKey);
      
      utils.record.list.setInfiniteData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            records: page.records.filter(record => record.id !== variables.rowId),
          })),
        };
      });
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables, context) => {
      void utils.record.list.invalidate(context?.queryKey);
      void utils.record.count.invalidate({ tableId: tableId! });
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.record.list.setInfiniteData(context.queryKey, context.previousData);
      }
    },
  });

  const bulkCreate = api.record.bulkCreate.useMutation({
    onSuccess: () => {
      // Use reset() to immediately clear cache, then refetch
      void utils.record.list.reset();
      void utils.record.count.invalidate({ tableId: tableId! });
    },
  });

  const clearData = api.record.clearData.useMutation({
    onMutate: async () => {
      const queryKey = { tableId: tableId!, filters, sorts, search: searchQuery?.trim() || undefined };
      
      await utils.record.list.cancel(queryKey);
      const previousData = utils.record.list.getInfiniteData(queryKey);
      
      utils.record.list.setInfiniteData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map(page => ({
            ...page,
            records: [],
          })),
        };
      });
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables, context) => {
      void utils.record.list.reset();
      void utils.record.count.invalidate({ tableId: tableId! });
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.record.list.setInfiniteData(context.queryKey, context.previousData);
      }
    },
  });

  // Column mutations with optimistic updates
  const createColumn = api.column.create.useMutation({
    onMutate: async (variables) => {
      const queryKey = { tableId: tableId!, viewId, search: searchQuery?.trim() || undefined };
      
      // Cancel in-flight queries
      await utils.tableData.getTableData.cancel(queryKey);
      
      // Snapshot current cache
      const previousData = utils.tableData.getTableData.getData(queryKey);
      
      // Generate temp ID and temp column
      const tempId = `temp-col-${Date.now()}`;
      const lastColumn = columns[columns.length - 1];
      const tempColumn = {
        id: tempId,
        name: variables.name || "Untitled",
        type: variables.type || "text",
        order: (lastColumn?.order ?? -1) + 1,
        config: null,
      };
      
      // Immediately insert into cache
      utils.tableData.getTableData.setData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: [...old.columns, tempColumn],
        };
      });
      
      return { previousData, queryKey, tempId };
    },
    onSuccess: (newColumn, variables, context) => {
      if (!context) return;
      
      const queryKey = context.queryKey;
      
      // Replace temp column with real column in cache
      utils.tableData.getTableData.setData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: old.columns.map((col) =>
            col.id === context.tempId ? newColumn : col
          ),
        };
      });
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(context.queryKey, context.previousData);
      }
    },
  });

  const deleteColumn = api.column.delete.useMutation({
    onMutate: async (variables) => {
      const queryKey = { tableId: tableId!, viewId, search: searchQuery?.trim() || undefined };
      
      // Cancel in-flight queries
      await utils.tableData.getTableData.cancel(queryKey);
      
      // Snapshot current cache
      const previousData = utils.tableData.getTableData.getData(queryKey);
      
      // Immediately remove from cache
      utils.tableData.getTableData.setData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: old.columns.filter((col) => col.id !== variables.columnId),
        };
      });
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables, context) => {
      // Don't invalidate - optimistic update is enough
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(context.queryKey, context.previousData);
      }
    },
  });

  // Transform records to match old format for compatibility
  const rows = useMemo(() => {
    return allRecords.map(record => ({
      id: record.id,
      order: record.order,
      cells: Object.entries(record.data ?? {}).map(([columnId, value]) => ({
        columnId,
        value: value as string | null,
      })),
    }));
  }, [allRecords]);

  return {
    data: {
      columns,
      rows,
      groups,
      hiddenColumnIds,
      filters: [],
    },
    isLoading,
    totalCount,
    hasNextPage,
    isFetchingNextPage,
    mutations: {
      createRow: createRecord,
      bulkInsert: bulkCreate,
      clearAll: clearData,
      createColumn,
      deleteColumn,
      deleteRow: deleteRecord,
      updateCell,
    },
  };
}
