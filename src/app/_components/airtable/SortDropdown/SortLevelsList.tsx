"use client";

import {
  QuestionIcon,
  ChevronDownIcon,
  PlusIcon,
  TextFieldIcon,
} from "../icons";
import { columnTypeIcon, getSortLabel } from "../utils/columnUtils";
import { GroupFieldPicker } from "../GroupDropdown/GroupFieldPicker";
import { useSortDropdownContext } from "./SortDropdownContext";
import { Dropdown } from "~/app/_components/ui/Dropdown";

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

export function SortLevelsList() {
  const {
    sortLevels,
    searchQuery,
    setSearchQuery,
    fieldPickerRowIndex,
    directionDropdownIndex,
    setFieldPickerRowIndex,
    setDirectionDropdownIndex,
    fieldButtonRefs,
    directionButtonRefs,
    addSortButtonRef,
    getColumnById,
    availableForPicker,
    handleSelectColumn,
    handleAddSort,
    handleRemoveSort,
    handleDirectionSelect,
  } = useSortDropdownContext();

  const showFieldPicker = fieldPickerRowIndex !== null;
  const showDirectionDropdown = directionDropdownIndex !== null;

  return (
    <div className="flex min-w-[440px] flex-col overflow-x-hidden p-2">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-1">
          <p className="text-xs font-semibold text-gray-600">Sort by</p>
          <button
            type="button"
            className="flex items-center rounded text-gray-400 hover:text-gray-600"
            aria-label="Learn more about sorting"
          >
            <QuestionIcon />
          </button>
        </div>
      </div>

      <hr className="mx-4 my-1 border-0 border-b border-gray-200" />

      {/* Sort levels */}
      <div
        className="overflow-y-auto overflow-x-hidden py-1"
        style={{
          minHeight: 70,
          maxHeight: "calc(100vh - 380px)",
        }}
      >
        <ul className="flex flex-col gap-1 pt-1">
          {sortLevels.map((level, index) => {
            const col = getColumnById(level.columnId);
            const isPickerOpen = fieldPickerRowIndex === index;

            return (
              <li
                key={index}
                className="flex items-center gap-3 px-4"
                style={{ minHeight: 36 }}
              >
                {/* Column picker */}
                <div className="w-[260px] shrink-0">
                  <button
                    ref={(el) => {
                      fieldButtonRefs.current[index] = el;
                    }}
                    type="button"
                    className="flex h-7 w-full items-center gap-1.5 rounded border border-gray-200 bg-white px-2 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setDirectionDropdownIndex(null);
                      setFieldPickerRowIndex(isPickerOpen ? null : index);
                    }}
                  >
                    <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
                      {col ? columnTypeIcon(col.type) : <TextFieldIcon />}
                    </span>
                    <span className="truncate flex-1">
                      {col?.name ?? "Choose field"}
                    </span>
                    <ChevronDownIcon className="shrink-0" />
                  </button>
                </div>

                {/* Direction selector */}
                <div className="w-[120px] shrink-0">
                  <button
                    ref={(el) => {
                      directionButtonRefs.current[index] = el;
                    }}
                    type="button"
                    className="flex h-7 w-full items-center justify-between rounded border border-gray-200 bg-white px-2 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      setFieldPickerRowIndex(null);
                      setDirectionDropdownIndex(
                        directionDropdownIndex === index ? null : index
                      );
                    }}
                  >
                    <span className="truncate">
                      {getSortLabel(col?.type ?? "text", level.direction)}
                    </span>
                    <ChevronDownIcon className="shrink-0" />
                  </button>
                </div>

                {/* Remove */}
                <button
                  type="button"
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Remove sort"
                  onClick={() => handleRemoveSort(index)}
                >
                  <XIcon />
                </button>
              </li>
            );
          })}
        </ul>

        {/* Add another sort */}
        <div className="mt-2 flex flex-1">
          <button
            ref={addSortButtonRef}
            type="button"
            className="flex flex-1 items-center gap-2 py-1.5 pl-4 text-sm font-medium text-gray-600 hover:text-gray-800"
            onClick={handleAddSort}
          >
            <PlusIcon size={16} />
            Add another sort
          </button>
        </div>
      </div>

      {/* Direction dropdown */}
      {showDirectionDropdown && directionDropdownIndex !== null && (
        <Dropdown
          open={true}
          onClose={() => setDirectionDropdownIndex(null)}
          anchor={
            directionButtonRefs.current[directionDropdownIndex] ?? undefined
          }
          content={
            <ul className="py-1" role="menu">
              {(["asc", "desc"] as const).map((dir) => {
                const col = getColumnById(
                  sortLevels[directionDropdownIndex]?.columnId ?? ""
                );
                const label = getSortLabel(col?.type ?? "text", dir);
                return (
                  <li key={dir}>
                    <button
                      type="button"
                      role="menuitem"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() =>
                        handleDirectionSelect(directionDropdownIndex, dir)
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
          onClose={() => setFieldPickerRowIndex(null)}
          anchor={
            fieldPickerRowIndex < sortLevels.length
              ? fieldButtonRefs.current[fieldPickerRowIndex] ?? undefined
              : addSortButtonRef.current ?? undefined
          }
          content={
            <GroupFieldPicker
              columns={availableForPicker}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSelectField={handleSelectColumn}
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
