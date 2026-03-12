import { ViewSidebar } from "../../../_components/airtable/ViewSidebar";
import { GridToolbar } from "../../../_components/airtable/GridToolbar";
import { AirtableGrid } from "../../../_components/airtable/AirtableGrid";

interface ViewPageProps {
  params: Promise<{ baseId: string; tableId: string; viewId: string }>;
}

export default async function ViewPage({ params }: ViewPageProps) {
  const { tableId, viewId } = await params;
  
  return (
    <div className="flex flex-1 overflow-hidden">
      <ViewSidebar tableId={tableId} viewId={viewId} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <GridToolbar />
        <AirtableGrid tableId={tableId} viewId={viewId} />
      </div>
    </div>
  );
}
