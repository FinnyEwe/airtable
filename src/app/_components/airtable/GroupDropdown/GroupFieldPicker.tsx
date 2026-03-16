"use client";

import { SearchIcon } from "../icons";
import { columnTypeIcon } from "../utils/columnUtils";

import type { Column } from "~/types/tableData";

interface GroupFieldPickerProps {
  columns: Column[];
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSelectField: (col: Column) => void;
  placeholder?: string;
  maxHeight?: number;
  autoFocus?: boolean;
}

export function GroupFieldPicker({
  columns,
  searchQuery,
  onSearchChange,
  onSelectField,
  placeholder = "Find a field",
  maxHeight = 400,
  autoFocus = false,
}: GroupFieldPickerProps) {
  return (
    <div className="flex w-60 flex-col py-1">
      <div className="flex items-center gap-2 px-3 py-2">
        <SearchIcon />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
          autoFocus={autoFocus}
        />
      </div>
      <div
        className="overflow-y-auto"
        style={{ maxHeight: maxHeight === 400 ? undefined : maxHeight }}
      >
        {columns.length === 0 ? (
          <p className="px-3 py-3 text-center text-xs text-gray-500">
            No fields match
          </p>
        ) : (
          columns.map((col) => (
            <button
              key={col.id}
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              onClick={() => onSelectField(col)}
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
