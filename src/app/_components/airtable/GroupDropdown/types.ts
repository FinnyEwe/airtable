import type { SortDirection } from "../utils/columnUtils";

export interface GroupLevel {
  columnId: string;
  sortDirection: SortDirection;
}

export interface GroupDropdownProps {
  tableId: string;
  viewId?: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
}
