import { api } from "~/trpc/react";

interface UseTableDataProps {
  tableId?: string;
  viewId?: string;
  searchQuery?: string;
}

export function useTableData({ tableId, viewId, searchQuery }: UseTableDataProps) {
  const { data, isLoading } = api.tableData.getTableData.useQuery(
    {
      tableId: tableId!,
      viewId,
      search: searchQuery?.trim() || undefined,
    },
    { enabled: !!tableId },
  );

  const createRow = api.row.create.useMutation({
    onSuccess: () => {
      void api.useUtils().tableData.getTableData.invalidate();
    },
  });

  const bulkInsert = api.row.bulkInsert.useMutation({
    onSuccess: () => {
      void api.useUtils().tableData.getTableData.invalidate();
    },
  });

  const clearAll = api.row.clearAll.useMutation({
    onSuccess: () => {
      void api.useUtils().tableData.getTableData.invalidate();
    },
  });

  const createColumn = api.column.create.useMutation({
    onSuccess: () => {
      void api.useUtils().tableData.getTableData.invalidate();
    },
  });

  const deleteColumn = api.column.delete.useMutation({
    onSuccess: () => {
      void api.useUtils().tableData.getTableData.invalidate();
    },
  });

  const deleteRow = api.row.delete.useMutation({
    onSuccess: () => {
      void api.useUtils().tableData.getTableData.invalidate();
    },
  });

  const updateCell = api.cell.update.useMutation({
    onSuccess: () => {
      void api.useUtils().tableData.getTableData.invalidate();
    },
  });

  return {
    data,
    isLoading,
    mutations: {
      createRow,
      bulkInsert,
      clearAll,
      createColumn,
      deleteColumn,
      deleteRow,
      updateCell,
    },
  };
}
