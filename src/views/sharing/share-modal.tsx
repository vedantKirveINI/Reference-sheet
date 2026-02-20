import { useState } from "react";
import { Share2, Copy, Link, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useModalControlStore } from "@/stores";

type PermissionLevel = "view" | "edit" | "full";

interface Collaborator {
  email: string;
  permission: PermissionLevel;
}

const permissionLabels: Record<PermissionLevel, string> = {
  view: "View only",
  edit: "Can edit",
  full: "Full access",
};

export function ShareModal() {
  const { shareModal, closeShareModal } = useModalControlStore();
  const [linkPermission, setLinkPermission] = useState<PermissionLevel>("view");
  const [emailInput, setEmailInput] = useState("");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([
    { email: "alice@example.com", permission: "edit" },
    { email: "bob@example.com", permission: "view" },
  ]);
  const [copied, setCopied] = useState(false);

  const tableId = "tbl_abc123";
  const shareLink = `https://sheets.app/s/${tableId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddEmail = () => {
    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes("@")) return;
    if (collaborators.some((c) => c.email === trimmed)) return;
    setCollaborators((prev) => [...prev, { email: trimmed, permission: linkPermission }]);
    setEmailInput("");
  };

  const handleRemoveCollaborator = (email: string) => {
    setCollaborators((prev) => prev.filter((c) => c.email !== email));
  };

  const handlePermissionChange = (email: string, permission: PermissionLevel) => {
    setCollaborators((prev) =>
      prev.map((c) => (c.email === email ? { ...c, permission } : c))
    );
  };

  return (
    <Dialog open={shareModal} onOpenChange={(open) => !open && closeShareModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share this sheet
          </DialogTitle>
          <DialogDescription>
            Share a link or invite collaborators by email.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Share link</label>
            <div className="flex items-center gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-md border bg-muted px-3 py-2">
                <Link className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm text-muted-foreground">{shareLink}</span>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyLink} className="gap-1.5 shrink-0">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Link permission</label>
            <div className="flex gap-1">
              {(["view", "edit", "full"] as PermissionLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setLinkPermission(level)}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    linkPermission === level
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {permissionLabels[level]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Invite by email</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddEmail()}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
              />
              <Button size="sm" onClick={handleAddEmail}>
                Add
              </Button>
            </div>
          </div>

          {collaborators.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Collaborators ({collaborators.length})
              </label>
              <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-2">
                {collaborators.map((collab) => (
                  <div
                    key={collab.email}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-muted"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {collab.email[0].toUpperCase()}
                      </div>
                      <span className="truncate text-sm">{collab.email}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <select
                        value={collab.permission}
                        onChange={(e) =>
                          handlePermissionChange(collab.email, e.target.value as PermissionLevel)
                        }
                        className="rounded border bg-background px-1.5 py-0.5 text-xs outline-none"
                      >
                        <option value="view">View only</option>
                        <option value="edit">Can edit</option>
                        <option value="full">Full access</option>
                      </select>
                      <button
                        onClick={() => handleRemoveCollaborator(collab.email)}
                        className="rounded p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
