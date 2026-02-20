import {
  LayoutGrid,
  Kanban,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore } from "@/stores";
import { useViewStore } from "@/stores";
import { ViewType } from "@/types";
import { cn } from "@/lib/utils";

const viewIconMap: Record<string, React.ElementType> = {
  [ViewType.Grid]: LayoutGrid,
  [ViewType.DefaultGrid]: LayoutGrid,
  [ViewType.Kanban]: Kanban,
};

function getViewIcon(type: ViewType) {
  return viewIconMap[type] || Eye;
}

export function Sidebar() {
  const { sidebarExpanded, toggleSidebar } = useUIStore();
  const { views, currentViewId, setCurrentView } = useViewStore();

  const displayViews = views.length > 0
    ? views
    : [
        { id: "default-grid", name: "Grid View", type: ViewType.DefaultGrid },
        { id: "default-kanban", name: "Kanban View", type: ViewType.Kanban },
      ];

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col border-r bg-sidebar transition-all duration-200 ease-in-out",
          sidebarExpanded ? "w-60" : "w-12"
        )}
      >
        <div
          className={cn(
            "flex h-12 items-center border-b px-3",
            sidebarExpanded ? "justify-between" : "justify-center"
          )}
        >
          {sidebarExpanded && (
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-primary">
                <LayoutGrid className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-sm font-semibold text-sidebar-foreground">
                Sheets
              </span>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div
              className={cn(
                "mb-1 flex items-center",
                sidebarExpanded ? "justify-between px-2" : "justify-center"
              )}
            >
              {sidebarExpanded && (
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Views
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Add view</TooltipContent>
              </Tooltip>
            </div>

            <Separator className="mb-2" />

            <div className="space-y-0.5">
              {displayViews.map((view) => {
                const Icon = getViewIcon(view.type);
                const isActive = view.id === (currentViewId || displayViews[0]?.id);

                return (
                  <Tooltip key={view.id}>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => setCurrentView(view.id)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                          sidebarExpanded ? "" : "justify-center",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {sidebarExpanded && (
                          <span className="truncate">{view.name}</span>
                        )}
                      </button>
                    </TooltipTrigger>
                    {!sidebarExpanded && (
                      <TooltipContent side="right">{view.name}</TooltipContent>
                    )}
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        <div className="border-t p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className={cn(
                  "w-full",
                  sidebarExpanded ? "justify-start gap-2" : "justify-center"
                )}
              >
                {sidebarExpanded ? (
                  <>
                    <PanelLeftClose className="h-4 w-4" />
                    <span>Collapse</span>
                  </>
                ) : (
                  <PanelLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            {!sidebarExpanded && (
              <TooltipContent side="right">Expand sidebar</TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
}
