import { api } from "~/trpc/react";

interface UseTableDataProps {
  tableId?: string;
  viewId?: string;
  searchQuery?: string;
}

export function useTableData({ tableId, viewId, searchQuery }: UseTableDataProps) {
  const utils = api.useUtils();
  
  const { data, isLoading } = api.tableData.getTableData.useQuery(
    {
      tableId: tableId!,
      viewId,
      search: searchQuery?.trim() || undefined,
    },
    { enabled: !!tableId },
  );

  const createRow = api.row.create.useMutation({
    onMutate: async (variables) => {
      const queryKey = { tableId: tableId!, viewId, search: searchQuery?.trim() || undefined };
      
      await utils.tableData.getTableData.cancel(queryKey);
      const previousData = utils.tableData.getTableData.getData(queryKey);
      
      utils.tableData.getTableData.setData(queryKey, (old) => {
        if (!old) return old;
        
        const tempId = `temp-${Date.now()}`;
        const maxOrder = old.rows.length > 0 
          ? Math.max(...old.rows.map(r => r.order)) 
          : -1;
        
        const newRow = {
          id: tempId,
          order: maxOrder + 1,
          cells: old.columns.map(col => ({
            id: `temp-cell-${col.id}`,
            columnId: col.id,
            value: null,
            rowId: tempId,
          })),
        };
        
        return {
          ...old,
          rows: [...old.rows, newRow],
        };
      });
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables, context) => {
      void utils.tableData.getTableData.invalidate(context?.queryKey);
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(context.queryKey, context.previousData);
      }
    },
  });

  const bulkInsert = api.row.bulkInsert.useMutation({
    onSuccess: () => {
      void utils.tableData.getTableData.invalidate();
    },
  });

  const clearAll = api.row.clearAll.useMutation({
    onMutate: async () => {
      const queryKey = { tableId: tableId!, viewId, search: searchQuery?.trim() || undefined };
      
      await utils.tableData.getTableData.cancel(queryKey);
      const previousData = utils.tableData.getTableData.getData(queryKey);
      
      utils.tableData.getTableData.setData(queryKey, (old) => 
        old ? { ...old, rows: [] } : old
      );
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables, context) => {
      void utils.tableData.getTableData.invalidate(context?.queryKey);
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(context.queryKey, context.previousData);
      }
    },
  });

  const createColumn = api.column.create.useMutation({
    onMutate: async (variables) => {
      const queryKey = { tableId: tableId!, viewId, search: searchQuery?.trim() || undefined };
      
      await utils.tableData.getTableData.cancel(queryKey);
      const previousData = utils.tableData.getTableData.getData(queryKey);
      
      utils.tableData.getTableData.setData(queryKey, (old) => {
        if (!old) return old;
        
        const tempId = `temp-${Date.now()}`;
        const maxOrder = old.columns.length > 0 
          ? Math.max(...old.columns.map(c => c.order)) 
          : -1;
        
        const newColumn = {
          id: tempId,
          name: variables.name ?? "Untitled",
          type: variables.type ?? "text",
          order: maxOrder + 1,
          config: null,
        };
        
        const updatedRows = old.rows.map(row => ({
          ...row,
          cells: [
            ...row.cells,
            {
              id: `temp-cell-${row.id}-${tempId}`,
              columnId: tempId,
              value: null,
              rowId: row.id,
            },
          ],
        }));
        
        return {
          ...old,
          columns: [...old.columns, newColumn],
          rows: updatedRows,
        };
      });
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables, context) => {
      void utils.tableData.getTableData.invalidate(context?.queryKey);
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
      
      await utils.tableData.getTableData.cancel(queryKey);
      const previousData = utils.tableData.getTableData.getData(queryKey);
      
      utils.tableData.getTableData.setData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          columns: old.columns.filter(col => col.id !== variables.columnId),
          rows: old.rows.map(row => ({
            ...row,
            cells: row.cells.filter(cell => cell.columnId !== variables.columnId),
          })),
        };
      });
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables, context) => {
      void utils.tableData.getTableData.invalidate(context?.queryKey);
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(context.queryKey, context.previousData);
      }
    },
  });

  const deleteRow = api.row.delete.useMutation({
    onMutate: async (variables) => {
      const queryKey = { tableId: tableId!, viewId, search: searchQuery?.trim() || undefined };
      
      await utils.tableData.getTableData.cancel(queryKey);
      const previousData = utils.tableData.getTableData.getData(queryKey);
      
      utils.tableData.getTableData.setData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          rows: old.rows.filter(row => row.id !== variables.rowId),
        };
      });
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables, context) => {
      void utils.tableData.getTableData.invalidate(context?.queryKey);
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(context.queryKey, context.previousData);
      }
    },
  });

  const updateCell = api.cell.update.useMutation({
    onMutate: async (variables) => {
      const queryKey = { tableId: tableId!, viewId, search: searchQuery?.trim() || undefined };
      
      await utils.tableData.getTableData.cancel(queryKey);
      const previousData = utils.tableData.getTableData.getData(queryKey);
      
      utils.tableData.getTableData.setData(queryKey, (old) => {
        if (!old) return old;
        
        return {
          ...old,
          rows: old.rows.map(row => {
            if (row.id !== variables.rowId) return row;
            
            return {
              ...row,
              cells: row.cells.map(cell => {
                if (cell.columnId !== variables.columnId) return cell;
                
                return {
                  ...cell,
                  value: variables.value,
                };
              }),
            };
          }),
        };
      });
      
      return { previousData, queryKey };
    },
    onSuccess: (data, variables, context) => {
      void utils.tableData.getTableData.invalidate(context?.queryKey);
    },
    onError: (err, variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(context.queryKey, context.previousData);
      }
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
