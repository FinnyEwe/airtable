"use client";

import { useState, useRef, useEffect } from "react";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  GridViewIcon,
  EyeOffIcon,
  FilterIcon,
  GroupIcon,
  SortIcon,
  PaletteIcon,
  ExpandIcon,
  ShareIcon,
  SearchIcon,
  XIcon,
} from "./icons";
import { GroupDropdown } from "./GroupDropdown";
import { HideColumnsDropdown } from "./HideColumnsDropdown/HideColumnsDropdown";
import { FilterDropdown } from "./FilterDropdown/FilterDropdown";
import { SortDropdown } from "./SortDropdown/SortDropdown";
import { Dropdown } from "~/app/_components/ui/Dropdown";
import { useSearchContext } from "./AirtableGrid/SearchContext";

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
  const searchContext = useSearchContext();
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [hideColumnsDropdownOpen, setHideColumnsDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const groupButtonRef = useRef<HTMLButtonElement>(null);
  const hideColumnsButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchDropdownOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchDropdownOpen]);

  const handleSearchClear = () => {
    searchContext.setSearchQuery("");
    setIsSearchDropdownOpen(false);
  };

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
            ref={
              key === "group"
                ? groupButtonRef
                : key === "hide"
                  ? hideColumnsButtonRef
                  : key === "filter"
                    ? filterButtonRef
                    : key === "sort"
                      ? sortButtonRef
                      : undefined
            }
            onClick={
              key === "group" && tableId
                ? () => setGroupDropdownOpen((v) => !v)
                : key === "hide" && tableId
                  ? () => setHideColumnsDropdownOpen((v) => !v)
                  : key === "filter" && tableId
                    ? () => setFilterDropdownOpen((v) => !v)
                    : key === "sort" && tableId
                      ? () => setSortDropdownOpen((v) => !v)
                      : undefined
            }
            className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 ${
              (key === "group" && groupDropdownOpen) ||
              (key === "hide" && hideColumnsDropdownOpen) ||
              (key === "filter" && filterDropdownOpen) ||
              (key === "sort" && sortDropdownOpen)
                ? "bg-gray-100"
                : ""
            }`}
          >
            {icon}
            {label && <span>{label}</span>}
          </button>
        ))}
      </div>

      {tableId && (
        <>
          <GroupDropdown
            tableId={tableId}
            viewId={viewId}
            anchorRef={groupButtonRef}
            isOpen={groupDropdownOpen}
            onClose={() => setGroupDropdownOpen(false)}
          />
          <HideColumnsDropdown
            tableId={tableId}
            viewId={viewId}
            anchorRef={hideColumnsButtonRef}
            isOpen={hideColumnsDropdownOpen}
            onClose={() => setHideColumnsDropdownOpen(false)}
          />
          <FilterDropdown
            tableId={tableId}
            viewId={viewId}
            anchorRef={filterButtonRef}
            isOpen={filterDropdownOpen}
            onClose={() => setFilterDropdownOpen(false)}
          />
          <SortDropdown
            tableId={tableId}
            viewId={viewId}
            anchorRef={sortButtonRef}
            isOpen={sortDropdownOpen}
            onClose={() => setSortDropdownOpen(false)}
          />
        </>
      )}

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Share and sync */}
      <button className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">
        <ShareIcon />
        <span>Share and sync</span>
      </button>

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Search */}
      <button
        ref={searchButtonRef}
        onClick={() => setIsSearchDropdownOpen(!isSearchDropdownOpen)}
        className={`flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 ${
          searchContext.searchQuery ? "bg-gray-100" : ""
        }`}
        aria-label="Search"
      >
        <SearchIcon />
      </button>

      <Dropdown
        open={isSearchDropdownOpen}
        onClose={() => {
          setIsSearchDropdownOpen(false);
          if (!searchContext.searchQuery) {
            searchContext.setSearchQuery("");
          }
        }}
        anchor={searchButtonRef.current}
        placement="bottom-end"
        width={420}
        noScroll
        content={(
          <div className="flex items-center gap-2 px-2 py-2">
            {/* Search input */}
            <div className="flex flex-1 items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1">
              <span className="text-gray-400">
                <SearchIcon />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Find"
                className="w-20 flex-1 border-0 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                value={searchContext.searchQuery}
                onChange={(e) => searchContext.setSearchQuery(e.target.value)}
              />
            </div>

            {/* Search result counter and navigation */}
            {searchContext.searchQuery && searchContext.totalMatches > 0 && (
              <>
                <span className="whitespace-nowrap text-sm text-gray-600">
                  {searchContext.currentMatchIndex + 1} of {searchContext.totalMatches}
                </span>
                <button
                  onClick={searchContext.navigatePrev}
                  disabled={searchContext.currentMatchIndex === 0}
                  className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Previous result"
                >
                  <ChevronUpIcon />
                </button>
                <button
                  onClick={searchContext.navigateNext}
                  disabled={searchContext.currentMatchIndex >= searchContext.totalMatches - 1}
                  className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                  aria-label="Next result"
                >
                  <ChevronDownIcon />
                </button>
              </>
            )}

            {/* Ask Omni button */}
            <button className="whitespace-nowrap rounded-md bg-gray-900 px-3 py-1 text-sm font-medium text-white hover:bg-gray-800">
              Ask Omni
            </button>

            {/* Close button */}
            <button
              onClick={handleSearchClear}
              className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100"
              aria-label="Close search"
            >
              <XIcon />
            </button>
          </div>
        )}
      />
    </div>
  );
}
