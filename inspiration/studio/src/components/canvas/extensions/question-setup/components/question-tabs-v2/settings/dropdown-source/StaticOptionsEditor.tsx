import { useCallback, useState, useId, useRef, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, List } from "lucide-react";
import {
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";
import HelperText from "../../components/HelperText";

interface StaticOptionsEditorProps {
  options: string[];
  onChange: (options: string[]) => void;
}

interface SortableOptionRowProps {
  id: string;
  index: number;
  option: string;
  onUpdate: (index: number, value: string) => void;
  onRemove: (index: number) => void;
}

const SortableOptionRow = ({
  id,
  index,
  option,
  onUpdate,
  onRemove,
}: SortableOptionRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 group bg-white"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </div>
      <Input
        value={option}
        onChange={(e) => onUpdate(index, e.target.value)}
        className="flex-1"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

function generateStableId(baseId: string, index: number) {
  return `${baseId}-opt-${index}`;
}

const StaticOptionsEditor = ({ options, onChange }: StaticOptionsEditorProps) => {
  const [newOption, setNewOption] = useState("");
  const baseId = useId();
  const idCounterRef = useRef(0);

  const [stableIds, setStableIds] = useState<string[]>(() => {
    const ids = options.map((_, i) => generateStableId(baseId, i));
    idCounterRef.current = options.length;
    return ids;
  });

  useEffect(() => {
    if (options.length > stableIds.length) {
      setStableIds((prev) => {
        const next = [
          ...prev,
          ...Array.from({ length: options.length - prev.length }, () =>
            generateStableId(baseId, idCounterRef.current++)
          ),
        ];
        idCounterRef.current = next.length;
        return next;
      });
    } else if (options.length < stableIds.length) {
      setStableIds((prev) => prev.slice(0, options.length));
    }
  }, [options.length, baseId]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = stableIds.indexOf(active.id as string);
        const newIndex = stableIds.indexOf(over.id as string);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOptions = arrayMove(options, oldIndex, newIndex);
          const newIds = arrayMove(stableIds, oldIndex, newIndex);
          setStableIds(newIds);
          onChange(newOptions);
        }
      }
    },
    [options, stableIds, onChange]
  );

  const handleAddOption = useCallback(() => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      const newId = generateStableId(baseId, idCounterRef.current++);
      setStableIds((prev) => [...prev, newId]);
      onChange([...options, newOption.trim()]);
      setNewOption("");
    }
  }, [newOption, options, onChange, baseId]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddOption();
      }
    },
    [handleAddOption]
  );

  const handleRemoveOption = useCallback(
    (index: number) => {
      setStableIds((prev) => prev.filter((_, i) => i !== index));
      const newOptions = options.filter((_, i) => i !== index);
      onChange(newOptions);
    },
    [options, onChange]
  );

  const handleUpdateOption = useCallback(
    (index: number, value: string) => {
      const newOptions = [...options];
      newOptions[index] = value;
      onChange(newOptions);
    },
    [options, onChange]
  );

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium flex items-center gap-2">
          <List className="w-4 h-4 text-indigo-500" />
          Dropdown Options
        </Label>
        <HelperText>
          Add the options that users will be able to select from. Drag to reorder.
        </HelperText>
      </div>

      {options.length > 0 && (
        <DndContext
          id={baseId}
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext items={stableIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {options.map((option, index) => (
                <SortableOptionRow
                  key={stableIds[index]}
                  id={stableIds[index]}
                  index={index}
                  option={option}
                  onUpdate={handleUpdateOption}
                  onRemove={handleRemoveOption}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={newOption}
          onChange={(e) => setNewOption(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a new option and press Enter..."
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddOption}
          disabled={!newOption.trim()}
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {options.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-sm text-gray-500">
            No options yet. Add your first option above.
          </p>
        </div>
      )}
    </div>
  );
};

export default StaticOptionsEditor;
