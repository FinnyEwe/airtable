"use client";

import { GridToolbar } from "../../../_components/airtable/GridToolbar";
import { AirtableGrid } from "../../../_components/airtable/AirtableGrid";

interface ViewContentProps {
  tableId: string;
  viewId: string;
}

export function ViewContent({ tableId, viewId }: ViewContentProps) {
  return (
    <AirtableGrid tableId={tableId} viewId={viewId} />
  );
}
