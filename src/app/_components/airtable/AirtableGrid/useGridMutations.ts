"use client";

import { api } from "~/trpc/react";

interface UseGridMutationsProps {
  tableId: string | undefined;
  viewId: string | undefined;
}

export function useGridMutations({ tableId, viewId }: UseGridMutationsProps) {
  const utils = api.useUtils();

  const createRow = api.row.create.useMutation({
    onMutate: async () => {
      await utils.tableData.getTableData.cancel({
        tableId: tableId!,
        viewId,
      });

      const previousData = utils.tableData.getTableData.getData({
        tableId: tableId!,
        viewId,
      });

      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            rows: [
              ...old.rows,
              {
                id: `temp-${Date.now()}`,
                order: old.rows.length,
                cells: [],
              },
            ],
          };
        },
      );

      return { previousData };
    },
    onSuccess: (newRow, _variables, _context) => {
      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            rows: old.rows.map((row) =>
              row.id.startsWith("temp-")
                ? { ...row, id: newRow.id, order: newRow.order }
                : row,
            ),
          };
        },
      );
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(
          { tableId: tableId!, viewId },
          context.previousData,
        );
      }
    },
  });

  const createColumn = api.column.create.useMutation({
    onMutate: async () => {
      await utils.tableData.getTableData.cancel({
        tableId: tableId!,
        viewId,
      });

      const previousData = utils.tableData.getTableData.getData({
        tableId: tableId!,
        viewId,
      });

      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            columns: [
              ...old.columns,
              {
                id: `temp-${Date.now()}`,
                name: "Untitled",
                type: "text",
                order: old.columns.length,
                config: null,
              },
            ],
          };
        },
      );

      return { previousData };
    },
    onSuccess: (newColumn, _variables, _context) => {
      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            columns: old.columns.map((col) =>
              col.id.startsWith("temp-")
                ? { ...col, id: newColumn.id, order: newColumn.order }
                : col,
            ),
          };
        },
      );
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(
          { tableId: tableId!, viewId },
          context.previousData,
        );
      }
    },
  });

  const deleteColumn = api.column.delete.useMutation({
    onMutate: async ({ columnId }) => {
      await utils.tableData.getTableData.cancel({
        tableId: tableId!,
        viewId,
      });

      const previousData = utils.tableData.getTableData.getData({
        tableId: tableId!,
        viewId,
      });

      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            columns: old.columns.filter((col) => col.id !== columnId),
            rows: old.rows.map((row) => ({
              ...row,
              cells: row.cells.filter((cell) => cell.columnId !== columnId),
            })),
            groups: old.groups?.filter((g) => g.columnId !== columnId) ?? [],
          };
        },
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(
          { tableId: tableId!, viewId },
          context.previousData,
        );
      }
    },
  });

  const deleteRow = api.row.delete.useMutation({
    onMutate: async ({ rowId }) => {
      await utils.tableData.getTableData.cancel({
        tableId: tableId!,
        viewId,
      });

      const previousData = utils.tableData.getTableData.getData({
        tableId: tableId!,
        viewId,
      });

      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            rows: old.rows.filter((row) => row.id !== rowId),
          };
        },
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(
          { tableId: tableId!, viewId },
          context.previousData,
        );
      }
    },
  });

  const updateCell = api.cell.update.useMutation({
    onMutate: async ({ rowId, columnId, value }) => {
      await utils.tableData.getTableData.cancel({
        tableId: tableId!,
        viewId,
      });

      const previousData = utils.tableData.getTableData.getData({
        tableId: tableId!,
        viewId,
      });

      utils.tableData.getTableData.setData(
        { tableId: tableId!, viewId },
        (old) => {
          if (!old) return old;
          return {
            ...old,
            rows: old.rows.map((row) => {
              if (row.id !== rowId) return row;
              const existingCell = row.cells.find((c) => c.columnId === columnId);
              if (existingCell) {
                return {
                  ...row,
                  cells: row.cells.map((c) =>
                    c.columnId === columnId ? { ...c, value } : c
                  ),
                };
              } else {
                return {
                  ...row,
                  cells: [
                    ...row.cells,
                    { id: `temp-${Date.now()}`, columnId, value, rowId },
                  ],
                };
              }
            }),
          };
        },
      );

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        utils.tableData.getTableData.setData(
          { tableId: tableId!, viewId },
          context.previousData,
        );
      }
    },
  });

  return { createRow, createColumn, deleteColumn, deleteRow, updateCell };
}
