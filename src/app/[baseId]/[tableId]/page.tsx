import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

interface TablePageProps {
  params: Promise<{ baseId: string; tableId: string }>;
}

export default async function TablePage({ params }: TablePageProps) {
  const { baseId, tableId } = await params;

  const views = await api.view.getByTableId({ tableId });
  const firstView = views[0];

  if (!firstView) {
    return <div className="p-4 text-sm text-red-500">No views found in this table.</div>;
  }

  redirect(`/${baseId}/${tableId}/${firstView.id}`);
}
