"use client";

function PlusIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function GridViewIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="9" x2="9" y2="21" />
    </svg>
  );
}

export function ViewSidebar() {
  return (
    <aside className="flex w-[300px] shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Create new */}
      <button className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-50">
        <PlusIcon />
        <span>Create new...</span>
      </button>

      {/* Find a view */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <button className="flex flex-1 items-center gap-2 text-xs text-gray-500 hover:text-gray-700">
          <SearchIcon />
          <span>Find a view</span>
        </button>
        <button className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <GearIcon />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 my-1 border-t border-gray-100" />

      {/* Views list */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* Grid view - active */}
        <button className="flex w-full items-center gap-2 rounded-sm bg-[#e8f0fe] px-3 py-1.5 text-xs font-medium text-[#2d7ff9]">
          <GridViewIcon />
          <span>Grid view</span>
        </button>
      </div>
    </aside>
  );
}
