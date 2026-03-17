"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Dropdown } from "~/app/_components/ui/Dropdown";
import { api } from "~/trpc/react";
import {
  PlusIcon,
  TrashIcon,
  QuestionIcon,
  GripVerticalIcon,
  ChevronDownIcon,
} from "../icons";
import { columnTypeIcon } from "../utils/columnUtils";
import { FilterSelect } from "./FilterSelect";
import type { Column } from "~/types/tableData";
import type { ViewFilterRef } from "~/types/tableData";

const OPERATORS = [
  { value: "contains", label: "contains" },
  { value: "not_contains", label: "does not contain" },
  { value: "equals", label: "equals" },
  { value: "not_equals", label: "does not equal" },
  { value: "is_empty", label: "is empty" },
  { value: "is_not_empty", label: "is not empty" },
] as const;

const CONJUNCTIONS = [
  { value: "and", label: "and" },
  { value: "or", label: "or" },
] as const;

const needsValue = (op: string) =>
  op !== "is_empty" && op !== "is_not_empty";

function ValueInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [local, setLocal] = useState(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setLocal(v);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onChange(v), 300);
    },
    [onChange]
  );

  const handleBlur = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    onChange(local);
  }, [local, onChange]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    []
  );

  return (
    <div className="flex min-w-48 flex-1">
      <input
        type="text"
        placeholder="Enter a value"
        value={local}
        onChange={handleChange}
        onBlur={handleBlur}
        className="w-full border-0 bg-transparent px-2 py-1.5 text-sm text-gray-700 placeholder-gray-400 outline-none"
      />
    </div>
  );
}

interface FilterConditionProps {
  filter: ViewFilterRef;
  columns: Column[];
  isFirst: boolean;
  onUpdate: (filter: Partial<ViewFilterRef>) => void;
  onRemove: () => void;
}

function FilterCondition({
  filter,
  columns,
  isFirst,
  onUpdate,
  onRemove,
}: FilterConditionProps) {
  const column = columns.find((c) => c.id === filter.columnId);
  const showValue = needsValue(filter.operator);

  const columnOptions = columns.map((c) => ({
    value: c.id,
    searchText: c.name,
    label: (
      <span className="flex items-center gap-2">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
          {columnTypeIcon(c.type)}
        </span>
        <span className="truncate">{c.name}</span>
      </span>
    ),
  }));

  const operatorOptions = OPERATORS.map((o) => ({
    value: o.value,
    searchText: o.label,
    label: o.label,
  }));

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Conjunction: "Where" for first, "and"/"or" dropdown for rest */}
      <div
        className="flex w-[4.5rem] shrink-0 items-center px-2"
        style={{ minHeight: 30 }}
      >
        {isFirst ? (
          <span className="text-xs text-gray-600">Where</span>
        ) : (
          <FilterSelect
            value="and"
            options={CONJUNCTIONS.map((c) => ({
              value: c.value,
              label: c.label,
            }))}
            // eslint-disable-next-line @typescript-eslint/no-empty-function -- Conjunction UI only; backend uses AND
            onChange={() => {}}
            minWidth={72}
            className="h-7 rounded border border-gray-200 bg-white px-2 text-xs"
          />
        )}
      </div>

      {/* Single bordered container: [field | operator | value] */}
      <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-gray-200 bg-white">
        {/* Column picker */}
        <div className="flex shrink-0 border-r border-gray-200">
          <FilterSelect
            value={filter.columnId}
            options={columnOptions}
            onChange={(columnId) => onUpdate({ columnId })}
            placeholder="Select field"
            minWidth={140}
            searchPlaceholder="Find a field"
            maxWidth={450}
            maxHeight={220}
            renderTrigger={(label, isOpen) => (
              <>
                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
                  {column ? columnTypeIcon(column.type) : null}
                </span>
                <span className="truncate">{column?.name ?? "Select field"}</span>
                <span
                  className={`ml-1 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
                >
                  <ChevronDownIcon />
                </span>
              </>
            )}
          />
        </div>
        {/* Operator picker */}
        <div className="flex min-w-[6rem] shrink border-r border-gray-200 overflow-hidden">
          <FilterSelect
            value={filter.operator}
            options={operatorOptions}
            onChange={(operator) =>
              onUpdate({
                operator,
                value: needsValue(operator) ? filter.value : null,
              })
            }
            placeholder="contains"
            minWidth={96}
            searchPlaceholder="Find an operator"
            maxWidth={450}
            maxHeight={220}
          />
        </div>
        {/* Value input */}
        {showValue && (
          <ValueInput
            value={filter.value ?? ""}
            onChange={(v) => onUpdate({ value: v || null })}
          />
        )}
      </div>

      {/* Actions: trash + drag handle */}
      <div className="flex shrink-0 items-stretch">
        <button
          type="button"
          onClick={onRemove}
          className="flex items-center justify-center rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          aria-label="Remove condition"
        >
          <TrashIcon />
        </button>
        <button
          type="button"
          className="flex cursor-grab items-center justify-center rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          aria-label="Reorder"
        >
          <GripVerticalIcon />
        </button>
      </div>
    </div>
  );
}

interface FilterDropdownContentProps {
  columns: Column[];
  filters: ViewFilterRef[];
  onFiltersChange: (filters: ViewFilterRef[]) => void;
}

function FilterDropdownContent({
  columns,
  filters,
  onFiltersChange,
}: FilterDropdownContentProps) {
  const handleUpdate = useCallback(
    (index: number, updates: Partial<ViewFilterRef>) => {
      const next = [...filters];
      next[index] = { ...next[index]!, ...updates };
      onFiltersChange(next);
    },
    [filters, onFiltersChange]
  );

  const handleRemove = useCallback(
    (index: number) => {
      onFiltersChange(filters.filter((_, i) => i !== index));
    },
    [filters, onFiltersChange]
  );

  const handleAdd = useCallback(() => {
    const firstCol = columns[0];
    if (!firstCol) return;
    onFiltersChange([
      ...filters,
      {
        id: `temp-${Date.now()}`,
        columnId: firstCol.id,
        operator: "contains",
        value: null,
        order: filters.length,
      },
    ]);
  }, [columns, filters, onFiltersChange]);

  return (
    <div className="flex min-w-[32rem] flex-col">
      <div className="border-b border-gray-200 px-3 py-2">
        <h3 className="text-xs font-semibold text-gray-600">Filter</h3>
      </div>

      <div className="px-3 py-2">
        <p className="text-xs text-gray-500">
          In this view, show records
        </p>
      </div>

      <div
        className="max-h-[min(425px,calc(100vh-280px))] overflow-y-auto px-3 py-2"
        style={{ minHeight: 60 }}
      >
        {filters.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-500">
            No conditions. Add one to filter records.
          </p>
        ) : (
          <div className="space-y-0">
            {filters.map((filter, i) => (
              <FilterCondition
                key={filter.id}
                filter={filter}
                columns={columns}
                isFirst={i === 0}
                onUpdate={(updates) => handleUpdate(i, updates)}
                onRemove={() => handleRemove(i)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-200 px-3 py-2">
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
        >
          <PlusIcon size={12} />
          Add condition
        </button>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
          >
            <PlusIcon size={12} />
            Add condition group
          </button>
          <button
            type="button"
            className="flex items-center rounded text-gray-400 hover:text-gray-600"
            aria-label="Learn more about filtering"
          >
            <QuestionIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

interface FilterDropdownProps {
  tableId: string | undefined;
  viewId?: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

export function FilterDropdown({
  tableId,
  viewId,
  anchorRef,
  isOpen,
  onClose,
}: FilterDropdownProps) {
  const utils = api.useUtils();
  const { data } = api.tableData.getTableData.useQuery(
    { tableId: tableId!, viewId },
    { enabled: !!tableId && isOpen }
  );

  const updateFilters = api.view.updateFilters.useMutation({
    onMutate: async (newFilters) => {
      if (!tableId || !viewId) return;
      await utils.tableData.getTableData.cancel({ tableId, viewId });
      const previous = utils.tableData.getTableData.getData({
        tableId,
        viewId,
      });
      utils.tableData.getTableData.setData({ tableId, viewId }, (old) => {
        if (!old) return old;
        return {
          ...old,
          filters: newFilters.filters.map((f, i) => ({
            id: f.columnId + String(i),
            columnId: f.columnId,
            operator: f.operator,
            value: f.value,
            order: i,
          })),
        };
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

  const columns = (data?.columns ?? []).sort((a, b) => a.order - b.order);
  const filters = (data?.filters ?? []).sort((a, b) => a.order - b.order);

  const handleFiltersChange = useCallback(
    (next: ViewFilterRef[]) => {
      if (!viewId) return;
      updateFilters.mutate({
        viewId,
        filters: next.map((f, i) => ({
          columnId: f.columnId,
          operator: f.operator,
          value: f.value,
          order: i,
        })),
      });
    },
    [viewId, updateFilters]
  );

  if (!tableId) return null;

  return (
    <Dropdown
      open={isOpen}
      onClose={onClose}
      anchor={anchorRef.current}
      content={
        <FilterDropdownContent
          columns={columns}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      }
      width={520}
      maxHeight={500}
      placement="bottom-end"
    />
  );
}
