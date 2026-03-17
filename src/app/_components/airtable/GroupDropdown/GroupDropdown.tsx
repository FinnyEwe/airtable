"use client";

import { Dropdown } from "~/app/_components/ui/Dropdown";
import { SearchIcon, QuestionIcon } from "../icons";
import { columnTypeIcon } from "../utils/columnUtils";
import { GroupDropdownProvider, useGroupDropdownContext } from "./GroupDropdownContext";
import { GroupLevelsList } from "./GroupLevelsList";
import { useGroupDropdown } from "./useGroupDropdown";
import type { GroupDropdownProps } from "./types";

function GroupDropdownContent() {
  const {
    searchQuery,
    setSearchQuery,
    groupLevels,
    fieldPickerRowIndex,
    filteredColumns,
    handleSelectField,
  } = useGroupDropdownContext();

  const isManageView = groupLevels.length > 0;

  if (isManageView || fieldPickerRowIndex !== null) {
    return <GroupLevelsList />;
  }

  return (
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
}

export function GroupDropdown({
  tableId,
  viewId,
  anchorRef,
  isOpen,
  onClose,
}: GroupDropdownProps) {
  const groupDropdownValue = useGroupDropdown({ tableId, viewId, isOpen });
  const isManageView = groupDropdownValue.groupLevels.length > 0;

  return (
    <GroupDropdownProvider value={groupDropdownValue}>
      <Dropdown
        open={isOpen}
        onClose={onClose}
        anchor={anchorRef.current}
        content={<GroupDropdownContent />}
        width={isManageView ? 420 : 264}
        maxHeight={500}
      />
    </GroupDropdownProvider>
  );
}
