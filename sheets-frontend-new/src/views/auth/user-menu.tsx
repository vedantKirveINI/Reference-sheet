import { User, Settings, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex h-7 w-7 items-center justify-center rounded-full bg-muted hover:bg-accent transition-colors">
          <User className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 island-elevated">
        <DropdownMenuLabel className="font-normal py-1.5">
          <div className="flex flex-col gap-0.5">
            <p className="text-xs font-medium">John Doe</p>
            <p className="text-[length:var(--app-font-2xs)] text-muted-foreground">john@example.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled className="text-xs py-1.5">
          <Settings className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => console.log("[Auth] Sign out clicked (stub)")} className="text-xs py-1.5">
          <LogOut className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
