import { PlusIcon } from "../icons";

interface GridToolbarProps {
  onAddRow: () => void;
  onBulkInsert: () => void;
  onClearAll: () => void;
  recordCount: number;
  isBulkInserting?: boolean;
}

export function GridToolbar({
  onAddRow,
  onBulkInsert,
  onClearAll,
  recordCount,
  isBulkInserting = false,
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
          disabled={isBulkInserting}
          className={[
            "rounded px-2 py-0.5 text-[11px] text-white transition-colors",
            isBulkInserting
              ? "cursor-not-allowed bg-blue-400"
              : "bg-blue-600 hover:bg-blue-700"
          ].join(" ")}
        >
          {isBulkInserting ? (
            <span className="flex items-center gap-1">
              <svg
                className="h-3 w-3 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Inserting 100k rows...
            </span>
          ) : (
            "Add 100k rows"
          )}
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
