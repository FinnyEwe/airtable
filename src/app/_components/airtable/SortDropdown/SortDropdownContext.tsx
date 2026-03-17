"use client";

import { createContext, useContext } from "react";
import type { Column } from "~/types/tableData";
import type { SortLevel } from "./types";

export type SortDropdownContextValue = {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  sortLevels: SortLevel[];
  fieldPickerRowIndex: number | null;
  setFieldPickerRowIndex: (v: number | null) => void;
  directionDropdownIndex: number | null;
  setDirectionDropdownIndex: (v: number | null) => void;
  fieldButtonRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  directionButtonRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  addSortButtonRef: React.RefObject<HTMLButtonElement | null>;
  columns: Column[];
  filteredColumns: Column[];
  availableForPicker: Column[];
  getColumnById: (id: string) => Column | undefined;
  handleSelectColumn: (col: Column) => void;
  handleAddSort: () => void;
  handleRemoveSort: (index: number) => void;
  handleDirectionSelect: (index: number, direction: "asc" | "desc") => void;
};

export const SortDropdownContext =
  createContext<SortDropdownContextValue | null>(null);

export function SortDropdownProvider({
  value,
  children,
}: {
  value: SortDropdownContextValue;
  children: React.ReactNode;
}) {
  return (
    <SortDropdownContext.Provider value={value}>
      {children}
    </SortDropdownContext.Provider>
  );
}

export function useSortDropdownContext() {
  const ctx = useContext(SortDropdownContext);
  if (!ctx)
    throw new Error(
      "useSortDropdownContext must be used within SortDropdownProvider"
    );
  return ctx;
}
