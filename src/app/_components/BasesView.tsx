"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import {
  AirtableWordmark,
  PlusIcon,
  TableIcon,
  SearchIcon,
  HomeIcon,
} from "./airtable/icons";

const BASE_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-yellow-500",
  "bg-red-500",
  "bg-indigo-500",
  "bg-cyan-500",
];

function getColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return BASE_COLORS[Math.abs(hash) % BASE_COLORS.length]!;
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function CreateBaseModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name, setName] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">Create a base</h2>
        <p className="mb-4 text-sm text-gray-500">Give your new base a name to get started.</p>
        <input
          autoFocus
          type="text"
          placeholder="e.g. Project Tracker"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onCreate(name.trim()); }}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={() => { if (name.trim()) onCreate(name.trim()); }}
            disabled={!name.trim()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
          >
            Create base
          </button>
        </div>
      </div>
    </div>
  );
}

export function BasesView() {
  const router = useRouter();
  const { data: bases, isLoading, refetch } = api.base.getAll.useQuery();
  const createBase = api.base.create.useMutation({
    onSuccess: (newBase) => {
      void refetch();
      router.push(`/${newBase.id}`);
    },
  });

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = bases?.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-200 bg-white px-3 py-4">
        <div className="mb-6 px-2">
          <AirtableWordmark />
        </div>
        <nav className="flex flex-col gap-0.5">
          <button className="flex items-center gap-2.5 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800">
            <HomeIcon />
            Home
          </button>
          <button className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700">
            <SearchIcon />
            Search
          </button>
        </nav>
        <div className="mt-auto px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
            F
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Home</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-400">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search bases..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-40 bg-transparent outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <PlusIcon />
              Create a base
            </button>
          </div>
        </div>

        {/* Bases grid */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-24 text-sm text-gray-400">
              Loading bases...
            </div>
          ) : filtered.length === 0 && !search ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <TableIcon />
              </div>
              <p className="mb-1 text-base font-medium text-gray-700">No bases yet</p>
              <p className="mb-6 text-sm text-gray-400">Create your first base to get started.</p>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <PlusIcon />
                Create a base
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-gray-400">No bases match &ldquo;{search}&rdquo;</p>
          ) : (
            <>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                All bases
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {/* Create new base card */}
                <button
                  onClick={() => setShowModal(true)}
                  className="group flex h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-white text-gray-400 transition hover:border-blue-400 hover:text-blue-500"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 transition group-hover:bg-blue-50">
                    <PlusIcon />
                  </div>
                  <span className="text-xs font-medium">New base</span>
                </button>

                {/* Base cards */}
                {filtered.map((base) => (
                  <button
                    key={base.id}
                    onClick={() => router.push(`/${base.id}`)}
                    className="group flex h-[120px] flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:border-blue-300 hover:shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${getColor(base.id)} text-base font-bold text-white`}
                      >
                        {base.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate text-sm font-semibold text-gray-800 group-hover:text-blue-700">
                        {base.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <TableIcon />
                      <span>Updated {timeAgo(base.updatedAt)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      {showModal && (
        <CreateBaseModal
          onClose={() => setShowModal(false)}
          onCreate={(name) => {
            setShowModal(false);
            createBase.mutate({ name });
          }}
        />
      )}
    </div>
  );
}
