"use client";

import React from "react";
import { Dropdown } from "~/app/_components/ui/Dropdown";
import { getSortLabel } from "../utils/columnUtils";
import {
  PencilIcon,
  DuplicateIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowLineLeftIcon,
  LinkIcon,
  InfoIcon,
  LockIcon,
  SortAscIcon,
  SortDescIcon,
  FilterIcon,
  GroupIcon,
  DependenciesIcon,
  EyeOffIcon,
  TrashIcon,
} from "../icons";

const noop = () => { return; };

interface ColumnContextMenuProps {
  open: boolean;
  onClose: () => void;
  anchor: HTMLElement | null;
  columnId: string;
  columnType: string;
  isFirstColumn: boolean;
  onDeleteColumn: (columnId: string) => void;
}

export function ColumnContextMenu({
  open,
  onClose,
  anchor,
  columnId,
  columnType,
  isFirstColumn,
  onDeleteColumn,
}: ColumnContextMenuProps) {
  const sortAscLabel = getSortLabel(columnType, "asc");
  const sortDescLabel = getSortLabel(columnType, "desc");

  const sections = [
    {
      items: [{ label: "Edit field", icon: <PencilIcon />, onClick: noop }],
    },
    {
      items: [
        { label: "Duplicate field", icon: <DuplicateIcon />, onClick: noop },
        {
          label: "Insert left",
          icon: <ArrowLeftIcon />,
          onClick: noop,
          disabled: isFirstColumn,
        },
        { label: "Insert right", icon: <ArrowRightIcon />, onClick: noop },
        {
          label: "Change primary field",
          icon: <ArrowLineLeftIcon />,
          onClick: noop,
        },
      ],
    },
    {
      items: [
        { label: "Copy field URL", icon: <LinkIcon />, onClick: noop },
        { label: "Edit field description", icon: <InfoIcon />, onClick: noop },
        { label: "Edit field permissions", icon: <LockIcon />, onClick: noop },
      ],
    },
    {
      items: [
        { label: `Sort ${sortAscLabel}`, icon: <SortAscIcon />, onClick: noop },
        { label: `Sort ${sortDescLabel}`, icon: <SortDescIcon />, onClick: noop },
      ],
    },
    {
      items: [
        { label: "Filter by this field", icon: <FilterIcon />, onClick: noop },
        { label: "Group by this field", icon: <GroupIcon />, onClick: noop },
        { label: "Show dependencies", icon: <DependenciesIcon />, onClick: noop },
      ],
    },
    {
      items: [
        { label: "Hide field", icon: <EyeOffIcon />, onClick: noop, disabled: true },
        {
          label: "Delete field",
          icon: <TrashIcon />,
          destructive: true,
          onClick: () => onDeleteColumn(columnId),
        },
      ],
    },
  ];

  return (
    <Dropdown
      open={open}
      onClose={onClose}
      anchor={anchor}
      sections={sections}
      width={240}
      noScroll
      placement="bottom-start"
    />
  );
}
