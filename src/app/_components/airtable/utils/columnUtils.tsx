import {
  NumberIcon,
  TextFieldIcon,
  SelectIcon,
  CalendarIcon,
} from "../icons";

export function columnTypeIcon(type: string) {
  switch (type) {
    case "number":
      return <NumberIcon />;
    case "select":
      return <SelectIcon />;
    case "date":
      return <CalendarIcon />;
    default:
      return <TextFieldIcon />;
  }
}

export type SortDirection = "asc" | "desc";

export function getSortLabel(colType: string, direction: SortDirection) {
  if (colType === "number") {
    return direction === "asc" ? "1 → 9" : "9 → 1";
  }
  return direction === "asc" ? "A → Z" : "Z → A";
}
