"use client";

import { useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Dropdown } from "~/app/_components/ui/Dropdown";
import { ChevronDownIcon, PlusIcon, GridIcon, ToolsIcon } from "./icons";

const addOrImportSections = [
  {
    heading: "Add a blank table",
    items: [{ label: "Start from scratch", dividerBelow: true }],
  },
  {
    heading: "Add from other sources",
    items: [
      { label: "CSV file" },
      { label: "Google Sheets" },
      { label: "Microsoft Excel" },
    ],
  },
];

export function TableTabs() {
  const params = useParams<{ baseId: string; tableId?: string }>();
  const router = useRouter();
  const { data: tables = [] } = api.table.getByBaseId.useQuery(
    { baseId: params.baseId },
    { enabled: !!params.baseId },
  );

  const activeTableId = params.tableId ?? tables[0]?.id ?? "";
  const [addOpen, setAddOpen] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex h-[37px] shrink-0 items-stretch border-b border-gray-200 bg-[#f0ede9] pr-2">
      {/* Table tabs */}
      <div className="flex items-stretch">
        {tables.map((table) => {
          const isActive = table.id === activeTableId;
          return (
            <button
              key={table.id}
              onClick={() => router.push(`/${params.baseId}/${table.id}`)}
              className={[
                "flex items-center gap-1.5 px-3 text-xs font-medium transition-colors",
                isActive
                  ? "rounded-tr-sm border-t border-gray-300 bg-white text-gray-700 shadow-[0_-1px_2px_rgba(0,0,0,0.05)]"
                  : "text-gray-500 hover:bg-black/5 hover:text-gray-700",
              ].join(" ")}
            >
              <GridIcon />
              <span>{table.name}</span>
              {isActive && <ChevronDownIcon />}
            </button>
          );
        })}
      </div>

      {/* Add or import */}
      <button
        ref={addButtonRef}
        onClick={() => setAddOpen((v) => !v)}
        className="ml-1 flex items-center gap-1 rounded px-2.5 py-1 text-xs text-gray-500 hover:bg-black/5"
      >
        <PlusIcon />
        <span>Add or import</span>
      </button>
      <Dropdown
        open={addOpen}
        onClose={() => setAddOpen(false)}
        anchor={addButtonRef.current}
        sections={addOrImportSections}
        width={240}
      />

      {/* Spacer */}
      <div className="flex-1" />

      {/* Tools */}
      <button className="flex items-center gap-1 rounded px-2 text-xs text-gray-500 hover:bg-black/5">
        <ToolsIcon />
        <span>Tools</span>
        <ChevronDownIcon />
      </button>
    </div>
  );
}

