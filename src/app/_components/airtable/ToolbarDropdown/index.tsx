"use client";

import React, { useState } from "react";
import { Dropdown } from "~/app/_components/ui/Dropdown";
import type { Placement } from "@floating-ui/react";
import {
  QuestionIcon,
  ChevronDownIcon,
  TrashIcon,
  PlusIcon,
  SearchIcon,
  TextFieldIcon,
} from "../icons";
import { columnTypeIcon, getSortLabel } from "../utils/columnUtils";
import type { Column } from "~/types/tableData";

// ─── Root ────────────────────────────────────────────────────────────────────

interface RootProps {
  open: boolean;
  onClose: () => void;
  anchor: HTMLElement | null | undefined;
  width?: number;
  maxHeight?: number;
  placement?: Placement;
  children: React.ReactNode;
}

function Root({
  open,
  onClose,
  anchor,
  width = 320,
  maxHeight = 500,
  placement,
  children,
}: RootProps) {
  return (
    <Dropdown
      open={open}
      onClose={onClose}
      anchor={anchor}
      width={width}
      maxHeight={maxHeight}
      placement={placement}
      content={<div className="flex flex-col">{children}</div>}
    />
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

interface HeaderProps {
  title: string;
  children?: React.ReactNode;
}

function Header({ title, children }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2">
      <div className="flex items-center gap-1">
        <p className="text-xs font-semibold text-gray-600">{title}</p>
        <button
          type="button"
          className="flex items-center rounded text-gray-400 hover:text-gray-600"
          aria-label={`Learn more about ${title.toLowerCase()}`}
        >
          <QuestionIcon />
        </button>
      </div>
      {children && (
        <div className="flex items-center gap-3">{children}</div>
      )}
    </div>
  );
}

// ─── HeaderAction ────────────────────────────────────────────────────────────

interface HeaderActionProps {
  onClick?: () => void;
  variant?: "default" | "danger";
  children: React.ReactNode;
}

function HeaderAction({
  onClick,
  variant = "default",
  children,
}: HeaderActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        variant === "danger"
          ? "text-xs text-red-500 hover:text-red-600 hover:underline"
          : "text-xs text-blue-600 hover:text-blue-700"
      }
    >
      {children}
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────

function Divider() {
  return <hr className="mx-3 my-1 border-0 border-b border-gray-200" />;
}

// ─── SearchHeader ────────────────────────────────────────────────────────────

interface SearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  trailing?: React.ReactNode;
}

function SearchHeader({
  value,
  onChange,
  placeholder = "Find a field",
  autoFocus = true,
  trailing,
}: SearchHeaderProps) {
  return (
    <div className="flex items-center border-b border-gray-200 px-3 py-2">
      <span className="flex shrink-0 text-gray-400">
        <SearchIcon />
      </span>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 border-none bg-transparent px-2 py-1 text-sm text-gray-700 placeholder-gray-400 outline-none"
        autoFocus={autoFocus}
      />
      {trailing}
    </div>
  );
}

// ─── List ────────────────────────────────────────────────────────────────────

interface ListProps {
  children: React.ReactNode;
  minHeight?: number;
}

function List({ children, minHeight = 70 }: ListProps) {
  return (
    <div
      className="overflow-y-auto py-1"
      style={{ minHeight, maxHeight: "calc(100vh - 380px)" }}
    >
      {children}
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

interface RowProps {
  children: React.ReactNode;
}

function Row({ children }: RowProps) {
  return (
    <li className="flex items-center gap-3 px-3" style={{ minHeight: 36 }}>
      {children}
    </li>
  );
}

// ─── FieldSelect ─────────────────────────────────────────────────────────────

interface FieldSelectProps {
  column: Column | undefined;
  onClick: () => void;
  width?: number;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

function FieldSelect({
  column,
  onClick,
  width = 260,
  buttonRef,
}: FieldSelectProps) {
  return (
    <div style={{ width }} className="shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        className="flex h-7 w-full items-center gap-1.5 rounded border border-gray-200 bg-gray-50 px-2 text-left text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-100"
      >
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
          {column ? columnTypeIcon(column.type) : <TextFieldIcon />}
        </span>
        <span className="flex-1 truncate">
          {column?.name ?? "Choose field"}
        </span>
        <ChevronDownIcon />
      </button>
    </div>
  );
}

// ─── DirectionSelect ─────────────────────────────────────────────────────────

interface DirectionSelectProps {
  columnType?: string;
  direction: "asc" | "desc";
  onClick: () => void;
  width?: number;
  buttonRef?: (el: HTMLButtonElement | null) => void;
}

function DirectionSelect({
  columnType = "text",
  direction,
  onClick,
  width = 120,
  buttonRef,
}: DirectionSelectProps) {
  return (
    <div style={{ width }} className="shrink-0">
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        className="flex h-7 w-full items-center justify-between rounded border border-gray-200 bg-gray-50 px-2 text-sm text-gray-700 hover:border-gray-300 hover:bg-gray-100"
      >
        <span className="truncate">
          {getSortLabel(columnType, direction)}
        </span>
        <ChevronDownIcon />
      </button>
    </div>
  );
}

// ─── RemoveButton ────────────────────────────────────────────────────────────

function XIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

interface RemoveButtonProps {
  onClick: () => void;
  icon?: "trash" | "x";
  label?: string;
}

function RemoveButton({
  onClick,
  icon = "x",
  label = "Remove",
}: RemoveButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      aria-label={label}
    >
      {icon === "trash" ? <TrashIcon /> : <XIcon />}
    </button>
  );
}

// ─── AddButton ───────────────────────────────────────────────────────────────

interface AddButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

function AddButton({ onClick, children, buttonRef }: AddButtonProps) {
  return (
    <div className="mt-2 flex flex-1 px-3">
      <button
        ref={buttonRef}
        type="button"
        onClick={onClick}
        className="flex flex-1 items-center gap-2 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
      >
        <PlusIcon size={16} />
        {children}
      </button>
    </div>
  );
}

// ─── ToggleRow ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  checked: boolean;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

function Toggle({ checked }: { checked: boolean }) {
  return (
    <span
      role="img"
      aria-label={checked ? "Visible" : "Hidden"}
      className={`flex shrink-0 items-center rounded-full p-0.5 transition-colors ${
        checked ? "bg-green-500" : "bg-gray-300"
      }`}
      style={{ width: 24, height: 14 }}
    >
      <span
        className={`block h-2 w-2 shrink-0 rounded-full bg-white shadow-sm transition-transform duration-150 ease-out ${
          checked ? "translate-x-[12px]" : "translate-x-0"
        }`}
        style={{ width: 8 }}
      />
    </span>
  );
}

function ToggleRow({ checked, icon, label, onClick }: ToggleRowProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded px-1 py-1.5 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
      >
        <Toggle checked={checked} />
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-500">
          {icon}
        </span>
        <span className="flex-1 truncate text-sm text-gray-700">{label}</span>
      </button>
    </li>
  );
}

// ─── ColumnList (for initial field picker view) ──────────────────────────────

interface ColumnListProps {
  columns: Column[];
  onSelect: (col: Column) => void;
  emptyMessage?: string;
}

function ColumnList({
  columns,
  onSelect,
  emptyMessage = "No fields match",
}: ColumnListProps) {
  if (columns.length === 0) {
    return (
      <p className="px-3 py-4 text-center text-xs text-gray-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {columns.map((col) => (
        <button
          key={col.id}
          type="button"
          onClick={() => onSelect(col)}
          className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 focus:bg-blue-50 focus:text-blue-600 focus:outline-none"
        >
          <span className="flex h-4 w-4 shrink-0 items-center justify-center text-gray-400">
            {columnTypeIcon(col.type)}
          </span>
          <span className="truncate">{col.name}</span>
        </button>
      ))}
    </div>
  );
}

// ─── DirectionPickerPopover ──────────────────────────────────────────────────

interface DirectionPickerPopoverProps {
  open: boolean;
  onClose: () => void;
  anchor: HTMLElement | null | undefined;
  columnType?: string;
  onSelect: (direction: "asc" | "desc") => void;
}

function DirectionPickerPopover({
  open,
  onClose,
  anchor,
  columnType = "text",
  onSelect,
}: DirectionPickerPopoverProps) {
  if (!open) return null;
  return (
    <Dropdown
      open
      onClose={onClose}
      anchor={anchor}
      content={
        <ul className="py-1" role="menu">
          {(["asc", "desc"] as const).map((dir) => (
            <li key={dir}>
              <button
                type="button"
                role="menuitem"
                onClick={() => onSelect(dir)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
              >
                {getSortLabel(columnType, dir)}
              </button>
            </li>
          ))}
        </ul>
      }
      width={140}
      maxHeight={200}
    />
  );
}

// ─── FieldPickerPopover ──────────────────────────────────────────────────────

interface FieldPickerPopoverProps {
  open: boolean;
  onClose: () => void;
  anchor: HTMLElement | null | undefined;
  columns: Column[];
  onSelect: (col: Column) => void;
}

function FieldPickerPopover({
  open,
  onClose,
  anchor,
  columns,
  onSelect,
}: FieldPickerPopoverProps) {
  const [search, setSearch] = useState("");
  const filtered = search
    ? columns.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      )
    : columns;

  if (!open) return null;
  return (
    <Dropdown
      open
      onClose={onClose}
      anchor={anchor}
      content={
        <div className="flex w-60 flex-col py-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <SearchIcon />
            <input
              type="text"
              placeholder="Find a field"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border-none bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: 48 * 6 }}>
            <ColumnList columns={filtered} onSelect={onSelect} />
          </div>
        </div>
      }
      width={240}
      maxHeight={280}
    />
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────

interface FooterProps {
  children: React.ReactNode;
}

function Footer({ children }: FooterProps) {
  return (
    <div className="border-t border-gray-200 px-3 py-2">
      <div className="flex gap-2 text-xs font-medium">{children}</div>
    </div>
  );
}

// ─── FooterAction ────────────────────────────────────────────────────────────

interface FooterActionProps {
  onClick: () => void;
  children: React.ReactNode;
}

function FooterAction({ onClick, children }: FooterActionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-1 rounded py-1.5 text-center text-gray-600 hover:bg-gray-100 hover:text-gray-800"
    >
      {children}
    </button>
  );
}

// ─── Empty ───────────────────────────────────────────────────────────────────

interface EmptyProps {
  children?: React.ReactNode;
}

function Empty({ children = "No items" }: EmptyProps) {
  return (
    <p className="px-3 py-4 text-center text-xs text-gray-500">{children}</p>
  );
}

// ─── Export compound component ───────────────────────────────────────────────

export const ToolbarDropdown = Object.assign(Root, {
  Header,
  HeaderAction,
  Divider,
  SearchHeader,
  List,
  Row,
  FieldSelect,
  DirectionSelect,
  RemoveButton,
  AddButton,
  ToggleRow,
  ColumnList,
  DirectionPickerPopover,
  FieldPickerPopover,
  Footer,
  FooterAction,
  Empty,
});
