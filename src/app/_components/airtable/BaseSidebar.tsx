"use client";

import { useRouter } from "next/navigation";

function ArrowLeftIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

function NotificationIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

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
