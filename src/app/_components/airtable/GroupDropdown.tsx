"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "~/trpc/react";
import { Dropdown } from "~/app/_components/ui/Dropdown";
import {
  SearchIcon,
  QuestionIcon,
  NumberIcon,
  TextFieldIcon,
  SelectIcon,
  CalendarIcon,
  ChevronDownIcon,
  TrashIcon,
  PlusIcon,
} from "./icons";

function columnTypeIcon(type: string) {
  switch (type) {
    case "number":
      return <NumberIcon />;
    case "select":
      return <SelectIcon />;
    case "date":
      return <CalendarIcon />;
    default:
      return <TextFieldIcon />;
  }
}

type SortDirection = "asc" | "desc";

interface GroupLevel {
  columnId: string;
  sortDirection: SortDirection;
}

interface GroupDropdownProps {
  tableId: string;
  viewId?: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupDropdown({
  tableId,
  viewId,
  anchorRef,
  isOpen,
  onClose,
}: GroupDropdownProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [groupLevels, setGroupLevels] = useState<GroupLevel[]>([]);
  const [fieldPickerRowIndex, setFieldPickerRowIndex] = useState<number | null>(
    null,
  );
  const fieldButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sortButtonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const addSubgroupButtonRef = useRef<HTMLButtonElement | null>(null);
  const [sortDropdownIndex, setSortDropdownIndex] = useState<number | null>(null);

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

      // Optimistically update tableData: new groups + re-sort rows (matches server logic)
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
                    a.cells.find((c) => c.columnId === sort.columnId)?.value ?? "";
                  const bVal =
                    b.cells.find((c) => c.columnId === sort.columnId)?.value ?? "";
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
          context.previousTableData
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

  const handleSortDirectionSelect = (index: number, direction: SortDirection) => {
    const next = groupLevels.map((level, i) =>
      i === index ? { ...level, sortDirection: direction } : level,
    );
    setGroupLevels(next);
    setSortDropdownIndex(null);
    persistGroups(next);
  };

  const getColumnById = (id: string) => columns.find((c) => c.id === id);

  const getSortLabel = (colType: string, direction: SortDirection) => {
    if (colType === "number") {
      return direction === "asc" ? "1 → 9" : "9 → 1";
    }
    return direction === "asc" ? "A → Z" : "Z → A";
  };

  const usedColumnIds = new Set(groupLevels.map((g) => g.columnId));
  const availableForPicker = filteredColumns.filter(
    (col) =>
      fieldPickerRowIndex === null || !usedColumnIds.has(col.id) || groupLevels[fieldPickerRowIndex]?.columnId === col.id,
  );

  const isManageView = groupLevels.length > 0;
  const showFieldPicker = fieldPickerRowIndex !== null;
  const showSortDropdown = sortDropdownIndex !== null;

  let content: React.ReactNode;

  if (!isManageView && fieldPickerRowIndex === null) {
    // Initial state: pick first group-by field
    content = (
      <div className="flex w-64 flex-col">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold text-gray-600">Group by</p>
            <button
              type="button"
              className="flex items-center rounded text-gray-400 hover:text-gray-600"
              aria-label="Learn more about grouping"
            >
              <QuestionIcon />
            </button>
          </div>
        </div>
        <hr className="mx-3 border-0 border-b border-gray-200" />
        <div className="flex items-center gap-2 px-3 py-2">
          <SearchIcon />
          <input
            type="text"
            placeholder="Find a field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
            autoFocus
          />
        </div>
        <div
          className="max-h-[min(400px,calc(100vh-280px))] overflow-y-auto py-1"
          style={{ minHeight: 100 }}
        >
          {filteredColumns.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-gray-500">
              No fields match
            </p>
          ) : (
            filteredColumns.map((col) => (
              <button
                key={col.id}
                type="button"
                role="option"
                aria-selected={false}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none"
                onClick={() => handleSelectField(col)}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
                  {columnTypeIcon(col.type)}
                </span>
                <span>{col.name}</span>
              </button>
            ))
          )}
        </div>
      </div>
    );
  } else {
    // Manage view: list of groups + Add subgroup
    content = (
      <div className="flex min-w-[420px] flex-col p-1.5">
        {/* Header: Group by + help | Collapse all | Expand all */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold text-gray-600">Group by</p>
            <button
              type="button"
              className="flex items-center rounded text-gray-400 hover:text-gray-600"
              aria-label="Learn more about grouping"
            >
              <QuestionIcon />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700"
              aria-label="Collapse all"
            >
              Collapse all
            </button>
            <button
              type="button"
              className="text-xs text-blue-600 hover:text-blue-700"
              aria-label="Expand all"
            >
              Expand all
            </button>
            <button
              type="button"
              className="text-xs text-red-500 hover:text-red-600 hover:underline"
              aria-label="Remove grouping"
              onClick={handleRemoveAllGroups}
            >
              Remove grouping
            </button>
          </div>
        </div>

        <hr className="mx-3 border-0 border-b border-gray-200 my-2" />

        {/* Group levels */}
        <div
          className="overflow-y-auto py-1"
          style={{
            minHeight: 70,
            maxHeight: "calc(100vh - 380px)",
          }}
        >
          <ul className="flex flex-col gap-1 pt-1">
            {groupLevels.map((level, index) => {
              const col = getColumnById(level.columnId);
              const isPickerOpen = fieldPickerRowIndex === index;

              return (
                <li key={index} className="flex items-center gap-3 px-3">
                  {/* Field selector */}
                  <div className="w-60 shrink-0">
                    <button
                      ref={(el) => {
                        fieldButtonRefs.current[index] = el;
                      }}
                      type="button"
                      className="flex h-7 w-full items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                      onClick={() => {
                        setSortDropdownIndex(null);
                        setFieldPickerRowIndex(isPickerOpen ? null : index);
                      }}
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
                        {col ? columnTypeIcon(col.type) : <TextFieldIcon />}
                      </span>
                      <span className="truncate flex-1">
                        {col?.name ?? "Choose field"}
                      </span>
                      <ChevronDownIcon />
                    </button>
                  </div>

                  {/* Sort direction dropdown */}
                  <div className="w-[120px] shrink-0">
                    <button
                      ref={(el) => {
                        sortButtonRefs.current[index] = el;
                      }}
                      type="button"
                      className="flex h-7 w-full items-center justify-between rounded border border-gray-200 bg-gray-50 px-2 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                      onClick={() => {
                        setFieldPickerRowIndex(null);
                        setSortDropdownIndex(
                          sortDropdownIndex === index ? null : index,
                        );
                      }}
                    >
                      <span>
                        {getSortLabel(
                          col?.type ?? "text",
                          level.sortDirection,
                        )}
                      </span>
                      <ChevronDownIcon />
                    </button>
                  </div>

                  {/* Spacer */}
                  <div className="w-7 shrink-0" />

                  {/* Remove */}
                  <button
                    type="button"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Remove group"
                    onClick={() => handleRemoveLevel(index)}
                  >
                    <TrashIcon />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Add subgroup */}
          <div className="mt-2 flex flex-1">
            <button
              ref={addSubgroupButtonRef}
              type="button"
              className="flex flex-1 items-center gap-2 py-1.5 pl-3 text-sm font-medium text-gray-600 hover:text-gray-800"
              onClick={handleAddSubgroup}
            >
              <PlusIcon size={16} />
              Add subgroup
            </button>
          </div>
        </div>

        {/* Sort direction dropdown */}
        {showSortDropdown && sortDropdownIndex !== null && (
          <Dropdown
            open={true}
            onClose={() => setSortDropdownIndex(null)}
            anchor={sortButtonRefs.current[sortDropdownIndex] ?? undefined}
            content={
              <ul className="py-1" role="menu">
                {(["asc", "desc"] as const).map((dir) => {
                  const col = getColumnById(
                    groupLevels[sortDropdownIndex]?.columnId ?? "",
                  );
                  const label = getSortLabel(col?.type ?? "text", dir);
                  return (
                    <li key={dir}>
                      <button
                        type="button"
                        role="menuitem"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() =>
                          handleSortDirectionSelect(sortDropdownIndex, dir)
                        }
                      >
                        {label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            }
            width={140}
            maxHeight={200}
          />
        )}

        {/* Field picker dropdown for editing a level or adding new */}
        {showFieldPicker && fieldPickerRowIndex !== null && (
          <Dropdown
            open={true}
            onClose={() => setFieldPickerRowIndex(null)}
            anchor={
              fieldPickerRowIndex < groupLevels.length
                ? fieldButtonRefs.current[fieldPickerRowIndex] ?? undefined
                : addSubgroupButtonRef.current ?? undefined
            }
            content={
              <div className="flex w-60 flex-col py-1">
                <div className="flex items-center gap-2 px-3 py-2">
                  <SearchIcon />
                  <input
                    type="text"
                    placeholder="Find a field"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {availableForPicker.length === 0 ? (
                    <p className="px-3 py-3 text-center text-xs text-gray-500">
                      No fields match
                    </p>
                  ) : (
                    availableForPicker.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => handleSelectField(col)}
                      >
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
                          {columnTypeIcon(col.type)}
                        </span>
                        <span>{col.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            }
            width={240}
            maxHeight={280}
          />
        )}
      </div>
    );
  }

  return (
    <Dropdown
      open={isOpen}
      onClose={onClose}
      anchor={anchorRef.current}
      content={content}
      width={isManageView ? 420 : 264}
      maxHeight={500}
    />
  );
}
