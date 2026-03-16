"use client";

import { columnTypeIcon } from "../utils/columnUtils";

interface ColumnHeaderProps {
  type: string;
  label: string;
}

export function ColumnHeader({ type, label }: ColumnHeaderProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-gray-400">{columnTypeIcon(type)}</span>
      <span>{label}</span>
    </div>
  );
}
