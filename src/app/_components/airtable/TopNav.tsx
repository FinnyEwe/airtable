"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";

function AirtableIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 200 170" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M90.039 12.368 24.079 39.66c-3.664 1.47-3.63 6.67.056 8.086l66.183 25.386a29.5 29.5 0 0 0 21.08-.14l63.606-25.253c3.647-1.447 3.61-6.572-.057-7.966L113.12 12.29a29.5 29.5 0 0 0-23.081.079z" fill="#FFBF00"/>
      <path d="M105.312 94.282V166.2c0 3.838 3.955 6.386 7.477 4.787l70.87-31.988A5.337 5.337 0 0 0 186.8 134V62.086c0-3.838-3.955-6.387-7.477-4.788l-70.87 31.988a5.337 5.337 0 0 0-3.14 4.996z" fill="#26B5F8"/>
      <path d="M88.198 97.863 67.02 88.238l-2.382-1.098L17.59 65.788c-3.56-1.642-7.59.906-7.59 4.83V134.1a5.337 5.337 0 0 0 3.25 4.906l71.35 31.822c3.539 1.577 7.506-.974 7.506-4.84V102.87a5.337 5.337 0 0 0-3.909-5.007z" fill="#ED3049"/>
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}


export function TopNav() {
  const { data: bases } = api.base.getAll.useQuery();
  const params = useParams<{ baseId: string }>();
  const router = useRouter();

  const currentBase = bases?.find((b) => b.id === params.baseId) ?? null;

  return (
    <nav className="flex h-[53px] shrink-0 items-center justify-between bg-[#ffffff] px-3">
      {/* Left: logo + base name */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => router.push("/")}
          className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white/10"
        >
          <AirtableIcon />
        </button>
        <span className="px-2 py-1 text-sm font-medium text-black">
          {currentBase?.name ?? "Untitled Base"}
        </span>
      </div>

      {/* Center: nav tabs */}
      <div className="flex items-center">
        {[
          { label: "Data", active: true },
          { label: "Automations", active: false },
          { label: "Interfaces", active: false },
          { label: "Forms", active: false },
        ].map(({ label, active }) => (
          <button
            key={label}
            className={[
              "relative px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "text-black after:absolute after:bottom-[-8px] after:left-0 after:right-0 after:h-[2px] after:rounded-full after:bg-[#2d7ff9]"
                : "text-gray-400 hover:text-black",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        <button className="flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-white/10 hover:text-white">
          <HistoryIcon />
        </button>
        <button className="rounded px-2.5 py-1 text-xs font-medium text-gray-400 ring-1 ring-white/20 hover:bg-white/10">
          Launch
        </button>
        <button className="ml-1 flex h-7 w-7 items-center justify-center rounded text-gray-400 hover:bg-white/10 hover:text-white">
          <PencilIcon />
        </button>
        <button className="ml-1 flex items-center gap-1.5 rounded bg-[#2d7ff9] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#2164cc]">
          <UsersIcon />
          Share
        </button>
        <div className="ml-2 flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
          F
        </div>
      </div>
    </nav>
  );
}
