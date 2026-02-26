import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import {
  Link2,
  X,
  Check,
  Search,
  Globe,
  Lock,
  Loader2,
  ChevronDown,
  ChevronRight,
  Crown,
  Eye,
  Pencil,
  Users,
  Send,
  UserX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModalControlStore } from "@/stores";
import { useShareModal, type MemberInfo } from "./hooks/useShareModal";
import { useSearchInvite, type SearchResult } from "./hooks/useSearchInvite";

const AVATAR_COLORS = [
  "bg-emerald-500",
  "bg-blue-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-cyan-500",
  "bg-indigo-500",
  "bg-pink-500",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  }
  return (email || "?")[0].toUpperCase();
}

function Avatar({ name, email, size = "md" }: { name: string; email: string; size?: "sm" | "md" | "lg" }) {
  const colorClass = getAvatarColor(name || email);
  const sizeClass = size === "sm" ? "h-6 w-6 text-[10px]" : size === "lg" ? "h-10 w-10 text-sm" : "h-8 w-8 text-xs";
  return (
    <div
      className={`${sizeClass} ${colorClass} flex shrink-0 items-center justify-center rounded-full font-medium text-white`}
    >
      {getInitials(name, email)}
    </div>
  );
}

function MiniAvatar({ name, email }: { name: string; email: string }) {
  const colorClass = getAvatarColor(name || email);
  return (
    <div
      className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white ring-2 ring-background ${colorClass}`}
    >
      {getInitials(name, email)}
    </div>
  );
}

function EmbeddedRoleSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (role: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const roles = [
    { value: "VIEWER", label: "Viewer", icon: Eye },
    { value: "EDITOR", label: "Editor", icon: Pencil },
  ];

  const current = roles.find((r) => r.value === value) || roles[0];

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/60"
      >
        {current.label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[150px] rounded-xl border border-border bg-popover p-1 shadow-xl">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(r.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-colors hover:bg-muted ${
                  current.value === r.value ? "text-foreground font-medium" : "text-muted-foreground"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {r.label}
                {current.value === r.value && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const MEMBER_ROLES = [
  { value: "viewer", label: "Viewer", description: "Can only view the table.", icon: Eye },
  { value: "editor", label: "Editor", description: "Can add, edit, and delete records and share the table.", icon: Pencil },
  { value: "remove access", label: "Remove", description: "Revokes all access to the table.", icon: UserX },
] as const;

const GENERAL_ACCESS_OPTIONS = [
  { value: false, label: "Restricted", description: "Only people with access can open", icon: Lock },
  { value: true, label: "Anyone with the link", description: "Anyone on the internet with the link can view", icon: Globe },
] as const;

function HoverRoleDropdown({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 4;
    const panelWidth = 260;
    const viewportWidth = window.innerWidth;
    const openToRight = rect.right + gap + panelWidth <= viewportWidth;
    setPosition({
      top: rect.top,
      left: openToRight ? rect.right + gap : rect.left - panelWidth - gap,
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const normalized = value.toLowerCase();
  const current = MEMBER_ROLES.find((r) => r.value === normalized || (r.value === "remove access" && value === "remove access")) ?? MEMBER_ROLES[0];

  const dropdownContent = open && (
    <div
      ref={panelRef}
      className="fixed z-[9999] min-w-[260px] rounded-xl border border-border bg-popover p-1 shadow-xl"
      style={{ top: position.top, left: position.left }}
    >
      {MEMBER_ROLES.map((r) => {
        const Icon = r.icon;
        const isSelected = current.value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(r.value);
              setOpen(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted ${
              isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{r.label}</div>
              <div className={`text-xs mt-0.5 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {r.description}
              </div>
            </div>
            {isSelected && <Check className="h-4 w-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-all hover:text-foreground hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed group-hover/member:bg-muted/50"
      >
        <span>{current.label}</span>
        <ChevronDown className="h-3 w-3 opacity-0 group-hover/member:opacity-100 transition-opacity" />
      </button>
      {typeof document !== "undefined" && createPortal(dropdownContent, document.body)}
    </div>
  );
}

function InviteSection({
  assetId,
  tableId,
  workspaceId,
  onInviteSuccess,
}: {
  assetId: string;
  tableId: string;
  workspaceId?: string;
  onInviteSuccess: () => void;
}) {
  const {
    query,
    results,
    searching,
    selectedUsers,
    inviteRole,
    setInviteRole,
    inviting,
    showDropdown,
    setShowDropdown,
    handleQueryChange,
    selectUser,
    removeUser,
    handleInvite,
  } = useSearchInvite({ assetId, tableId, workspaceId, onInviteSuccess });

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const hasSelected = selectedUsers.length > 0;

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && hasSelected && !query.trim()) {
      e.preventDefault();
      handleInvite();
    }
  }, [hasSelected, query, handleInvite]);

  return (
    <div className="px-6 pb-4" ref={containerRef}>
      <div className="relative">
        <div
          className={`flex flex-wrap items-center gap-1.5 rounded-xl border bg-background pl-3 pr-1 py-1.5 transition-all ${
            hasSelected
              ? "border-primary/40 ring-2 ring-primary/10"
              : "border-border hover:border-muted-foreground/30"
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {!hasSelected && (
            <Search className="h-4 w-4 text-muted-foreground/50 shrink-0 mr-0.5" />
          )}
          {selectedUsers.map((user) => (
            <span
              key={user._id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 pl-1 pr-1.5 py-0.5 text-xs font-medium text-primary"
            >
              <Avatar name={user.name} email={user.email} size="sm" />
              <span className="max-w-[80px] truncate ml-0.5">{user.name || user.email}</span>
              <button
                onClick={(e) => { e.stopPropagation(); removeUser(user._id); }}
                className="ml-0.5 rounded-full p-0.5 text-primary/50 hover:bg-primary/15 hover:text-primary transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <div className="relative flex-1 min-w-[80px]">
            <input
              ref={inputRef}
              type="text"
              placeholder={hasSelected ? "Add more..." : "Add people by name or email"}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => {
                if (query.trim()) setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 py-1"
            />
          </div>
          <EmbeddedRoleSelector value={inviteRole} onChange={setInviteRole} />
        </div>

        {showDropdown && (query.trim() || searching) && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-[220px] overflow-y-auto rounded-xl border border-border bg-popover shadow-xl">
            {searching ? (
              <div className="flex items-center justify-center gap-2 py-8">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Searching...</span>
              </div>
            ) : results.length > 0 ? (
              <div className="p-1.5">
                {results.map((user: SearchResult) => {
                  const isAlreadySelected = selectedUsers.some((u) => u._id === user._id);
                  return (
                    <button
                      key={user._id}
                      onClick={() => !isAlreadySelected && selectUser(user)}
                      disabled={isAlreadySelected}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                        isAlreadySelected
                          ? "opacity-50 cursor-default"
                          : "hover:bg-muted/60"
                      }`}
                    >
                      <Avatar name={user.name} email={user.email_id} />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {user.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {user.email_id}
                        </div>
                      </div>
                      {isAlreadySelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No users found
              </div>
            )}
          </div>
        )}
      </div>

      {hasSelected && (
        <div className="mt-2.5 flex items-center justify-end">
          <button
            onClick={handleInvite}
            disabled={inviting}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {inviting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Invite{selectedUsers.length > 1 ? ` ${selectedUsers.length}` : ""}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function MembersSection({
  members,
  loading,
  hasMemberChanges,
  onRoleChange,
}: {
  members: MemberInfo[];
  loading: boolean;
  hasMemberChanges: boolean;
  onRoleChange: (userId: string, role: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const memberCount = members.length;
  const isExpanded = expanded || hasMemberChanges;

  return (
    <div>
      <button
        onClick={() => !hasMemberChanges && setExpanded(!expanded)}
        className={`flex w-full items-center justify-between px-6 py-3 text-left transition-colors ${hasMemberChanges ? "cursor-default" : "hover:bg-muted/30"}`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">People with access</span>
        </div>

        {!isExpanded && (
          <div className="flex items-center gap-2.5">
            {memberCount > 0 ? (
              <>
                <div className="flex -space-x-2">
                  {members.slice(0, 4).map((m) => (
                    <MiniAvatar key={m.userId || m.email} name={m.name} email={m.email} />
                  ))}
                  {memberCount > 4 && (
                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-medium bg-muted text-muted-foreground ring-2 ring-background">
                      +{memberCount - 4}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {memberCount} {memberCount === 1 ? "person" : "people"}
                </span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No one yet</span>
            )}
          </div>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : memberCount > 0 ? (
            <div className="max-h-[240px] overflow-y-auto space-y-0.5">
              {members.map((member) => (
                <div
                  key={member.userId || member.email}
                  className={`group/member grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-3 py-2 transition-all min-w-0 ${
                    member.isModified
                      ? "bg-amber-50/80 dark:bg-amber-950/20 ring-1 ring-amber-200/50 dark:ring-amber-800/30"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                    <Avatar name={member.name} email={member.email} />
                    <div className="min-w-0 overflow-hidden flex flex-col gap-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="truncate text-sm font-medium text-foreground block">
                          {member.name || member.email}
                        </span>
                        {member.isOwner && (
                          <Crown className="h-3 w-3 text-amber-500 shrink-0" />
                        )}
                      </div>
                      {member.name && (
                        <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 min-w-[88px] flex justify-end">
                    {member.isOwner ? (
                      <span className="text-xs text-muted-foreground px-2 py-1">Owner</span>
                    ) : (
                      <HoverRoleDropdown
                        value={member.role}
                        onChange={(role) => onRoleChange(member.userId || member.email || "", role)}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No members yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function GeneralAccessSection({
  enabled,
  hasChanges,
  onToggle,
}: {
  enabled: boolean;
  hasChanges: boolean;
  onToggle: (val: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isExpanded = expanded || hasChanges;

  useLayoutEffect(() => {
    if (!dropdownOpen || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const gap = 4;
    setPosition({ top: rect.bottom + gap, left: rect.left });
  }, [dropdownOpen]);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  const generalAccessDropdownContent = dropdownOpen && (
    <div
      ref={panelRef}
      className="fixed z-[9999] min-w-[260px] rounded-xl border border-border bg-popover p-1 shadow-xl"
      style={{ top: position.top, left: position.left }}
    >
      {GENERAL_ACCESS_OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const isSelected = enabled === opt.value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggle(opt.value);
              setDropdownOpen(false);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted ${
              isSelected ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-foreground"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">{opt.label}</div>
              <div className={`text-xs mt-0.5 ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {opt.description}
              </div>
            </div>
            {isSelected && <Check className="h-4 w-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div>
      <button
        onClick={() => !hasChanges && setExpanded(!expanded)}
        className={`flex w-full items-center justify-between px-6 py-3 text-left transition-colors ${hasChanges ? "cursor-default" : "hover:bg-muted/30"}`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {enabled ? (
            <Globe className="h-4 w-4 text-emerald-500" />
          ) : (
            <Lock className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-sm font-medium text-foreground">General access</span>
        </div>

        {!isExpanded && (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
              enabled
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {enabled ? (
              <>
                <Globe className="h-3 w-3" />
                Anyone with link
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                Restricted
              </>
            )}
          </span>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 rounded-xl bg-muted/30 p-3 min-w-0">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                enabled
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {enabled ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
            </div>

            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="text-sm font-medium text-foreground truncate">
                {enabled ? "Anyone with the link" : "Restricted"}
              </div>
              <div className="text-xs text-muted-foreground leading-relaxed truncate">
                {enabled
                  ? "Anyone on the internet with the link can view"
                  : "Only people with access can open"}
              </div>
            </div>

            <div className="relative shrink-0 flex items-center">
              <button
                ref={triggerRef}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  enabled
                    ? "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {enabled ? "Anyone" : "Restricted"}
                <ChevronDown className="h-3 w-3" />
              </button>
              {typeof document !== "undefined" && createPortal(generalAccessDropdownContent, document.body)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ShareModalProps {
  baseId?: string;
  tableId?: string;
  workspaceId?: string;
}

export function ShareModal({ baseId, tableId, workspaceId }: ShareModalProps) {
  const { shareModal, closeShareModal } = useModalControlStore();
  const assetId = baseId || "";
  const effectiveTableId = tableId || "";
  const [copied, setCopied] = useState(false);

  const {
    members,
    generalAccessEnabled,
    loading,
    hasChanges,
    hasMemberChanges,
    hasGeneralAccessChanges,
    saving,
    updateMemberRole,
    toggleGeneralAccess,
    handleSave,
    handleCancel,
    refetchMembers,
  } = useShareModal({ isOpen: shareModal, assetId });

  const handleSaveAndClose = useCallback(async () => {
    const success = await handleSave();
    if (success) closeShareModal();
  }, [handleSave, closeShareModal]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <Dialog open={shareModal} onOpenChange={(open) => !open && closeShareModal()}>
      <DialogContent
        className="sm:max-w-[520px] p-0 gap-0 overflow-y-auto"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
        onFocusOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div className="flex flex-col min-w-0 pr-5">
          <div className="flex items-center justify-between px-6 pt-5 pb-4">
            <DialogTitle className="text-lg font-semibold text-foreground">
              Share
            </DialogTitle>
            <DialogDescription className="sr-only">
              Share this sheet with others by inviting people or generating a link
            </DialogDescription>
            <button
              onClick={closeShareModal}
              className="rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <InviteSection
            assetId={assetId}
            tableId={effectiveTableId}
            workspaceId={workspaceId}
            onInviteSuccess={refetchMembers}
          />

          <div className="mx-6 border-t border-border/40" />

          <MembersSection
            members={members}
            loading={loading}
            hasMemberChanges={hasMemberChanges}
            onRoleChange={updateMemberRole}
          />

          <GeneralAccessSection
            enabled={generalAccessEnabled}
            hasChanges={hasGeneralAccessChanges}
            onToggle={toggleGeneralAccess}
          />

          <div className="flex items-center justify-between gap-3 border-t border-border/40 px-5 py-3">
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                copied
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/40"
                  : "bg-muted/50 text-foreground hover:bg-muted"
              }`}
            >
              {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              {copied ? "Copied!" : "Copy link"}
            </button>

            <div className="flex items-center gap-2">
              {hasChanges && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg px-5"
                >
                  Cancel
                </Button>
              )}
              {!hasChanges && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={closeShareModal}
                  className="rounded-lg px-5"
                >
                  Done
                </Button>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveAndClose}
                disabled={!hasChanges || saving}
                className="rounded-lg px-5"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Saving...
                  </>
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
