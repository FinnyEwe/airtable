export type GridRow = Record<string, string | null> & { id: string };

export type GroupLevel = {
  columnId: string;
  direction: string;
  order: number;
};

export type DisplayItem =
  | {
      type: "groupHeader";
      key: string;
      value: string;
      count: number;
      columnId: string;
      depth: number;
    }
  | { type: "row"; row: GridRow };

export function buildDisplayItems(
  rows: GridRow[],
  groups: GroupLevel[],
  collapsedKeys: Set<string>,
  depth = 0,
  parentKey = "",
): DisplayItem[] {
  if (groups.length === 0 || depth >= groups.length) {
    return rows.map((row) => ({ type: "row", row }));
  }
  const col = groups[depth];
  if (!col) return rows.map((row) => ({ type: "row", row }));

  const partitions = new Map<string, GridRow[]>();
  for (const row of rows) {
    const val = row[col.columnId] ?? "";
    const key = val || "(empty)";
    let bucket = partitions.get(key);
    if (!bucket) {
      bucket = [];
      partitions.set(key, bucket);
    }
    bucket.push(row);
  }

  const keys = [...partitions.keys()].sort((a, b) => a.localeCompare(b));
  if (col.direction === "desc") keys.reverse();

  const result: DisplayItem[] = [];
  for (const key of keys) {
    const fullKey = parentKey ? `${parentKey}::${key}` : key;
    const subRows = partitions.get(key)!;
    result.push({
      type: "groupHeader",
      key: fullKey,
      value: key,
      count: subRows.length,
      columnId: col.columnId,
      depth,
    });
    if (!collapsedKeys.has(fullKey)) {
      result.push(
        ...buildDisplayItems(subRows, groups, collapsedKeys, depth + 1, fullKey),
      );
    }
  }
  return result;
}
