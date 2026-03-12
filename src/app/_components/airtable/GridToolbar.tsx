"use client";

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

const toolbarButtons = [
  { icon: <EyeOffIcon />, label: "Hide fields" },
  { icon: <FilterIcon />, label: "Filter" },
  { icon: <GroupIcon />, label: "Group" },
  { icon: <SortIcon />, label: "Sort" },
  { icon: <PaletteIcon />, label: "Color" },
  { icon: <ExpandIcon />, label: "" },
];

export function GridToolbar() {
  return (
    <div className="flex h-[37px] shrink-0 items-center border-b border-gray-200 bg-white px-3">
      {/* Grid view label */}
      <button className="mr-3 flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
        <GridViewIcon />
        <span>Grid view</span>
        <ChevronDownIcon />
      </button>

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Toolbar buttons */}
      <div className="flex items-center gap-0.5">
        {toolbarButtons.map(({ icon, label }) => (
          <button
            key={label || "expand"}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            {icon}
            {label && <span>{label}</span>}
          </button>
        ))}
      </div>

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Share and sync */}
      <button className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">
        <ShareIcon />
        <span>Share and sync</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <button className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100">
        <SearchIcon />
      </button>
    </div>
  );
}
