import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { UniqueIdentifier } from "@dnd-kit/core";
import { Ranker, RankerProps } from "@src/module/ranker";

function RankerSortableWrapper({
  id,
  isCreator,
  index,
  showDeleteButton = true,
  onDelete,
  onRankChange,
  onValueChange,
  value,
  dropDownOptions,
  style = {},
  theme = {},
}: RankerProps<any> & { id: UniqueIdentifier; showDeleteButton?: boolean }) {
  const sortable = useSortable({ id: id });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    active,
    isDragging,
  } = sortable;

  const styles = transform && {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    transition,
    zIndex: active?.id === id && 10,
  };
  return (
    <Ranker
      ref={setNodeRef}
      index={index}
      isCreator={isCreator}
      showDeleteButton={showDeleteButton}
      onDelete={onDelete}
      onRankChange={onRankChange}
      onValueChange={onValueChange}
      value={value}
      dropDownOptions={dropDownOptions}
      style={{ ...style, ...styles }}
      isHandleActive={true}
      attributes={attributes}
      listeners={listeners}
      handleProps={{ ref: setActivatorNodeRef }}
      isDragging={isDragging}
      theme={theme}
    />
  );
}

export default RankerSortableWrapper;
