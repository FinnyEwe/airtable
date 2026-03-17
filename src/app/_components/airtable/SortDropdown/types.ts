import type { SortDirection } from "../utils/columnUtils";

export interface SortLevel {
  columnId: string;
  direction: SortDirection;
}
