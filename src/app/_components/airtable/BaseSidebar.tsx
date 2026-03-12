"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  HomeIcon,
  SearchIcon,
  NotificationIcon,
  HelpIcon,
} from "./icons";

interface SidebarButtonProps {
  onClick?: () => void;
  label: string;
  children: React.ReactNode;
  active?: boolean;
}

function SidebarButton({ onClick, label, children, active }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={[
        "group relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
        active
          ? "bg-gray-100 text-gray-800"
          : "text-gray-400 hover:bg-gray-100 hover:text-gray-700",
      ].join(" ")}
    >
      {children}
      {/* Tooltip */}
      <span className="pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
        {label}
      </span>
    </button>
  );
}

export function BaseSidebar() {
  const router = useRouter();

  return (
    <aside className="flex w-[60px] shrink-0 flex-col items-center gap-1 border-r border-gray-200 bg-white py-2">
      {/* Back to home */}
      <SidebarButton onClick={() => router.push("/")} label="Back to home">
        <ArrowLeftIcon />
      </SidebarButton>

      <div className="my-1 w-6 border-t border-gray-200" />

      {/* Nav icons */}
      <SidebarButton label="Home" active>
        <HomeIcon />
      </SidebarButton>
      <SidebarButton label="Search">
        <SearchIcon />
      </SidebarButton>

      {/* Push remaining to bottom */}
      <div className="flex-1" />

      <SidebarButton label="Notifications">
        <NotificationIcon />
      </SidebarButton>
      <SidebarButton label="Help">
        <HelpIcon />
      </SidebarButton>
    </aside>
  );
}
