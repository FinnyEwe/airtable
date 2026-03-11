"use client";

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M6 9l6 6 6-6" />
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

function EyeOffIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function GroupIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="3" y1="12" x2="3.01" y2="12" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="3" y1="18" x2="3.01" y2="18" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="15" y2="12" />
      <line x1="3" y1="18" x2="9" y2="18" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
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

const toolbarButtons = [
  { icon: <EyeOffIcon />, label: "Hide fields" },
  { icon: <FilterIcon />, label: "Filter" },
  { icon: <GroupIcon />, label: "Group" },
  { icon: <SortIcon />, label: "Sort" },
  { icon: <PaletteIcon />, label: "Color" },
  { icon: <ExpandIcon />, label: "" },
];

export function GridToolbar() {
  return (
    <div className="flex h-[37px] shrink-0 items-center border-b border-gray-200 bg-white px-3">
      {/* Grid view label */}
      <button className="mr-3 flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100">
        <GridViewIcon />
        <span>Grid view</span>
        <ChevronDownIcon />
      </button>

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Toolbar buttons */}
      <div className="flex items-center gap-0.5">
        {toolbarButtons.map(({ icon, label }) => (
          <button
            key={label || "expand"}
            className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
          >
            {icon}
            {label && <span>{label}</span>}
          </button>
        ))}
      </div>

      <div className="mx-1 h-4 w-px bg-gray-200" />

      {/* Share and sync */}
      <button className="flex items-center gap-1.5 rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100">
        <ShareIcon />
        <span>Share and sync</span>
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <button className="flex h-7 w-7 items-center justify-center rounded text-gray-500 hover:bg-gray-100">
        <SearchIcon />
      </button>
    </div>
  );
}
