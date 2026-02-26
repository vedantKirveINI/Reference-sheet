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
  Users,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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

function Avatar({ name, email, size = "md" }: { name: string; email: string; size?: "sm" | "md" }) {
  const colorClass = getAvatarColor(name || email);
  const sizeClass = size === "sm" ? "h-7 w-7 text-[10px]" : "h-8 w-8 text-xs";
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
  size = "default",
}: {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
  size?: "default" | "sm";
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
    { value: "viewer", label: "Viewer" },
    { value: "editor", label: "Editor" },
  ];

  const current = roles.find((r) => r.value === value.toLowerCase()) || roles[0];
  const padClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";

  return (
    <div ref={ref} className="relative">
      <button
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={`${padClass} flex items-center gap-1 rounded-md border border-border bg-background font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {current.label}
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-1 min-w-[120px] rounded-md border border-border bg-popover p-1 shadow-md">
          {roles.map((r) => (
            <button
              key={r.value}
              onClick={() => {
                onChange(r.value);
                setOpen(false);
              }}
              className={`flex w-full items-center rounded-sm px-2.5 py-1.5 text-xs transition-colors hover:bg-muted ${
                current.value === r.value ? "bg-muted font-medium" : ""
              }`}
            >
              {r.label}
              {current.value === r.value && <Check className="ml-auto h-3 w-3" />}
            </button>
          ))}
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
    inviting,
    showDropdown,
    setShowDropdown,
    handleQueryChange,
    selectUser,
    removeUser,
    updateUserRole,
    handleInvite,
  } = useSearchInvite({ assetId, tableId, onInviteSuccess });

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <UserPlus className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Invite People</span>
      </div>

      <div className="relative">
        <div className="flex items-start gap-2">
          <div className="relative flex-1">
            <div className="flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-muted/30 px-3 py-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
              {selectedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  <span className="max-w-[120px] truncate">{user.email}</span>
                  <div className="mx-0.5 h-3 w-px bg-primary/20" />
                  <RoleDropdown
                    value={user.role}
                    onChange={(role) => updateUserRole(user._id, role)}
                    size="sm"
                  />
                  <button
                    onClick={() => removeUser(user._id)}
                    className="ml-0.5 rounded-full p-0.5 text-primary/60 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <div className="relative flex-1 min-w-[140px]">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={selectedUsers.length > 0 ? "Add more..." : "Search by name or email"}
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  className="w-full bg-transparent pl-5 text-sm outline-none placeholder:text-muted-foreground/60"
                />
              </div>
            </div>

            {showDropdown && (query.trim() || searching) && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[200px] overflow-y-auto rounded-lg border border-border bg-popover shadow-lg"
              >
                {searching ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">Searching...</span>
                  </div>
                ) : results.length > 0 ? (
                  results.map((user: SearchResult) => (
                    <button
                      key={user._id}
                      onClick={() => selectUser(user)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                    >
                      <Avatar name={user.name} email={user.email_id} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-foreground">
                          {user.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {user.email_id}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-muted-foreground">
                    No users found
                  </div>
                )}
              </div>
            )}
          </div>

          <Button
            size="sm"
            onClick={handleInvite}
            disabled={selectedUsers.length === 0 || inviting}
            className="shrink-0 h-[38px] px-4 rounded-lg"
          >
            {inviting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Invite"
            )}
          </Button>
        </div>
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
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">People with access</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {members.length} {members.length === 1 ? "member" : "members"}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          <span className="ml-2 text-sm text-muted-foreground">Loading members...</span>
        </div>
      ) : members.length > 0 ? (
        <div className="max-h-[200px] space-y-0.5 overflow-y-auto -mx-1 px-1">
          {members.map((member) => (
            <div
              key={member.userId || member.email}
              className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition-all ${
                member.isModified
                  ? "bg-amber-50 border border-amber-200/60 dark:bg-amber-950/20 dark:border-amber-800/40"
                  : "hover:bg-muted/50"
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
                  <span className="text-xs text-muted-foreground px-2.5 py-1">Owner</span>
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
          No members yet. Invite someone to get started.
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
  const [copied, setCopied] = useState(false);

  const handleCopyLink = useCallback(() => {
    const link = window.location.href;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="mb-3 flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">General Access</span>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => onToggle(false)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all border ${
            !enabled
              ? "border-primary/30 bg-primary/5"
              : "border-transparent hover:bg-muted/50"
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              !enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            <Lock className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">Restricted</div>
            <div className="text-xs text-muted-foreground">Only people with access can open</div>
          </div>
          <div
            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              !enabled ? "border-primary" : "border-muted-foreground/30"
            }`}
          >
            {!enabled && <div className="h-2 w-2 rounded-full bg-primary" />}
          </div>
        </button>

        <button
          onClick={() => onToggle(true)}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-all border ${
            enabled
              ? "border-primary/30 bg-primary/5"
              : "border-transparent hover:bg-muted/50"
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
              enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            }`}
          >
            <Globe className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-foreground">Anyone with the link</div>
            <div className="text-xs text-muted-foreground">
              Anyone with the link can view this sheet
            </div>
          </div>
          <div
            className={`h-4 w-4 rounded-full border-2 flex items-center justify-center transition-colors ${
              enabled ? "border-primary" : "border-muted-foreground/30"
            }`}
          >
            {enabled && <div className="h-2 w-2 rounded-full bg-primary" />}
          </div>
        </button>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="truncate text-xs text-muted-foreground">
              {window.location.href}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            className="gap-1.5 shrink-0 rounded-lg h-[34px]"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-emerald-600">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy link
              </>
            )}
          </Button>
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

  return (
    <Dialog open={shareModal} onOpenChange={(open) => !open && closeShareModal()}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden" showCloseButton={true}>
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-lg font-semibold text-foreground">
            Share
          </DialogTitle>
          <DialogDescription className="sr-only">
            Share this sheet with others by inviting people or generating a link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 px-6 pb-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <InviteSection
            assetId={assetId}
            tableId={effectiveTableId}
            onInviteSuccess={refetchMembers}
          />

          <MembersSection
            members={members}
            loading={loading}
            onRoleChange={updateMemberRole}
          />

          <GeneralAccessSection
            enabled={generalAccessEnabled}
            onToggle={toggleGeneralAccess}
          />
        </div>

        {hasChanges && (
          <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-3">
            <span className="mr-auto text-xs text-muted-foreground">
              You have unsaved changes
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={saving}
              className="rounded-lg"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
