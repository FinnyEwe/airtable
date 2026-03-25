"use client";

import { useState, useRef, useEffect } from "react";
import { useGridCellContext } from "./useGridCellContext";
import { useSearchContext } from "./SearchContext";

interface EditableCellProps {
  rowId: string;
  columnId: string;
  value: unknown;
  isNumber: boolean;
  isSorted?: boolean;
  isFiltered?: boolean;
}

export function EditableCell({
  rowId,
  columnId,
  value,
  isNumber,
  isSorted = false,
  isFiltered = false,
}: EditableCellProps) {
  const { selectedCell, editingCell, onCellClick, onCellDoubleClick, onCellUpdate, onCancelEdit } = useGridCellContext();
  const searchContext = useSearchContext();
  
  const isEditing = editingCell?.rowId === rowId && editingCell?.columnId === columnId;
  const isSelected = selectedCell?.rowId === rowId && selectedCell?.columnId === columnId;
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <td
        className={[
          "h-[32px] border-b border-r border-gray-200 p-0 text-[13px] text-gray-700",
          isFiltered ? "bg-[#D0F0C0]" : isSorted ? "bg-[#FFDDC1]" : "",
        ].join(" ")}
      >
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            onCellUpdate(rowId, columnId, editValue || null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onCellUpdate(rowId, columnId, editValue || null);
            } else if (e.key === "Escape") {
              onCancelEdit();
            }
          }}
          onFocus={() => {
            setEditValue(String(value ?? ""));
          }}
          className={[
            "h-full w-full border-2 border-blue-500 bg-white px-2 outline-none",
            isNumber ? "text-right" : "text-left",
          ].join(" ")}
        />
      </td>
    );
  }

  const displayValue = String(value ?? "");
  const content = searchContext.highlightMatches(displayValue, rowId, columnId);

  return (
    <td
      onClick={() => onCellClick(rowId, columnId)}
      onDoubleClick={() => {
        onCellDoubleClick(rowId, columnId);
        setEditValue(String(value ?? ""));
      }}
      className={[
        "h-[32px] border-b border-r border-gray-200 px-2 text-[13px] text-gray-700 cursor-pointer",
        isNumber ? "text-right" : "text-left",
        isSelected 
          ? "ring-2 ring-inset ring-blue-500 bg-white" 
          : isFiltered
            ? "bg-[#D0F0C0] hover:bg-[#c5e5b5]"
            : isSorted 
              ? "bg-[#FFDDC1] hover:bg-[#ffd4b3]" 
              : "hover:bg-gray-50",
      ].join(" ")}
    >
      {content}
    </td>
  );
}
