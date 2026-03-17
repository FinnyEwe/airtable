"use client";

import React from "react";
import { Dropdown } from "~/app/_components/ui/Dropdown";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  CopyIcon,
  PaintBucketIcon,
  ArrowsOutIcon,
  ChatIcon,
  LinkIcon,
  EnvelopeIcon,
  TrashIcon,
} from "../icons";

const noop = () => { return; };

interface RowContextMenuProps {
  open: boolean;
  onClose: () => void;
  anchor: HTMLElement | null;
  rowId: string;
  onDeleteRow: (rowId: string) => void;
}

export function RowContextMenu({
  open,
  onClose,
  anchor,
  rowId,
  onDeleteRow,
}: RowContextMenuProps) {
  const sections = [
    {
      items: [
        { label: "Insert record above", icon: <ArrowUpIcon />, onClick: noop },
        { label: "Insert record below", icon: <ArrowDownIcon />, onClick: noop },
      ],
    },
    {
      items: [
        { label: "Duplicate record", icon: <CopyIcon />, onClick: noop },
        { label: "Apply template", icon: <PaintBucketIcon />, onClick: noop },
        { label: "Expand record", icon: <ArrowsOutIcon />, onClick: noop },
      ],
    },
    {
      items: [
        { label: "Add comment", icon: <ChatIcon />, onClick: noop },
        { label: "Copy cell URL", icon: <LinkIcon />, onClick: noop },
        { label: "Send record", icon: <EnvelopeIcon />, onClick: noop },
      ],
    },
    {
      items: [
        {
          label: "Delete record",
          icon: <TrashIcon />,
          destructive: true,
          onClick: () => onDeleteRow(rowId),
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
