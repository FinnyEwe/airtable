import { PlusIcon } from "../icons";

interface GridToolbarProps {
  onAddRow: () => void;
  onBulkInsert: () => void;
  onClearAll: () => void;
  isAddingRow: boolean;
  isBulkInserting: boolean;
  isClearing: boolean;
  recordCount: number;
}

export function GridToolbar({
  onAddRow,
  onBulkInsert,
  onClearAll,
  isAddingRow,
  isBulkInserting,
  isClearing,
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
          disabled={isAddingRow}
          className="flex items-center gap-1 text-[12px] text-gray-500 hover:text-gray-700 disabled:opacity-50"
        >
          <PlusIcon />
          <span>Add...</span>
        </button>
        <button
          onClick={onBulkInsert}
          disabled={isBulkInserting}
          className="rounded bg-blue-600 px-2 py-0.5 text-[11px] text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isBulkInserting ? "Inserting..." : "Add 10k rows"}
        </button>
        <button
          onClick={onClearAll}
          disabled={isClearing}
          className="rounded bg-red-600 px-2 py-0.5 text-[11px] text-white hover:bg-red-700 disabled:opacity-50"
        >
          {isClearing ? "Clearing..." : "Clear all"}
        </button>
      </div>
      <span className="text-[12px] text-gray-400">
        {`${recordCount} record${recordCount === 1 ? "" : "s"}`}
      </span>
    </div>
  );
}
