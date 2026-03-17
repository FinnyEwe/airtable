"use client";

import { Dropdown } from "~/app/_components/ui/Dropdown";
import { SearchIcon, QuestionIcon } from "../icons";
import { columnTypeIcon } from "../utils/columnUtils";
import { SortDropdownProvider, useSortDropdownContext } from "./SortDropdownContext";
import { SortLevelsList } from "./SortLevelsList";
import { useSortDropdown } from "./useSortDropdown";

interface SortDropdownProps {
  tableId: string | undefined;
  viewId?: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

function SortColumnPicker() {
  const {
    searchQuery,
    setSearchQuery,
    filteredColumns,
    handleSelectColumn,
  } = useSortDropdownContext();

  return (
    <div className="flex min-w-[22rem] flex-col overflow-x-hidden">
      {/* Header: Sort by + Learn more */}
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

      <hr className="mx-4 my-1 border-t border-gray-200" />

      {/* Search */}
      <div className="flex items-center gap-2 px-4 py-1">
        <span className="flex shrink-0 text-gray-400">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Find a field"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 border-none bg-transparent py-1 text-sm text-gray-700 placeholder-gray-400 outline-none"
          autoFocus
        />
      </div>

      {/* Column list */}
      <div
        className="overflow-y-auto overflow-x-hidden px-4 py-2"
        style={{
          minHeight: 100,
          maxHeight: "calc(100vh - 380px)",
        }}
      >
        {filteredColumns.length === 0 ? (
          <p className="py-4 text-center text-xs text-gray-500">
            No fields match
          </p>
        ) : (
          <div className="flex flex-col">
            {filteredColumns.map((col) => (
              <button
                key={col.id}
                type="button"
                className="flex w-full items-center gap-3 rounded px-2 py-1.5 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                onClick={() => handleSelectColumn(col)}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-500">
                  {columnTypeIcon(col.type)}
                </span>
                <span className="flex-1 truncate text-sm text-gray-700">
                  {col.name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SortDropdownContent() {
  const { sortLevels, fieldPickerRowIndex } = useSortDropdownContext();

  const isLevelsView = sortLevels.length > 0 || fieldPickerRowIndex !== null;

  if (isLevelsView) {
    return <SortLevelsList />;
  }

  return <SortColumnPicker />;
}

export function SortDropdown({
  tableId,
  viewId,
  anchorRef,
  isOpen,
  onClose,
}: SortDropdownProps) {
  const sortDropdownValue = useSortDropdown({
    tableId: tableId!,
    viewId,
    isOpen,
  });

  const isLevelsView =
    sortDropdownValue.sortLevels.length > 0 ||
    sortDropdownValue.fieldPickerRowIndex !== null;

  if (!tableId) return null;

  return (
    <SortDropdownProvider value={sortDropdownValue}>
      <Dropdown
        open={isOpen}
        onClose={onClose}
        anchor={anchorRef.current}
        content={<SortDropdownContent />}
        width={isLevelsView ? 460 : 360}
        maxHeight={500}
        placement="bottom-end"
      />
    </SortDropdownProvider>
  );
}
