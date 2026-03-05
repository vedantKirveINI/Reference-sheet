import React from "react";
import {
  WrappedEditor,
  WrappedEditorProps,
} from "@src/module/wrappededitor";
import { useSortable } from "@dnd-kit/sortable";

interface WrappedEditorSortableWrapperProps extends WrappedEditorProps {
  isDraggable?: boolean;
  placeholder?: string;
}

const WrappedEditorSortableWrapper = ({
  id,
  isDraggable = true,
  style,
  customStyle,
  ...props
}: WrappedEditorSortableWrapperProps) => {
  const sortable = useSortable({ id: id });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    setActivatorNodeRef,
    active,
  } = sortable;

  const sortableStyles = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
        zIndex: active?.id === id ? 10 : undefined,
      }
    : {};
  return (
    <WrappedEditor
      {...props}
      ref={isDraggable ? setNodeRef : undefined}
      customStyle={{
        ...customStyle,
        container: {
          ...customStyle?.container,
          ...style,
          ...sortableStyles,
        } as React.CSSProperties,
      }}
      {...(!isDraggable ? listeners : undefined)}
      {...attributes}
      aria-disabled={!isDraggable}
      tabIndex={0}
      rightIconProps={
        isDraggable
          ? {
              ...listeners,
              ref: setActivatorNodeRef,
            }
          : {}
      }
    />
  );
};

export default WrappedEditorSortableWrapper;
