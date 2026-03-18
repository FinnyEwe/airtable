import { redirect } from "next/navigation";
import { auth } from "~/server/auth";
import { BasesView } from "./_components/BasesView";

export default async function HomePage() {
  const session = await auth();
  if (!session) redirect("/signin");
  return <BasesView />;
}
