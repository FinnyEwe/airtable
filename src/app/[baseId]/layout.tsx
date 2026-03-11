import { TopNav } from "../_components/airtable/TopNav";
import { BaseSidebar } from "../_components/airtable/BaseSidebar";
import { TableTabs } from "../_components/airtable/TableTabs";

export default function BaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden font-sans">
      <BaseSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopNav />
        <TableTabs />
        {children}
      </div>
    </div>
  );
}
