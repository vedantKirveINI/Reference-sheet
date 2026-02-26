import { useState, useRef, useEffect, useCallback } from "react";
import {
  UserPlus,
  Copy,
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

function RoleDropdown({
  value,
  onChange,
  disabled = false,
}: {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
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
    { value: "viewer", label: "Viewer", icon: Eye },
    { value: "editor", label: "Editor", icon: Pencil },
  ];

  const current = roles.find((r) => r.value === value.toLowerCase()) || roles[0];

  return (
    <div ref={ref} className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {current.label}
        <ChevronDown className="h-3 w-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[140px] rounded-xl border border-border bg-popover p-1 shadow-xl">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                onClick={() => {
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

function InviteRoleSelector({
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
    { value: "VIEWER", label: "Viewer", icon: Eye, desc: "Can view only" },
    { value: "EDITOR", label: "Editor", icon: Pencil, desc: "Can edit and view" },
  ];

  const current = roles.find((r) => r.value === value) || roles[0];
  const CurrentIcon = current.icon;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-muted-foreground/30"
      >
        <CurrentIcon className="h-3.5 w-3.5 text-muted-foreground" />
        {current.label}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[180px] rounded-xl border border-border bg-popover p-1.5 shadow-xl">
          {roles.map((r) => {
            const Icon = r.icon;
            return (
              <button
                key={r.value}
                onClick={() => {
                  onChange(r.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted ${
                  current.value === r.value ? "bg-muted/60" : ""
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${current.value === r.value ? "text-primary" : "text-muted-foreground"}`} />
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground">{r.label}</div>
                  <div className="text-[11px] text-muted-foreground">{r.desc}</div>
                </div>
                {current.value === r.value && <Check className="ml-auto h-3.5 w-3.5 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function InviteSection({
  assetId,
  tableId,
  onInviteSuccess,
}: {
  assetId: string;
  tableId: string;
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
  } = useSearchInvite({ assetId, tableId, onInviteSuccess });

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

  return (
    <div className="px-6 pb-1" ref={containerRef}>
      <div className="flex items-center gap-2 mb-3">
        <UserPlus className="h-4 w-4 text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">Add people</span>
      </div>

      <div className="relative">
        <div
          className={`flex flex-wrap items-center gap-1.5 rounded-xl border bg-background px-3 py-2 transition-all ${
            hasSelected
              ? "border-primary/40 ring-2 ring-primary/10"
              : "border-border hover:border-muted-foreground/30"
          }`}
          onClick={() => inputRef.current?.focus()}
        >
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
          <div className="relative flex-1 min-w-[100px]">
            <input
              ref={inputRef}
              type="text"
              placeholder={hasSelected ? "Add more people..." : "Add people by name or email"}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onFocus={() => {
                if (query.trim()) setShowDropdown(true);
              }}
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/50 py-0.5"
            />
          </div>
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

      <div className="mt-3 flex items-center justify-end gap-2">
        <InviteRoleSelector value={inviteRole} onChange={setInviteRole} />
        <Button
          size="sm"
          onClick={handleInvite}
          disabled={!hasSelected || inviting}
          className="rounded-lg px-4 gap-2"
        >
          {inviting ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <UserPlus className="h-3.5 w-3.5" />
              {hasSelected ? `Invite${selectedUsers.length > 1 ? ` ${selectedUsers.length}` : ""}` : "Invite"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function MembersSection({
  members,
  loading,
  onRoleChange,
}: {
  members: MemberInfo[];
  loading: boolean;
  onRoleChange: (userId: string, role: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const memberCount = members.length;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-2.5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className={`transition-transform duration-200 ${expanded ? "rotate-90" : ""}`}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <span className="text-[13px] font-medium text-foreground">People with access</span>
          {memberCount > 0 && (
            <span className="text-[11px] text-muted-foreground bg-muted rounded-full px-2 py-0.5 tabular-nums">
              {memberCount}
            </span>
          )}
        </div>
        {!expanded && memberCount > 0 && (
          <div className="flex -space-x-1.5">
            {members.slice(0, 4).map((m) => (
              <div
                key={m.userId || m.email}
                className={`h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-medium text-white ring-2 ring-background ${getAvatarColor(m.name || m.email)}`}
              >
                {getInitials(m.name, m.email)}
              </div>
            ))}
            {memberCount > 4 && (
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-medium bg-muted text-muted-foreground ring-2 ring-background">
                +{memberCount - 4}
              </div>
            )}
          </div>
        )}
      </button>

      {expanded && (
        <div className="px-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
            </div>
          ) : memberCount > 0 ? (
            <div className="max-h-[200px] overflow-y-auto space-y-0.5">
              {members.map((member) => (
                <div
                  key={member.userId || member.email}
                  className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-all ${
                    member.isModified
                      ? "bg-amber-50 dark:bg-amber-950/20 ring-1 ring-amber-200/60 dark:ring-amber-800/30"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={member.name} email={member.email} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {member.name || member.email}
                        </span>
                        {member.isOwner && (
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                            <Crown className="h-2.5 w-2.5" />
                            Owner
                          </span>
                        )}
                      </div>
                      {member.name && (
                        <div className="truncate text-xs text-muted-foreground">{member.email}</div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {member.isOwner ? (
                      <span className="text-xs text-muted-foreground px-3 py-1">Owner</span>
                    ) : (
                      <RoleDropdown
                        value={member.role}
                        onChange={(role) => onRoleChange(member.userId, role)}
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
      )}
    </div>
  );
}

function GeneralAccessSection({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: (val: boolean) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="px-6 pt-2 pb-3">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-[13px] font-medium text-foreground">General access</span>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-muted/40 p-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
            enabled
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400 ring-4 ring-emerald-50 dark:ring-emerald-900/20"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {enabled ? <Globe className="h-5 w-5" /> : <Lock className="h-5 w-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground">
            {enabled ? "Anyone with the link" : "Restricted"}
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed">
            {enabled
              ? "Anyone on the internet with the link can view"
              : "Only people with access can open"}
          </div>
        </div>

        <div ref={dropdownRef} className="relative shrink-0">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              enabled
                ? "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {enabled ? "Anyone" : "Restricted"}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 bottom-full z-50 mb-2 min-w-[240px] rounded-xl border border-border bg-popover p-1.5 shadow-xl">
              <button
                onClick={() => { onToggle(false); setDropdownOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted ${
                  !enabled ? "bg-muted/60" : ""
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Lock className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">Restricted</div>
                  <div className="text-[11px] text-muted-foreground">Only people with access</div>
                </div>
                {!enabled && <Check className="h-4 w-4 text-primary shrink-0" />}
              </button>
              <button
                onClick={() => { onToggle(true); setDropdownOpen(false); }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted ${
                  enabled ? "bg-muted/60" : ""
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <Globe className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-foreground">Anyone with the link</div>
                  <div className="text-[11px] text-muted-foreground">Anyone on the internet can view</div>
                </div>
                {enabled && <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ShareModalProps {
  baseId?: string;
  tableId?: string;
}

export function ShareModal({ baseId, tableId }: ShareModalProps) {
  const { shareModal, closeShareModal } = useModalControlStore();
  const assetId = baseId || "";
  const effectiveTableId = tableId || "";
  const [copied, setCopied] = useState(false);

  const {
    members,
    generalAccessEnabled,
    loading,
    saving,
    hasChanges,
    updateMemberRole,
    toggleGeneralAccess,
    handleSave,
    handleCancel,
    refetchMembers,
  } = useShareModal({ isOpen: shareModal, assetId });

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <Dialog open={shareModal} onOpenChange={(open) => !open && closeShareModal()}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0" showCloseButton={false}>
        <div className="flex flex-col min-w-0">
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
            onInviteSuccess={refetchMembers}
          />

          <div className="my-1 mx-6 border-t border-border/60" />

          <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
            <MembersSection
              members={members}
              loading={loading}
              onRoleChange={updateMemberRole}
            />
          </div>

          <div className="mx-6 border-t border-border/60" />

          <GeneralAccessSection
            enabled={generalAccessEnabled}
            onToggle={toggleGeneralAccess}
          />

          <div className="flex items-center justify-between gap-3 border-t border-border px-5 py-3">
            <button
              onClick={handleCopyLink}
              className={`group flex items-center gap-2.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                copied
                  ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800/40"
                  : "bg-muted/50 text-foreground hover:bg-muted hover:shadow-sm"
              }`}
            >
              <div className={`flex items-center justify-center rounded-full transition-all duration-300 ${
                copied ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground group-hover:text-foreground"
              }`}>
                {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
              </div>
              {copied ? "Copied!" : "Copy link"}
            </button>

            {hasChanges ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                  className="rounded-lg text-muted-foreground"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg gap-1.5 px-4"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={closeShareModal}
                className="rounded-lg px-5"
              >
                Done
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
