"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { AirtableIcon, HistoryIcon, PencilIcon, UsersIcon } from "./icons";


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
