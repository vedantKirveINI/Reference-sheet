import React, { useState, useCallback, useMemo } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuLabel,
} from "@/components/ui/context-menu";
import { Input } from "@/components/ui/input";
import {
  Edit3,
  Trash2,
  Copy,
  Play,
  Unlink,
  Plus,
  AlignJustify,
  StickyNote,
  FileText,
  Search,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const MenuItemIcon = ({ icon: Icon, className, danger }) => (
  <Icon
    className={cn(
      "w-4 h-4 mr-2",
      danger ? "text-red-500" : "text-gray-500",
      className
    )}
  />
);

function CanvasContextMenuItem({
  icon,
  label,
  shortcut,
  onClick,
  danger,
  disabled,
}) {
  return (
    <ContextMenuItem
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center cursor-pointer",
        danger && "text-red-600 focus:text-red-600 focus:bg-red-50"
      )}
    >
      {icon && <MenuItemIcon icon={icon} danger={danger} />}
      <span>{label}</span>
      {shortcut && <ContextMenuShortcut>{shortcut}</ContextMenuShortcut>}
    </ContextMenuItem>
  );
}

function SearchableMenuContent({ items, onSelect, placeholder = "Search..." }) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items;
    const query = search.toLowerCase();
    return items.filter(
      (item) =>
        item.label?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query)
    );
  }, [items, search]);

  return (
    <div className="flex flex-col">
      <div className="px-2 pb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={placeholder}
            className="h-8 pl-7 text-sm"
            autoFocus
          />
        </div>
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        {filteredItems.length === 0 ? (
          <div className="px-2 py-3 text-sm text-gray-500 text-center">
            No results found
          </div>
        ) : (
          filteredItems.map((item) => (
            <ContextMenuItem
              key={item.id}
              onClick={() => onSelect(item)}
              className="cursor-pointer"
            >
              {item.icon && <MenuItemIcon icon={item.icon} />}
              <div className="flex flex-col">
                <span>{item.label}</span>
                {item.description && (
                  <span className="text-xs text-gray-500">
                    {item.description}
                  </span>
                )}
              </div>
            </ContextMenuItem>
          ))
        )}
      </div>
    </div>
  );
}

export function NodeContextMenu({
  children,
  node,
  onEdit,
  onDelete,
  onDuplicate,
  onRun,
  onAddLogs,
  hasTestModule,
  triggerType,
  onResetTrigger,
}) {
  const handleDelete = useCallback(() => {
    if (triggerType) {
      onResetTrigger?.(node);
    } else {
      onDelete?.(node);
    }
  }, [node, triggerType, onResetTrigger, onDelete]);

  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-56 shadow-lg border border-gray-200">
        <CanvasContextMenuItem
          icon={Edit3}
          label="Edit Node"
          shortcut="Enter"
          onClick={() => onEdit?.(node)}
        />
        <CanvasContextMenuItem
          icon={FileText}
          label="Add Logs"
          onClick={() => onAddLogs?.(node)}
        />
        {hasTestModule && (
          <CanvasContextMenuItem
            icon={Play}
            label="Run This Node Only"
            shortcut="⌘R"
            onClick={() => onRun?.(node)}
          />
        )}
        <ContextMenuSeparator />
        <CanvasContextMenuItem
          icon={Copy}
          label="Duplicate"
          shortcut="⌘D"
          onClick={() => onDuplicate?.(node)}
        />
        <ContextMenuSeparator />
        <CanvasContextMenuItem
          icon={Trash2}
          label="Delete Node"
          shortcut="⌫"
          danger
          onClick={handleDelete}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function LinkContextMenu({
  children,
  linkData,
  onUnlink,
  onRename,
  onAddNode,
}) {
  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-48 shadow-lg border border-gray-200">
        <CanvasContextMenuItem
          icon={Unlink}
          label="Unlink"
          onClick={() => onUnlink?.(linkData)}
        />
        <CanvasContextMenuItem
          icon={Edit3}
          label="Rename"
          onClick={() => onRename?.(linkData)}
        />
        <ContextMenuSeparator />
        <CanvasContextMenuItem
          icon={Plus}
          label="Add Node"
          onClick={() => onAddNode?.(linkData)}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function BackgroundContextMenu({
  children,
  onAddNode,
  onAutoAlign,
  onAddStickyNote,
  nodeTypes,
}) {
  return (
    <ContextMenu>
      {children}
      <ContextMenuContent className="w-56 shadow-lg border border-gray-200">
        {nodeTypes && nodeTypes.length > 0 ? (
          <ContextMenuSub>
            <ContextMenuSubTrigger className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2 text-gray-500" />
              Add Node
            </ContextMenuSubTrigger>
            <ContextMenuSubContent className="w-64">
              <SearchableMenuContent
                items={nodeTypes}
                onSelect={(item) => onAddNode?.(item)}
                placeholder="Search nodes..."
              />
            </ContextMenuSubContent>
          </ContextMenuSub>
        ) : (
          <CanvasContextMenuItem
            icon={Plus}
            label="Add Node"
            onClick={() => onAddNode?.()}
          />
        )}
        <ContextMenuSeparator />
        <CanvasContextMenuItem
          icon={AlignJustify}
          label="Auto Align"
          shortcut="⌘⇧A"
          onClick={onAutoAlign}
        />
        <CanvasContextMenuItem
          icon={StickyNote}
          label="Add Sticky Note"
          shortcut="N"
          onClick={onAddStickyNote}
        />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function PositionedContextMenu({
  open,
  position,
  onClose,
  children,
}) {
  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed z-50"
        style={{ left: position.x, top: position.y }}
      >
        <div
          className="bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[200px]"
          onMouseLeave={onClose}
        >
          {children}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ContextMenuItemList({ items, onItemClick }) {
  return (
    <>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <CanvasContextMenuItem
            icon={item.icon}
            label={item.label}
            shortcut={item.shortcut}
            danger={item.danger}
            disabled={item.disabled}
            onClick={() => onItemClick?.(item)}
          />
          {item.divider && <ContextMenuSeparator />}
        </React.Fragment>
      ))}
    </>
  );
}
