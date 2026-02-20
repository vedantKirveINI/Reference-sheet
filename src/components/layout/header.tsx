import { useState, useRef, useEffect } from "react";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserMenu } from "@/views/auth/user-menu";
import { useModalControlStore } from "@/stores";
import tinySheetLogo from '@/assets/tiny-sheet.svg';

const mockCollaborators = [
  { id: "u1", initials: "AJ", color: "bg-blue-500" },
  { id: "u2", initials: "MK", color: "bg-emerald-500" },
];

interface HeaderProps {
  sheetName?: string;
  onSheetNameChange?: (name: string) => void;
}

export function Header({ sheetName: propSheetName, onSheetNameChange }: HeaderProps) {
  const [localSheetName, setLocalSheetName] = useState("Untitled Sheet");
  const displayName = propSheetName ?? localSheetName;
  const [editValue, setEditValue] = useState(displayName);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { openShareModal } = useModalControlStore();

  useEffect(() => {
    if (propSheetName !== undefined) {
      setEditValue(propSheetName);
    }
  }, [propSheetName]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleNameSubmit = () => {
    setIsEditing(false);
    const trimmed = editValue.trim() || "Untitled Sheet";
    setEditValue(trimmed);
    if (propSheetName === undefined) {
      setLocalSheetName(trimmed);
    }
    if (onSheetNameChange) {
      onSheetNameChange(trimmed);
    }
  };

  return (
    <header className="flex h-12 items-center justify-between border-b bg-white/90 backdrop-blur-sm px-4">
      <div className="flex items-center gap-3">
        <img src={tinySheetLogo} alt="TINYSheet" className="h-7 w-7 rounded-md" />
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleNameSubmit();
              if (e.key === "Escape") {
                setIsEditing(false);
              }
            }}
            className="h-7 rounded border border-ring px-2 text-sm font-semibold outline-none"
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded px-1 py-0.5 text-sm font-semibold text-foreground hover:bg-accent"
          >
            {displayName}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center -space-x-1.5 mr-1 rounded-full bg-white/80 px-1 py-0.5 shadow-xs">
          {mockCollaborators.map((collab) => (
            <div
              key={collab.id}
              className={`flex h-6 w-6 items-center justify-center rounded-full ${collab.color} text-[10px] font-medium text-white ring-2 ring-white`}
              title={collab.initials}
            >
              {collab.initials}
            </div>
          ))}
          <div className="relative flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-[10px] font-medium text-gray-600 ring-2 ring-white">
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
          </div>
        </div>

        <Button variant="outline" size="sm" className="gap-1.5 border-brand-500/30 text-brand-700 hover:bg-brand-50 hover:text-brand-800" onClick={openShareModal}>
          <Share2 className="h-3.5 w-3.5" />
          Share
        </Button>

        <Separator orientation="vertical" className="h-6" />

        <UserMenu />
      </div>
    </header>
  );
}
