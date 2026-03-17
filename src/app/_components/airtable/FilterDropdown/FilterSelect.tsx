"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  offset,
  flip,
  shift,
  autoUpdate,
} from "@floating-ui/react";
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
  /** Search placeholder; when set, shows search input and filters options */
  searchPlaceholder?: string;
  /** Dropdown panel max dimensions */
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
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  const filteredOptions = useMemo(() => {
    if (!searchPlaceholder || !search.trim()) return options;
    const q = search.toLowerCase();
    return options.filter((opt) => {
      const text =
        typeof opt.searchText === "string"
          ? opt.searchText
          : typeof opt.label === "string"
            ? opt.label
            : "";
      return text.toLowerCase().includes(q);
    });
  }, [options, search, searchPlaceholder]);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
    middleware: [offset(4), flip(), shift({ padding: 8 })],
  });

  const click = useClick(context);
  const dismiss = useDismiss(context, { outsidePress: true });
  const { getReferenceProps, getFloatingProps } = useInteractions([
    click,
    dismiss,
  ]);

  const selected = options.find((o) => o.value === value);
  const label = selected?.label ?? placeholder;

  const trigger = (
    <button
      ref={refs.setReference}
      type="button"
      {...getReferenceProps()}
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
  );

  const menu =
    mounted &&
    open &&
    createPortal(
      <div
        ref={refs.setFloating}
        style={{
          ...floatingStyles,
          zIndex: 60,
          minWidth: Math.max(
            refs.reference.current?.getBoundingClientRect().width ?? minWidth,
            124
          ),
          maxWidth,
        }}
        {...getFloatingProps()}
        className="overflow-hidden rounded-md border border-gray-200 bg-white p-2 shadow-lg"
      >
        {searchPlaceholder && (
          <div className="mb-2 flex min-h-8 items-center rounded">
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
          className="overflow-y-auto"
          style={{ maxHeight: searchPlaceholder ? maxHeight - 48 : maxHeight }}
        >
          {filteredOptions.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      </div>,
      document.body
    );

  return (
    <>
      {trigger}
      {menu}
    </>
  );
}
