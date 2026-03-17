"use client";

import { useState, useRef, useMemo } from "react";
import { Dropdown } from "~/app/_components/ui/Dropdown";
import { ChevronDownIcon } from "../icons";

export interface FilterSelectOption<T> {
  value: T;
  label: React.ReactNode;
  searchText?: string;
}

interface FilterSelectProps<T extends string> {
  value: T;
  options: FilterSelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  renderTrigger?: (label: React.ReactNode, isOpen: boolean) => React.ReactNode;
  className?: string;
  minWidth?: number;
  searchPlaceholder?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export function FilterSelect<T extends string>({
  value,
  options,
  onChange,
  placeholder = "Select",
  renderTrigger,
  className = "",
  minWidth = 120,
  searchPlaceholder,
  maxWidth = 280,
  maxHeight = 220,
}: FilterSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);

  const filteredOptions = useMemo(() => {
    if (!searchPlaceholder || !search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((opt) => {
      const text =
        typeof opt.searchText === "string"
          ? opt.searchText
          : typeof opt.label === "string"
            ? (opt.label as string)
            : "";
      return text.toLowerCase().includes(q);
    });
  }, [options, search, searchPlaceholder]);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? placeholder;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex min-w-0 items-center justify-between gap-1 overflow-hidden rounded px-2 py-1.5 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
        style={{ minWidth }}
      >
        {renderTrigger ? (
          renderTrigger(label, open)
        ) : (
          <>
            <span className="min-w-0 truncate">{label}</span>
            <ChevronDownIcon />
          </>
        )}
      </button>

      <Dropdown
        open={open}
        onClose={() => {
          setOpen(false);
          setSearch("");
        }}
        anchor={buttonRef.current}
        width={maxWidth}
        maxHeight={maxHeight}
        content={
          <div>
            {searchPlaceholder && (
              <div className="flex min-h-8 items-center rounded p-2">
                <input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 w-full border-0 bg-transparent px-2 text-sm text-gray-700 placeholder-gray-400 outline-none"
                  autoFocus
                />
              </div>
            )}
            <ul
              className="overflow-y-auto p-2"
              style={{
                maxHeight: searchPlaceholder ? maxHeight - 48 : maxHeight,
              }}
            >
              {filteredOptions.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        }
      />
    </>
  );
}
