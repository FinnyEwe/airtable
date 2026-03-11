import { redirect } from "next/navigation";
import { api } from "~/trpc/server";

interface BasePageProps {
  params: Promise<{ baseId: string }>;
}

export default async function BasePage({ params }: BasePageProps) {
  const { baseId } = await params;

  const tables = await api.table.getByBaseId({ baseId });
  const firstTable = tables[0];

  if (!firstTable) {
    return <div className="p-4 text-sm text-red-500">No tables found in this base.</div>;
  }
  redirect(`/${baseId}/${firstTable.id}`);
}
