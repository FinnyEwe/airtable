import { ViewSidebar } from "../../../_components/airtable/ViewSidebar";
import { ViewContent } from "./ViewContent";

interface ViewPageProps {
  params: Promise<{ baseId: string; tableId: string; viewId: string }>;
}

export default async function ViewPage({ params }: ViewPageProps) {
  const { tableId, viewId } = await params;

  return (
    <div className="flex flex-1 overflow-hidden">
      <ViewSidebar tableId={tableId} viewId={viewId} />
      <ViewContent tableId={tableId} viewId={viewId} />
    </div>
  );
}
