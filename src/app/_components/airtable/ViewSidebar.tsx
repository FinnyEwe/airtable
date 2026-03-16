"use client";

import { useRouter, useParams } from "next/navigation";
import { api } from "~/trpc/react";
import { useState, useRef, useEffect } from "react";
import {
  PlusIcon,
  SearchIcon,
  GearIcon,
  GridViewIcon,
  UsersThreeIcon,
} from "./icons";

interface ViewSidebarProps {
  tableId: string;
  viewId: string;
}

export function ViewSidebar({ tableId, viewId }: ViewSidebarProps) {
  const router = useRouter();
  const params = useParams<{ baseId: string }>();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [viewName, setViewName] = useState("Grid Name");
  const [editPermission, setEditPermission] = useState<"collaborative" | "personal" | "locked">("collaborative");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  const { data: views = [] } = api.view.getByTableId.useQuery(
    { tableId },
    { enabled: !!tableId },
  );

  const utils = api.useUtils()

  const createViewMutation = api.view.create.useMutation({
    onSuccess: (newView) => {
      router.push(`/${params.baseId}/${tableId}/${newView.id}`);
      void utils.view.getByTableId.invalidate()
    },
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]);

  const handleCreateNewClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.top,
        left: rect.right + 8,
      });
    }
    setShowDropdown(!showDropdown);
  };

  const handleGridClick = () => {
    setShowDropdown(false);
    setShowDialog(true);
  };

  const handleCreateView = () => {
    createViewMutation.mutate({
      name: viewName,
      type: "grid",
      tableId: tableId,
      //TODO: Change to actual User IDs
      createdById: "cmmllv5360000exgzm1wtm336", 
    });
    setShowDialog(false);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setViewName("Grid Name");
    setEditPermission("collaborative");
  };



  return (
    <aside className="flex w-[300px] roundshrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Create new */}
      <button
        ref={buttonRef}
        onClick={handleCreateNewClick}
        className="flex items-center gap-2 px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-50"
      >
        <PlusIcon />
        <span>Create new...</span>
      </button>

      {/* Dropdown menu */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="fixed z-50 w-48 rounded-lg bg-white shadow-lg"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <div className="py-1">
            <button
              onClick={handleGridClick}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              <GridViewIcon />
              <span>Grid</span>
            </button>
          </div>
        </div>
      )}

      {/* Create Grid Dialog */}
      {showDialog && (
        <div
          role="dialog"
          tabIndex={-1}
          className="fixed z-50 w-[400px] rounded-xl bg-white p-4 shadow-2xl"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          {/* View name input */}
          <div className="flex flex-col pt-1">
            <input
              aria-label="Update view name"
              type="text"
              className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              maxLength={256}
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
            />
            <div className="my-1 min-h-[18px] pl-1 text-xs opacity-0" />
          </div>

          {/* Who can edit section */}
          <div className="pb-1 text-base font-semibold">Who can edit</div>
          <div className="pb-1">
            <ul role="radiogroup" className="flex items-center justify-start">
              <li
                className="mr-4 flex cursor-pointer items-center"
                role="radio"
                aria-checked={editPermission === "collaborative"}
                onClick={() => setEditPermission("collaborative")}
              >
                <div className="mr-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-gray-300">
                  {editPermission === "collaborative" && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
                <UsersThreeIcon />
                <span className="ml-1 text-sm">Collaborative</span>
              </li>
            </ul>
            <div className="mt-1 text-xs text-gray-500">
              All collaborators can edit the configuration
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 pt-4">
            <button
              className="rounded-lg bg-transparent px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              type="button"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
              type="button"
              onClick={handleCreateView}
              data-tutorial-selector-id="createViewConfigurationCreateViewButton"
            >
              Create new view
            </button>
          </div>
        </div>
      )}

      {/* Find a view */}
      <div className="flex items-center justify-between px-3 py-1.5">
        <button className="flex flex-1 items-center gap-2 text-xs text-gray-500 hover:text-gray-700">
          <SearchIcon />
          <span>Find a view</span>
        </button>
        <button className="flex h-5 w-5 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600">
          <GearIcon />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 my-1 border-t border-gray-100" />

      {/* Views list */}
      <div className="flex-1 overflow-y-auto py-1">
        {views.map((view) => {
          const isActive = view.id === viewId;
          return (
            <button
              key={view.id}
              onClick={() => router.push(`/${params.baseId}/${tableId}/${view.id}`)}
              className={[
                "flex w-full items-center gap-2 rounded-sm px-3 py-1.5 text-xs font-medium",
                isActive
                  ? "bg-[#e8f0fe] text-[#2d7ff9]"
                  : "text-gray-600 hover:bg-gray-50",
              ].join(" ")}
            >
              <GridViewIcon />
              <span>{view.name}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
