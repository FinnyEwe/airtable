"use client";

import { useState } from "react";
import { GridToolbar } from "../../../_components/airtable/GridToolbar";
import { AirtableGrid } from "../../../_components/airtable/AirtableGrid";

interface ViewContentProps {
  tableId: string;
  viewId: string;
}

export function ViewContent({ tableId, viewId }: ViewContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <GridToolbar
        tableId={tableId}
        viewId={viewId}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <AirtableGrid
        tableId={tableId}
        viewId={viewId}
        searchQuery={searchQuery}
      />
    </div>
  );
}
