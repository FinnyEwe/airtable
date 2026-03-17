"use client";

import { useGroupDropdown } from "./useGroupDropdown";
import { ToolbarDropdown } from "../ToolbarDropdown";

interface GroupDropdownProps {
  tableId: string;
  viewId?: string;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

export function GroupDropdown({
  tableId,
  viewId,
  anchorRef,
  isOpen,
  onClose,
}: GroupDropdownProps) {
  const {
    searchQuery,
    setSearchQuery,
    groupLevels,
    fieldPickerRowIndex,
    setFieldPickerRowIndex,
    sortDropdownIndex,
    setSortDropdownIndex,
    fieldButtonRefs,
    sortButtonRefs,
    addSubgroupButtonRef,
    filteredColumns,
    availableForPicker,
    getColumnById,
    handleSelectField,
    handleAddSubgroup,
    handleRemoveLevel,
    handleRemoveAllGroups,
    handleSortDirectionSelect,
  } = useGroupDropdown({ tableId, viewId, isOpen });

  const hasLevels = groupLevels.length > 0;
  const showLevelsView = hasLevels || fieldPickerRowIndex !== null;

  if (!showLevelsView) {
    return (
      <ToolbarDropdown
        open={isOpen}
        onClose={onClose}
        anchor={anchorRef.current}
        width={264}
      >
        <ToolbarDropdown.Header title="Group by" />
        <ToolbarDropdown.Divider />
        <ToolbarDropdown.SearchHeader
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <ToolbarDropdown.List minHeight={100}>
          <ToolbarDropdown.ColumnList
            columns={filteredColumns}
            onSelect={handleSelectField}
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
      width={420}
    >
      <ToolbarDropdown.Header title="Group by">
        <ToolbarDropdown.HeaderAction>
          Collapse all
        </ToolbarDropdown.HeaderAction>
        <ToolbarDropdown.HeaderAction>
          Expand all
        </ToolbarDropdown.HeaderAction>
        <ToolbarDropdown.HeaderAction
          variant="danger"
          onClick={handleRemoveAllGroups}
        >
          Remove grouping
        </ToolbarDropdown.HeaderAction>
      </ToolbarDropdown.Header>

      <ToolbarDropdown.Divider />

      <ToolbarDropdown.List>
        <ul className="flex flex-col gap-1 pt-1">
          {groupLevels.map((level, index) => {
            const col = getColumnById(level.columnId);
            const isPickerOpen = fieldPickerRowIndex === index;

            return (
              <ToolbarDropdown.Row key={index}>
                <ToolbarDropdown.FieldSelect
                  column={col}
                  onClick={() => {
                    setSortDropdownIndex(null);
                    setFieldPickerRowIndex(isPickerOpen ? null : index);
                  }}
                  buttonRef={(el) => {
                    fieldButtonRefs.current[index] = el;
                  }}
                />
                <ToolbarDropdown.DirectionSelect
                  columnType={col?.type}
                  direction={level.sortDirection}
                  onClick={() => {
                    setFieldPickerRowIndex(null);
                    setSortDropdownIndex(
                      sortDropdownIndex === index ? null : index
                    );
                  }}
                  buttonRef={(el) => {
                    sortButtonRefs.current[index] = el;
                  }}
                />
                <div className="w-7 shrink-0" />
                <ToolbarDropdown.RemoveButton
                  icon="trash"
                  label="Remove group"
                  onClick={() => handleRemoveLevel(index)}
                />
              </ToolbarDropdown.Row>
            );
          })}
        </ul>

        <ToolbarDropdown.AddButton
          onClick={handleAddSubgroup}
          buttonRef={addSubgroupButtonRef}
        >
          Add subgroup
        </ToolbarDropdown.AddButton>
      </ToolbarDropdown.List>

      <ToolbarDropdown.DirectionPickerPopover
        open={sortDropdownIndex !== null}
        onClose={() => setSortDropdownIndex(null)}
        anchor={
          sortDropdownIndex !== null
            ? sortButtonRefs.current[sortDropdownIndex]
            : undefined
        }
        columnType={
          sortDropdownIndex !== null
            ? getColumnById(groupLevels[sortDropdownIndex]?.columnId ?? "")
                ?.type
            : undefined
        }
        onSelect={(dir) => {
          if (sortDropdownIndex !== null)
            handleSortDirectionSelect(sortDropdownIndex, dir);
        }}
      />

      <ToolbarDropdown.FieldPickerPopover
        open={fieldPickerRowIndex !== null}
        onClose={() => setFieldPickerRowIndex(null)}
        anchor={
          fieldPickerRowIndex !== null
            ? fieldPickerRowIndex < groupLevels.length
              ? fieldButtonRefs.current[fieldPickerRowIndex]
              : addSubgroupButtonRef.current
            : undefined
        }
        columns={availableForPicker}
        onSelect={handleSelectField}
      />
    </ToolbarDropdown>
  );
}
