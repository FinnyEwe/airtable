"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  useFloating,
  useClick,
  useDismiss,
  useInteractions,
  flip,
  shift,
  offset,
  autoUpdate,
  type Placement,
} from "@floating-ui/react";
import {
  MenuItem,
  MenuSectionHeading,
  MenuDivider,
  type MenuItemProps,
} from "./MenuItem";

export interface MenuSection {
  heading?: string;
  items: MenuItemProps[];
}

export interface DropdownProps {
  open: boolean;
  onClose: () => void;
  sections: MenuSection[];
  /**
   * The trigger element. Pass the same ref you put on your trigger button.
   */
  anchor?: HTMLElement | null;
  width?: number;
  maxHeight?: number;
  /**
   * Floating UI placement. e.g. "bottom-start" | "bottom-end" | "top-start" etc.
   * Defaults to "bottom-start".
   */
  placement?: Placement;
}

export function Dropdown({
  open,
  onClose,
  sections,
  anchor,
  width = 280,
  maxHeight = 400,
  placement = "bottom-start",
}: DropdownProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: (v) => { if (!v) onClose(); },
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(4),
      flip({ padding: 8 }),
      shift({ padding: 8 }),
    ],
  });

  // Sync external anchor element into floating-ui's reference
  useEffect(() => {
    refs.setReference(anchor ?? null);
  }, [anchor, refs]);

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([click, dismiss]);

  if (!mounted || !open) return null;

  const panel = (
    <div
      ref={refs.setFloating}
      style={{ ...floatingStyles, width, maxHeight, zIndex: 50 }}
      {...getFloatingProps()}
      role="dialog"
      tabIndex={-1}
      className="overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg outline-none"
    >
      <ul role="menu" tabIndex={-1} className="p-1">
        {sections.map((section, sectionIdx) => (
          <React.Fragment key={sectionIdx}>
            {section.heading && (
              <MenuSectionHeading>{section.heading}</MenuSectionHeading>
            )}
            {section.items.map((item, itemIdx) => (
              <MenuItem
                key={itemIdx}
                {...item}
                onClick={() => {
                  item.onClick?.();
                  onClose();
                }}
              />
            ))}
            {sectionIdx < sections.length - 1 &&
              !sections[sectionIdx]!.items.at(-1)?.dividerBelow && (
                <MenuDivider />
              )}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );

  return createPortal(panel, document.body);
}
