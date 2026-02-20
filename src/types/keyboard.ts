export type NavigationKey =
  | "ArrowUp"
  | "ArrowDown"
  | "ArrowLeft"
  | "ArrowRight"
  | "Tab"
  | "Enter"
  | "Escape"
  | "Home"
  | "End"
  | "PageUp"
  | "PageDown";

export interface IKeyboardNavigationProps {
  onNavigate: (key: NavigationKey, shiftKey: boolean, metaKey: boolean) => void;
  onEdit: (key: string) => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSelectAll: () => void;
  isEditing: boolean;
  enabled: boolean;
}
