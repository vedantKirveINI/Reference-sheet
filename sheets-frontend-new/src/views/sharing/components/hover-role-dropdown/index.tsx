import { ChevronDown, Check, Eye, Pencil, UserX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MEMBER_ROLES = [
  {
    value: "viewer",
    label: "Viewer",
    description: "Can only view the table.",
    icon: Eye,
  },
  {
    value: "editor",
    label: "Editor",
    description: "Can add, edit, and delete records and share the table.",
    icon: Pencil,
  },
  {
    value: "remove access",
    label: "Remove",
    description: "Revokes all access to the table.",
    icon: UserX,
  },
] as const;

interface HoverRoleDropdownProps {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
}

export function HoverRoleDropdown({
  value,
  onChange,
  disabled = false,
}: HoverRoleDropdownProps) {
  const normalized = value.toLowerCase();
  const current =
    MEMBER_ROLES.find(
      (r) =>
        r.value === normalized ||
        (r.value === "remove access" && value === "remove access")
    ) ?? MEMBER_ROLES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          type="button"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-all hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed group-hover/member:bg-muted/50"
        >
          <span>{current.label}</span>
          <ChevronDown className="h-3 w-3 opacity-0 group-hover/member:opacity-100 transition-opacity" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[16.25rem] p-1">
        {MEMBER_ROLES.map((r) => {
          const Icon = r.icon;
          const isSelected = current.value === r.value;
          return (
            <DropdownMenuItem
              key={r.value}
              onSelect={() => {
                onChange(r.value);
              }}
              className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-left ${
                isSelected
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "text-foreground"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{r.label}</div>
                <div
                  className={`text-xs mt-0.5 ${
                    isSelected
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  }`}
                >
                  {r.description}
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 shrink-0" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

