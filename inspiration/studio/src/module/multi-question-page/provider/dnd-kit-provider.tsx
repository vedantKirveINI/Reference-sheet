import React, { useId } from "react";
import {
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

interface DndKitProviderProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
  shouldRestrictToVerticalAxis?: boolean;
}

const DndKitProvider = ({
  children,
  onDragEnd,
  shouldRestrictToVerticalAxis = false,
}: DndKitProviderProps) => {
  const id = useId();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      id={id}
      modifiers={shouldRestrictToVerticalAxis ? [restrictToVerticalAxis] : []}
    >
      {children}
    </DndContext>
  );
};

export default DndKitProvider;
