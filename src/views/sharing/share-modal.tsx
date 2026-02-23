import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Share2, Copy, Link, X, Check, Search, Globe, Lock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModalControlStore } from "@/stores";
import {
  getShareMembers,
  inviteShareMember,
  updateShareMemberRole,
  removeShareMember,
  updateGeneralAccess as updateGeneralAccessAPI,
} from "@/services/api";

type PermissionLevel = "view" | "edit" | "full";
type GeneralAccessLevel = "restricted" | "anyone_view" | "anyone_edit";

interface Collaborator {
  id?: string;
  email: string;
  name?: string;
  permission: PermissionLevel;
}

interface ShareModalProps {
  baseId?: string;
  tableId?: string;
}

const permissionLabels: Record<PermissionLevel, string> = {
  view: "View only",
  edit: "Can edit",
  full: "Full access",
};

const generalAccessLabels: Record<GeneralAccessLevel, { label: string; description: string }> = {
  restricted: { label: "Restricted", description: "Only people with access can open" },
  anyone_view: { label: "Anyone with link", description: "Anyone with the link can view" },
  anyone_edit: { label: "Anyone with link", description: "Anyone with the link can edit" },
};

export function ShareModal({ baseId, tableId }: ShareModalProps) {
  const { t } = useTranslation();
  const { shareModal, closeShareModal } = useModalControlStore();
  const [linkPermission, setLinkPermission] = useState<PermissionLevel>("view");
  const [emailInput, setEmailInput] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [generalAccess, setGeneralAccess] = useState<GeneralAccessLevel>("restricted");
  const [inviting, setInviting] = useState(false);

  const effectiveTableId = tableId || "tbl_abc123";
  const shareLink = `https://sheets.app/s/${effectiveTableId}`;

  useEffect(() => {
    if (shareModal && baseId) {
      setLoading(true);
      getShareMembers({ baseId })
        .then((res) => {
          const members = res.data?.members || res.data || [];
          if (Array.isArray(members)) {
            setCollaborators(
              members.map((m: any) => ({
                id: m.id || m.userId,
                email: m.email,
                name: m.name,
                permission: m.role || m.permission || "view",
              }))
            );
          }
          if (res.data?.generalAccess) {
            setGeneralAccess(res.data.generalAccess);
          }
        })
        .catch(() => {
          setCollaborators([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [shareModal, baseId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddEmail = async () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    if (collaborators.some((c) => c.email === trimmed)) return;

    const newCollab: Collaborator = { email: trimmed, permission: linkPermission };

    if (baseId) {
      setInviting(true);
      try {
        const res = await inviteShareMember({ baseId, email: trimmed, role: linkPermission });
        if (res.data?.id || res.data?.userId) {
          newCollab.id = res.data.id || res.data.userId;
        }
      } catch {
      }
      setInviting(false);
    }

    setCollaborators((prev) => [...prev, newCollab]);
    setEmailInput("");
  };

  const handleRemoveCollaborator = async (collab: Collaborator) => {
    setCollaborators((prev) => prev.filter((c) => c.email !== collab.email));

    if (baseId && collab.id) {
      try {
        await removeShareMember({ baseId, userId: collab.id });
      } catch {
      }
    }
  };

  const handlePermissionChange = async (collab: Collaborator, permission: PermissionLevel) => {
    setCollaborators((prev) =>
      prev.map((c) => (c.email === collab.email ? { ...c, permission } : c))
    );

    if (baseId && collab.id) {
      try {
        await updateShareMemberRole({ baseId, userId: collab.id, role: permission });
      } catch {
      }
    }
  };

  const handleGeneralAccessChange = async (access: GeneralAccessLevel) => {
    setGeneralAccess(access);

    if (baseId) {
      try {
        await updateGeneralAccessAPI({ baseId, access });
      } catch {
      }
    }
  };

  const filteredCollaborators = useMemo(() => {
    if (!searchQuery.trim()) return collaborators;
    const q = searchQuery.toLowerCase();
    return collaborators.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        (c.name && c.name.toLowerCase().includes(q))
    );
  }, [collaborators, searchQuery]);

  const generalAccessIcon = generalAccess === "restricted" ? Lock : Globe;
  const GeneralAccessIcon = generalAccessIcon;

  return (
    <Dialog open={shareModal} onOpenChange={(open) => !open && closeShareModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {t('share')}
          </DialogTitle>
          <DialogDescription>
            {t('sharing.shareLink')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('auth.email')}</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder={t('auth.email')}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <select
                value={linkPermission}
                onChange={(e) => setLinkPermission(e.target.value as PermissionLevel)}
                className="rounded-md border bg-background px-2 py-2 text-xs outline-none"
              >
                <option value="view">{t('sharing.viewer')}</option>
                <option value="edit">{t('sharing.editor')}</option>
                <option value="full">{t('sharing.fullAccess')}</option>
              </select>
              <Button size="sm" onClick={handleAddEmail} disabled={inviting} className="shrink-0">
                {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : t('add')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {t('sharing.generalAccess')}
            </label>

            {collaborators.length > 3 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border bg-background pl-8 pr-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">{t('loading')}</span>
              </div>
            ) : filteredCollaborators.length > 0 ? (
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                {filteredCollaborators.map((collab) => (
                  <div
                    key={collab.email}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {collab.email[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        {collab.name && (
                          <div className="truncate text-sm font-medium">{collab.name}</div>
                        )}
                        <div className="truncate text-sm text-muted-foreground">{collab.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <select
                        value={collab.permission}
                        onChange={(e) =>
                          handlePermissionChange(collab, e.target.value as PermissionLevel)
                        }
                        className="rounded border bg-background px-1.5 py-0.5 text-xs outline-none"
                      >
                        <option value="view">{t('sharing.viewer')}</option>
                        <option value="edit">{t('sharing.editor')}</option>
                        <option value="full">{t('sharing.fullAccess')}</option>
                      </select>
                      <button
                        onClick={() => handleRemoveCollaborator(collab)}
                        className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                {searchQuery ? "No collaborators match your search." : "No collaborators added yet."}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('sharing.generalAccess')}</label>
            <div className="rounded-md border p-3 space-y-2">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                  <GeneralAccessIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <select
                    value={generalAccess}
                    onChange={(e) => handleGeneralAccessChange(e.target.value as GeneralAccessLevel)}
                    className="w-full rounded border bg-background px-2 py-1 text-sm outline-none"
                  >
                    <option value="restricted">{t('sharing.restricted')}</option>
                    <option value="anyone_view">{t('sharing.anyoneView')}</option>
                    <option value="anyone_edit">{t('sharing.anyoneEdit')}</option>
                  </select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {generalAccessLabels[generalAccess].description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t('sharing.shareLink')}</label>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-md border bg-muted px-3 py-2">
                <Link className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm text-muted-foreground">{shareLink}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 shrink-0">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? t('sharing.linkCopied') : t('sharing.copyLink')}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
