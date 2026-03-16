"use client";

import { useState, useRef } from "react";
import {
  ChevronDownIcon,
  GridViewIcon,
  EyeOffIcon,
  FilterIcon,
  GroupIcon,
  SortIcon,
  PaletteIcon,
  ExpandIcon,
  ShareIcon,
  SearchIcon,
} from "./icons";
import { GroupDropdown } from "./GroupDropdown";

const toolbarButtons = [
  { icon: <EyeOffIcon />, label: "Hide fields", key: "hide" },
  { icon: <FilterIcon />, label: "Filter", key: "filter" },
  { icon: <GroupIcon />, label: "Group", key: "group" },
  { icon: <SortIcon />, label: "Sort", key: "sort" },
  { icon: <PaletteIcon />, label: "Color", key: "color" },
  { icon: <ExpandIcon />, label: "", key: "expand" },
];

interface GridToolbarProps {
  tableId?: string;
  viewId?: string;
}

export function GridToolbar({ tableId, viewId }: GridToolbarProps) {
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const groupButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex h-[37px] shrink-0 items-center border-b border-gray-200 bg-white px-3">
      {/* Grid view label */}
      <button className="mr-3 flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
        <GridViewIcon />
        <span>Grid view</span>
        <ChevronDownIcon />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Toolbar buttons */}
      <div className="flex items-center gap-0.5">
        {toolbarButtons.map(({ icon, label, key }) => (
          <button
            key={key}
            ref={key === "group" ? groupButtonRef : undefined}
            onClick={
              key === "group" && tableId
                ? () => setGroupDropdownOpen((v) => !v)
                : undefined
            }
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 ${
              key === "group" && groupDropdownOpen ? "bg-gray-100" : ""
            }`}
          >
            {icon}
            {label && <span>{label}</span>}
          </button>
        ))}
      </div>

      {tableId && (
        <GroupDropdown
          tableId={tableId}
          viewId={viewId}
          anchorRef={groupButtonRef}
          isOpen={groupDropdownOpen}
          onClose={() => setGroupDropdownOpen(false)}
        />
      )}

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Share and sync */}
      <button className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">
        <ShareIcon />
        <span>Share and sync</span>
      </button>

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Search */}
      <button className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100">
        <SearchIcon />
      </button>
    </div>
  );
}
