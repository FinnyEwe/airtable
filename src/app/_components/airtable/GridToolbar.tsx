"use client";

import { useState, useRef, useEffect, useCallback } from "react";
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
import { HideColumnsDropdown } from "./HideColumnsDropdown/HideColumnsDropdown";
import { FilterDropdown } from "./FilterDropdown/FilterDropdown";
import { SortDropdown } from "./SortDropdown/SortDropdown";

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
  searchQuery?: string;
  onSearchChange?: (value: string) => void;
}

export function GridToolbar({
  tableId,
  viewId,
  searchQuery = "",
  onSearchChange,
}: GridToolbarProps) {
  const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
  const [hideColumnsDropdownOpen, setHideColumnsDropdownOpen] = useState(false);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const groupButtonRef = useRef<HTMLButtonElement>(null);
  const hideColumnsButtonRef = useRef<HTMLButtonElement>(null);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (searchExpanded) {
      searchInputRef.current?.focus();
    }
  }, [searchExpanded]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setLocalSearch(v);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearchChange?.(v), 300);
    },
    [onSearchChange]
  );

  const handleSearchBlur = useCallback(() => {
    if (debounceRef.current !== undefined) {
      clearTimeout(debounceRef.current);
      debounceRef.current = undefined;
    }
    onSearchChange?.(localSearch);
  }, [localSearch, onSearchChange]);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    []
  );

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchExpanded]);

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
      <div ref={searchContainerRef} className="flex items-center">
        {searchExpanded && tableId && viewId ? (
          <div className="flex items-center gap-1 rounded border border-gray-200 bg-white py-0.5 pl-2 pr-1 shadow-sm">
            <input
              ref={searchInputRef}
              type="text"
              value={localSearch}
              onChange={handleSearchChange}
              onBlur={handleSearchBlur}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setSearchExpanded(false);
                  setLocalSearch(searchQuery);
                }
              }}
              placeholder="Search..."
              className="w-40 border-0 bg-transparent py-1 text-xs text-gray-700 placeholder-gray-400 outline-none"
            />
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded text-gray-500 hover:bg-gray-100"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => tableId && viewId && setSearchExpanded(true)}
            className={`flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100 ${
              searchQuery ? "bg-gray-100" : ""
            }`}
            aria-label="Search"
          >
            <SearchIcon />
          </button>
        )}
      </div>
    </div>
  );
}
