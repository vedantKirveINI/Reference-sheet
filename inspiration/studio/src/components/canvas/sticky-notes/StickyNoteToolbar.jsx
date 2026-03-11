import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Palette,
  Type,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ChevronDown,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const BACKGROUND_COLORS = [
  { name: "Yellow", value: "#FEF3C7", border: "#FCD34D" },
  { name: "Green", value: "#D1FAE5", border: "#6EE7B7" },
  { name: "Blue", value: "#DBEAFE", border: "#93C5FD" },
  { name: "Pink", value: "#FCE7F3", border: "#F9A8D4" },
  { name: "Purple", value: "#EDE9FE", border: "#C4B5FD" },
  { name: "White", value: "#FFFFFF", border: "#E5E7EB" },
];

const TEXT_COLORS = [
  { name: "Black", value: "#1F2937" },
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#DC2626" },
  { name: "Blue", value: "#2563EB" },
  { name: "Green", value: "#059669" },
  { name: "Purple", value: "#7C3AED" },
];

const FONT_SIZES = [
  { name: "Small", value: "12px" },
  { name: "Medium", value: "16px" },
  { name: "Large", value: "20px" },
  { name: "XL", value: "28px" },
];

const ToolbarButton = React.forwardRef(({ children, className, active, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex items-center justify-center w-8 h-8 rounded-md transition-all duration-150",
      "hover:bg-gray-100 active:scale-95",
      active && "bg-gray-100 ring-1 ring-gray-300",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
ToolbarButton.displayName = "ToolbarButton";

const ColorSwatch = ({ color, selected, onClick, showBorder = false }) => (
  <button
    onClick={onClick}
    className={cn(
      "w-6 h-6 rounded-full transition-all duration-150 hover:scale-110",
      selected && "ring-2 ring-offset-2 ring-blue-500"
    )}
    style={{
      backgroundColor: color.value,
      border: showBorder ? `2px solid ${color.border || color.value}` : "none",
    }}
    title={color.name}
  />
);

const Divider = () => <div className="w-px h-5 bg-gray-200 mx-1" />;

export function StickyNoteToolbar({
  nodeData,
  onUpdate,
  position,
  visible,
  onClose,
}) {
  const [openPopover, setOpenPopover] = useState(null);

  const handleUpdate = useCallback(
    (key, value) => {
      onUpdate({ [key]: value });
    },
    [onUpdate]
  );

  const toggleStyle = useCallback(
    (key) => {
      handleUpdate(key, !nodeData[key]);
    },
    [nodeData, handleUpdate]
  );

  const currentFontSize = FONT_SIZES.find(
    (s) => s.value === nodeData.fontSize
  ) || FONT_SIZES[1];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="absolute z-50 pointer-events-auto"
          style={{
            left: position.x,
            top: position.y,
            transform: "translate(-50%, -100%)",
          }}
          onMouseLeave={() => {
            if (!openPopover) {
              onClose?.();
            }
          }}
        >
          <div
            className={cn(
              "flex items-center gap-0.5 px-2 py-1.5 rounded-lg",
              "bg-white border border-gray-200",
              "shadow-lg shadow-gray-200/50"
            )}
          >
            <Popover
              open={openPopover === "bg"}
              onOpenChange={(open) => setOpenPopover(open ? "bg" : null)}
            >
              <PopoverTrigger asChild>
                <ToolbarButton title="Background color">
                  <div className="relative">
                    <Palette className="w-4 h-4 text-gray-600" />
                    <div
                      className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-full"
                      style={{ backgroundColor: nodeData.backgroundColor || BACKGROUND_COLORS[0].value }}
                    />
                  </div>
                </ToolbarButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start" sideOffset={8}>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">Background</p>
                  <div className="flex gap-2">
                    {BACKGROUND_COLORS.map((color) => (
                      <ColorSwatch
                        key={color.value}
                        color={color}
                        showBorder
                        selected={nodeData.backgroundColor === color.value}
                        onClick={() => {
                          handleUpdate("backgroundColor", color.value);
                          setOpenPopover(null);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover
              open={openPopover === "text"}
              onOpenChange={(open) => setOpenPopover(open ? "text" : null)}
            >
              <PopoverTrigger asChild>
                <ToolbarButton title="Text color">
                  <div className="relative">
                    <Type className="w-4 h-4 text-gray-600" />
                    <div
                      className="absolute -bottom-0.5 left-0 right-0 h-1 rounded-full"
                      style={{ backgroundColor: nodeData.fontColor || TEXT_COLORS[0].value }}
                    />
                  </div>
                </ToolbarButton>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start" sideOffset={8}>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-gray-500">Text Color</p>
                  <div className="flex gap-2">
                    {TEXT_COLORS.map((color) => (
                      <ColorSwatch
                        key={color.value}
                        color={color}
                        selected={nodeData.fontColor === color.value}
                        onClick={() => {
                          handleUpdate("fontColor", color.value);
                          setOpenPopover(null);
                        }}
                      />
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Divider />

            <Toggle
              size="sm"
              pressed={nodeData.isBold}
              onPressedChange={() => toggleStyle("isBold")}
              className="w-8 h-8 p-0"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </Toggle>

            <Toggle
              size="sm"
              pressed={nodeData.isItalic}
              onPressedChange={() => toggleStyle("isItalic")}
              className="w-8 h-8 p-0"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </Toggle>

            <Toggle
              size="sm"
              pressed={nodeData.isUnderline}
              onPressedChange={() => toggleStyle("isUnderline")}
              className="w-8 h-8 p-0"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </Toggle>

            <Divider />

            <div className="flex items-center">
              <ToolbarButton
                active={nodeData.textAlign === "left"}
                onClick={() => handleUpdate("textAlign", "left")}
                title="Align left"
              >
                <AlignLeft className="w-4 h-4 text-gray-600" />
              </ToolbarButton>
              <ToolbarButton
                active={nodeData.textAlign === "center"}
                onClick={() => handleUpdate("textAlign", "center")}
                title="Align center"
              >
                <AlignCenter className="w-4 h-4 text-gray-600" />
              </ToolbarButton>
              <ToolbarButton
                active={nodeData.textAlign === "right"}
                onClick={() => handleUpdate("textAlign", "right")}
                title="Align right"
              >
                <AlignRight className="w-4 h-4 text-gray-600" />
              </ToolbarButton>
            </div>

            <Divider />

            <Popover
              open={openPopover === "size"}
              onOpenChange={(open) => setOpenPopover(open ? "size" : null)}
            >
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "flex items-center gap-1 px-2 h-8 rounded-md",
                    "text-sm text-gray-600 hover:bg-gray-100",
                    "transition-colors duration-150"
                  )}
                  title="Font size"
                >
                  <span>{currentFontSize.name}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-1" align="end" sideOffset={8}>
                <div className="flex flex-col">
                  {FONT_SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => {
                        handleUpdate("fontSize", size.value);
                        setOpenPopover(null);
                      }}
                      className={cn(
                        "px-3 py-1.5 text-sm text-left rounded-md",
                        "hover:bg-gray-100 transition-colors",
                        nodeData.fontSize === size.value && "bg-gray-100 font-medium"
                      )}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const STICKY_NOTE_DEFAULTS = {
  backgroundColor: BACKGROUND_COLORS[0].value,
  fontColor: TEXT_COLORS[0].value,
  fontSize: FONT_SIZES[1].value,
  textAlign: "left",
  isBold: false,
  isItalic: false,
  isUnderline: false,
};

export { BACKGROUND_COLORS, TEXT_COLORS, FONT_SIZES };
