"use client";

import { createContext, useContext } from "react";
import type { Column } from "~/types/tableData";
import type { GroupLevel } from "./types";

export interface GroupDropdownContextValue {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  groupLevels: GroupLevel[];
  fieldPickerRowIndex: number | null;
  setFieldPickerRowIndex: (index: number | null) => void;
  sortDropdownIndex: number | null;
  setSortDropdownIndex: (index: number | null) => void;
  fieldButtonRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  sortButtonRefs: React.MutableRefObject<(HTMLButtonElement | null)[]>;
  addSubgroupButtonRef: React.RefObject<HTMLButtonElement | null>;
  filteredColumns: Column[];
  availableForPicker: Column[];
  getColumnById: (id: string) => Column | undefined;
  handleSelectField: (col: Column) => void;
  handleAddSubgroup: () => void;
  handleRemoveLevel: (index: number) => void;
  handleRemoveAllGroups: () => void;
  handleSortDirectionSelect: (index: number, direction: "asc" | "desc") => void;
}

const GroupDropdownContext = createContext<GroupDropdownContextValue | null>(null);

export function useGroupDropdownContext() {
  const ctx = useContext(GroupDropdownContext);
  if (!ctx) {
    throw new Error("useGroupDropdownContext must be used within GroupDropdownContext.Provider");
  }
  return ctx;
}

export const GroupDropdownProvider = GroupDropdownContext.Provider;
