"use client";

import React from "react";

export interface MenuItemProps {
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
  dividerBelow?: boolean;
  onClick?: () => void;
  "aria-label"?: string;
}

export function MenuItem({
  label,
  icon,
  badge,
  disabled = false,
  dividerBelow = false,
  onClick,
  "aria-label": ariaLabel,
}: MenuItemProps) {
  return (
    <>
      <li role="menuitem">
        <button
          onClick={disabled ? undefined : onClick}
          aria-label={ariaLabel}
          aria-disabled={disabled}
          disabled={disabled}
          className={[
            "flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm transition-colors",
            disabled
              ? "cursor-not-allowed text-gray-400"
              : "text-gray-700 hover:bg-gray-100",
          ].join(" ")}
        >
          {icon && (
            <span className="flex flex-none items-center text-gray-500">
              {icon}
            </span>
          )}
          <span className="flex-auto truncate">{label}</span>
          {badge && <span className="flex-none">{badge}</span>}
        </button>
      </li>
      {dividerBelow && (
        <li role="presentation" className="my-1 h-px bg-gray-200 mx-1" />
      )}
    </>
  );
}

export interface MenuSectionHeadingProps {
  children: React.ReactNode;
}

export function MenuSectionHeading({ children }: MenuSectionHeadingProps) {
  return (
    <li
      role="presentation"
      className="mx-2 mb-0.5 mt-2 truncate text-xs leading-4 text-gray-400 first:mt-1"
    >
      {children}
    </li>
  );
}

export interface MenuDividerProps {
  className?: string;
}

export function MenuDivider({ className = "" }: MenuDividerProps) {
  return (
    <li role="presentation" className={`my-1 h-px bg-gray-200 mx-1 ${className}`} />
  );
}

export interface MenuBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "beta";
}

export function MenuBadge({ children, variant = "default" }: MenuBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium",
        variant === "beta"
          ? "bg-blue-100 text-blue-700"
          : "bg-gray-100 text-gray-600",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
