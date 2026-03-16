"use client";

import { Dropdown } from "~/app/_components/ui/Dropdown";
import {
  QuestionIcon,
  ChevronDownIcon,
  TrashIcon,
  PlusIcon,
  TextFieldIcon,
} from "../icons";
import { columnTypeIcon, getSortLabel } from "../utils/columnUtils";
import { GroupFieldPicker } from "./GroupFieldPicker";
import type { GroupLevel } from "./types";

import type { Column } from "~/types/tableData";

interface GroupLevelsListProps {
  groupLevels: GroupLevel[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  fieldPickerRowIndex: number | null;
  sortDropdownIndex: number | null;
  onFieldPickerRowIndexChange: (index: number | null) => void;
  onSortDropdownIndexChange: (index: number | null) => void;
  fieldButtonRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  sortButtonRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  addSubgroupButtonRef: React.RefObject<HTMLButtonElement | null>;
  getColumnById: (id: string) => Column | undefined;
  availableForPicker: Column[];
  onSelectField: (col: Column) => void;
  onAddSubgroup: () => void;
  onRemoveLevel: (index: number) => void;
  onRemoveAllGroups: () => void;
  onSortDirectionSelect: (index: number, direction: "asc" | "desc") => void;
}

export function GroupLevelsList({
  groupLevels,
  searchQuery,
  onSearchChange,
  fieldPickerRowIndex,
  sortDropdownIndex,
  onFieldPickerRowIndexChange,
  onSortDropdownIndexChange,
  fieldButtonRefs,
  sortButtonRefs,
  addSubgroupButtonRef,
  getColumnById,
  availableForPicker,
  onSelectField,
  onAddSubgroup,
  onRemoveLevel,
  onRemoveAllGroups,
  onSortDirectionSelect,
}: GroupLevelsListProps) {
  const showFieldPicker = fieldPickerRowIndex !== null;
  const showSortDropdown = sortDropdownIndex !== null;

  return (
    <div className="flex min-w-[420px] flex-col p-1.5">
      {/* Header */}
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
            onClick={onRemoveAllGroups}
          >
            Remove grouping
          </button>
        </div>
      </div>

      <hr className="mx-3 my-2 border-0 border-b border-gray-200" />

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
                <div className="w-60 shrink-0">
                  <button
                    ref={(el) => {
                      fieldButtonRefs.current[index] = el;
                    }}
                    type="button"
                    className="flex h-7 w-full items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                    onClick={() => {
                      onSortDropdownIndexChange(null);
                      onFieldPickerRowIndexChange(isPickerOpen ? null : index);
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

                <div className="w-[120px] shrink-0">
                  <button
                    ref={(el) => {
                      sortButtonRefs.current[index] = el;
                    }}
                    type="button"
                    className="flex h-7 w-full items-center justify-between rounded border border-gray-200 bg-gray-50 px-2 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-100"
                    onClick={() => {
                      onFieldPickerRowIndexChange(null);
                      onSortDropdownIndexChange(
                        sortDropdownIndex === index ? null : index,
                      );
                    }}
                  >
                    <span>
                      {getSortLabel(col?.type ?? "text", level.sortDirection)}
                    </span>
                    <ChevronDownIcon />
                  </button>
                </div>

                <div className="w-7 shrink-0" />

                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Remove group"
                  onClick={() => onRemoveLevel(index)}
                >
                  <TrashIcon />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-2 flex flex-1">
          <button
            ref={addSubgroupButtonRef}
            type="button"
            className="flex flex-1 items-center gap-2 py-1.5 pl-3 text-sm font-medium text-gray-600 hover:text-gray-800"
            onClick={onAddSubgroup}
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
          onClose={() => onSortDropdownIndexChange(null)}
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
                        onSortDirectionSelect(sortDropdownIndex, dir)
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

      {/* Field picker dropdown */}
      {showFieldPicker && fieldPickerRowIndex !== null && (
        <Dropdown
          open={true}
          onClose={() => onFieldPickerRowIndexChange(null)}
          anchor={
            fieldPickerRowIndex < groupLevels.length
              ? fieldButtonRefs.current[fieldPickerRowIndex] ?? undefined
              : addSubgroupButtonRef.current ?? undefined
          }
          content={
            <GroupFieldPicker
              columns={availableForPicker}
              searchQuery={searchQuery}
              onSearchChange={onSearchChange}
              onSelectField={onSelectField}
              maxHeight={48 * 6}
            />
          }
          width={240}
          maxHeight={280}
        />
      )}
    </div>
  );
}
