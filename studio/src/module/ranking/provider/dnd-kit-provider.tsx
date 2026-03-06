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

interface DndKitProviderProps {
  children: React.ReactNode;
  onDragEnd: (event: DragEndEvent) => void;
}

const DndKitProvider = ({ children, onDragEnd }: DndKitProviderProps) => {
  const id = useId();
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      id={id}
    >
      {children}
    </DndContext>
  );
};

export default DndKitProvider;
