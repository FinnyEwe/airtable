import { PlusIcon } from "../icons";

interface GridToolbarProps {
  onAddRow: () => void;
  onBulkInsert: () => void;
  onClearAll: () => void;
  recordCount: number;
}

export function GridToolbar({
  onAddRow,
  onBulkInsert,
  onClearAll,
  recordCount,
}: GridToolbarProps) {
  return (
    <div 
      className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-3"
      style={{ height: 28 }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onAddRow}
          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700"
        >
          <PlusIcon />
          <span>Add...</span>
        </button>
        <button
          onClick={onBulkInsert}
          className="rounded bg-blue-600 px-2 py-0.5 text-[11px] text-white hover:bg-blue-700"
        >
          Add 10k rows
        </button>
        <button
          onClick={onClearAll}
          className="rounded bg-red-600 px-2 py-0.5 text-[11px] text-white hover:bg-red-700"
        >
          Clear all
        </button>
      </div>
      <span className="text-[12px] text-gray-400">
        {`${recordCount} record${recordCount === 1 ? "" : "s"}`}
      </span>
    </div>
  );
}
