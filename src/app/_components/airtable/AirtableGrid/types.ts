export interface DataColumn {
  id: string;
  name: string;
  type: string;
  order: number;
  config: unknown;
}

export interface CellPosition {
  rowId: string;
  columnId: string;
}

export interface ContextMenuState {
  anchor: HTMLElement;
  columnId: string;
  columnType: string;
  isFirstColumn: boolean;
}

export interface RowContextMenuState {
  anchor: HTMLElement;
  rowId: string;
}
