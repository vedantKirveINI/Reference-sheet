import React, { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";
import { Settings, Globe, Palette, HelpCircle } from "lucide-react";
import { MODE_CONFIG } from "./config";
import { MODE } from "../../../constants/mode";

const SaveIcon = icons.save;
const CheckIcon = icons.check;
const Loader2Icon = icons.loader2;
const RocketIcon = icons.rocket;
const CheckCircleIcon = icons.checkCircle;

const UserPlusIcon = icons.userPlus;

const HeaderActions = ({
  mode,
  isPublished,
  loading,
  settings,
  onSave,
  onPublish,
  onActiveToggle,
  onOnlineToggle,
  saveButtonRef,
  publishBtnRef,
  compact,
  className,
  isDirty = false,
  isEmbedMode = false,
  isEmbedAuthenticated = false,
  onEmbedSignUp,
  onOpenGlobalParams,
  onOpenThemeManager,
  onOpenHelp,
}) => {
  const config = MODE_CONFIG[mode] || MODE_CONFIG[MODE.WORKFLOW_CANVAS];
  const [justSaved, setJustSaved] = useState(false);
  const prevLoadingRef = useRef(loading);

  useEffect(() => {
    const wasSaving = prevLoadingRef.current && typeof prevLoadingRef.current === 'string' && prevLoadingRef.current.toLowerCase().includes('saving');
    const isNotSavingNow = !loading || (typeof loading === 'string' && !loading.toLowerCase().includes('saving'));
    
    if (wasSaving && isNotSavingNow) {
      setJustSaved(true);
      const timer = setTimeout(() => setJustSaved(false), 2000);
      return () => clearTimeout(timer);
    }
    
    prevLoadingRef.current = loading;
  }, [loading]);

  const renderModeToggle = () => {
    if (!isPublished) return null;

    const wrapperClass =
      "flex items-center gap-2 rounded-island-sm shadow-island-sm border border-black/[0.04] bg-surface-base px-3 py-2";

    const switchClass =
      "data-[state=unchecked]:bg-zinc-200 data-[state=checked]:bg-primary focus-visible:ring-2 focus-visible:ring-primary/20";

    if (config.showActiveToggle && mode === MODE.WC_CANVAS) {
      const isActive = settings?.execution_control?.enabled ?? false;
      return (
        <div className={wrapperClass} data-testid="header-active-toggle">
          <Switch
            id="active-switch"
            checked={isActive}
            onCheckedChange={onActiveToggle}
            disabled={loading}
            className={switchClass}
          />
          <Label htmlFor="active-switch" className="cursor-pointer select-none text-xs font-medium text-muted-foreground">
            Active
          </Label>
        </div>
      );
    }

    if (config.showOnlineToggle && mode === MODE.AGENT_CANVAS) {
      const isOnline = settings?.online ?? false;
      return (
        <div className={wrapperClass} data-testid="header-online-toggle">
          <Switch
            id="online-switch"
            checked={isOnline}
            onCheckedChange={onOnlineToggle}
            disabled={loading}
            className={switchClass}
          />
          <Label htmlFor="online-switch" className="cursor-pointer select-none text-xs font-medium text-muted-foreground">
            Online
          </Label>
        </div>
      );
    }

    return null;
  };

  const renderSaveStatus = () => {
    const isSaving = loading && typeof loading === 'string' && loading.toLowerCase().includes('saving');

    const getSaveContent = () => {
      if (isSaving) {
        return (
          <>
            <Loader2Icon className="w-3.5 h-3.5 animate-spin" />
            <span>Saving...</span>
          </>
        );
      }
      if (justSaved || !isDirty) {
        return (
          <>
            <CheckIcon className="w-3.5 h-3.5" />
            <span>Saved</span>
          </>
        );
      }
      return (
        <>
          <SaveIcon className="w-3.5 h-3.5" />
          <span>Save</span>
        </>
      );
    };

    const getTooltip = () => {
      if (isSaving) return "Saving changes...";
      if (justSaved || !isDirty) return "All changes saved";
      return "Save changes";
    };

    const saveVariant = isDirty && !isSaving ? "default" : "ghost";
    const saveDisabled = Boolean(loading) || !isDirty;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={onSave}
            ref={saveButtonRef}
            disabled={saveDisabled}
            variant={saveVariant}
            size="sm"
            className={cn(
              "rounded-island-sm",
              isSaving && "text-muted-foreground",
              !isDirty && !isSaving && "cursor-default"
            )}
            data-testid="header-save-button"
          >
            {getSaveContent()}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {getTooltip()}
        </TooltipContent>
      </Tooltip>
    );
  };

  const renderPublishButton = () => {
    const isSaving = loading && typeof loading === 'string' && loading.toLowerCase().includes('saving');
    const publishDisabled = isDirty || isSaving;
    const publishedAndClean = isPublished && !isDirty;
    const publishedAndDirty = isPublished && isDirty;

    const label = publishedAndClean ? "Published" : publishedAndDirty ? "Republish" : "Publish";
    const isGhost = publishedAndClean;
    const PublishIcon = publishedAndClean ? CheckCircleIcon : RocketIcon;

    const publishVariant = isGhost ? "outline" : "default";

    return (
      <Button
        onClick={onPublish}
        ref={publishBtnRef}
        disabled={publishDisabled}
        variant={publishVariant}
        size="sm"
        className={cn(
          "rounded-island-sm",
          publishDisabled && "pointer-events-none opacity-50"
        )}
        data-testid="header-publish-button"
      >
        <PublishIcon className="h-3.5 w-3.5" />
        {label}
      </Button>
    );
  };

  if (isEmbedMode && !isEmbedAuthenticated) {
    return (
      <div
        className={cn("flex items-center gap-3", className)}
        data-testid="header-actions"
      >
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Create a free account to save and publish your work
        </span>
        <Button
          onClick={onEmbedSignUp}
          size="sm"
          className="rounded-island-sm bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
          data-testid="header-signup-button"
        >
          {UserPlusIcon && <UserPlusIcon className="w-3.5 h-3.5" />}
          Sign up free
        </Button>
      </div>
    );
  }

  const showThemeOption = mode === MODE.WORKFLOW_CANVAS;

  const hasSettingsHandlers = onOpenGlobalParams || onOpenThemeManager || onOpenHelp;

  const renderSettingsDropdown = () => {
    if (isEmbedMode || !hasSettingsHandlers) return null;

    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-island-sm"
                data-testid="header-settings-button"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          {onOpenGlobalParams && (
            <DropdownMenuItem
              onClick={onOpenGlobalParams}
              className="cursor-pointer"
              data-testid="header-settings-global-vars"
            >
              <Globe className="w-4 h-4 mr-2" />
              Global Variables
            </DropdownMenuItem>
          )}
          {showThemeOption && onOpenThemeManager && (
            <>
              {onOpenGlobalParams && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={onOpenThemeManager}
                className="cursor-pointer"
                data-testid="header-settings-theme"
              >
                <Palette className="w-4 h-4 mr-2" />
                Theme
              </DropdownMenuItem>
            </>
          )}
          {onOpenHelp && (
            <>
              {(onOpenGlobalParams || onOpenThemeManager) && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={onOpenHelp}
                className="cursor-pointer"
                data-testid="header-settings-help"
              >
                <HelpCircle className="w-4 h-4 mr-2" />
                Help & Resources
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <TooltipProvider>
      <div
        className={cn("flex items-center gap-3", className)}
        data-testid="header-actions"
      >
        {renderSettingsDropdown()}

        {renderModeToggle()}

        {renderSaveStatus()}

        {renderPublishButton()}
      </div>
    </TooltipProvider>
  );
};

export default HeaderActions;
