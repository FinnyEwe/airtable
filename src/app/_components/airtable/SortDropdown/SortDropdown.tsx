"use client";

import { useSortDropdown } from "./useSortDropdown";
import { ToolbarDropdown } from "../ToolbarDropdown";

interface SortDropdownProps {
  tableId: string | undefined;
  viewId?: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

export function SortDropdown({
  tableId,
  viewId,
  anchorRef,
  isOpen,
  onClose,
}: SortDropdownProps) {
  const sortDropdown = useSortDropdown({ tableId: tableId ?? "", viewId, isOpen });
  const {
    searchQuery,
    setSearchQuery,
    sortLevels,
    fieldPickerRowIndex,
    setFieldPickerRowIndex,
    directionDropdownIndex,
    setDirectionDropdownIndex,
    fieldButtonRefs,
    directionButtonRefs,
    addSortButtonRef,
    filteredColumns,
    availableForPicker,
    getColumnById,
    handleSelectColumn,
    handleAddSort,
    handleRemoveSort,
    handleDirectionSelect,
  } = sortDropdown;

  if (!tableId) return null;

  const showLevelsView =
    sortLevels.length > 0 || fieldPickerRowIndex !== null;

  if (!showLevelsView) {
    return (
      <ToolbarDropdown
        open={isOpen}
        onClose={onClose}
        anchor={anchorRef.current}
        width={360}
        placement="bottom-end"
      >
        <ToolbarDropdown.Header title="Sort by" />
        <ToolbarDropdown.Divider />
        <ToolbarDropdown.SearchHeader
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <ToolbarDropdown.List minHeight={100}>
          <ToolbarDropdown.ColumnList
            columns={filteredColumns}
            onSelect={handleSelectColumn}
          />
        </ToolbarDropdown.List>
      </ToolbarDropdown>
    );
  }

  return (
    <ToolbarDropdown
      open={isOpen}
      onClose={onClose}
      anchor={anchorRef.current}
      width={460}
      placement="bottom-end"
    >
      <ToolbarDropdown.Header title="Sort by" />
      <ToolbarDropdown.Divider />

      <ToolbarDropdown.List>
        <ul className="flex flex-col gap-1 pt-1">
          {sortLevels.map((level, index) => {
            const col = getColumnById(level.columnId);
            const isPickerOpen = fieldPickerRowIndex === index;

            return (
              <ToolbarDropdown.Row key={index}>
                <ToolbarDropdown.FieldSelect
                  column={col}
                  onClick={() => {
                    setDirectionDropdownIndex(null);
                    setFieldPickerRowIndex(isPickerOpen ? null : index);
                  }}
                  buttonRef={(el) => {
                    fieldButtonRefs.current[index] = el;
                  }}
                />
                <ToolbarDropdown.DirectionSelect
                  columnType={col?.type}
                  direction={level.direction}
                  onClick={() => {
                    setFieldPickerRowIndex(null);
                    setDirectionDropdownIndex(
                      directionDropdownIndex === index ? null : index
                    );
                  }}
                  buttonRef={(el) => {
                    directionButtonRefs.current[index] = el;
                  }}
                />
                <ToolbarDropdown.RemoveButton
                  onClick={() => handleRemoveSort(index)}
                  label="Remove sort"
                />
              </ToolbarDropdown.Row>
            );
          })}
        </ul>

        <ToolbarDropdown.AddButton
          onClick={handleAddSort}
          buttonRef={addSortButtonRef}
        >
          Add another sort
        </ToolbarDropdown.AddButton>
      </ToolbarDropdown.List>

      <ToolbarDropdown.DirectionPickerPopover
        open={directionDropdownIndex !== null}
        onClose={() => setDirectionDropdownIndex(null)}
        anchor={
          directionDropdownIndex !== null
            ? directionButtonRefs.current[directionDropdownIndex]
            : undefined
        }
        columnType={
          directionDropdownIndex !== null
            ? getColumnById(
                sortLevels[directionDropdownIndex]?.columnId ?? ""
              )?.type
            : undefined
        }
        onSelect={(dir) => {
          if (directionDropdownIndex !== null)
            handleDirectionSelect(directionDropdownIndex, dir);
        }}
      />

      <ToolbarDropdown.FieldPickerPopover
        open={fieldPickerRowIndex !== null}
        onClose={() => setFieldPickerRowIndex(null)}
        anchor={
          fieldPickerRowIndex !== null
            ? fieldPickerRowIndex < sortLevels.length
              ? fieldButtonRefs.current[fieldPickerRowIndex]
              : addSortButtonRef.current
            : undefined
        }
        columns={availableForPicker}
        onSelect={handleSelectColumn}
      />
    </ToolbarDropdown>
  );
}
