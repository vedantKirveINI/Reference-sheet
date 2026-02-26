import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  getShareMembers,
  findOneAsset,
  shareAsset,
} from "@/services/api";

export interface MemberInfo {
  userId: string;
  name: string;
  email: string;
  role: string;
  bgColor?: string;
  isOwner: boolean;
  isModified: boolean;
}

interface UseShareModalOptions {
  isOpen: boolean;
  assetId: string;
}

export function useShareModal({ isOpen, assetId }: UseShareModalOptions) {
  const [members, setMembers] = useState<MemberInfo[]>([]);
  const [generalAccessEnabled, setGeneralAccessEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const originalMembersRef = useRef<MemberInfo[]>([]);
  const originalGeneralAccessRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!assetId) return;
    setLoading(true);
    try {
      const [membersRes, assetRes] = await Promise.allSettled([
        getShareMembers({ baseId: assetId }),
        findOneAsset({ assetId }),
      ]);

      if (membersRes.status === "fulfilled") {
        const raw = membersRes.value.data;
        const list = Array.isArray(raw) ? raw : raw?.result || raw?.members || [];
        const mapped: MemberInfo[] = list.map((m: any) => ({
          userId: m.user_id || m.userId || m.id || "",
          name: m.name || "",
          email: m.email_id || m.email || "",
          role: (m.role || "viewer").toLowerCase(),
          bgColor: m.bg_color || m.bgColor || "",
          isOwner: (m.role || "").toLowerCase() === "owner",
          isModified: false,
        }));
        setMembers(mapped);
        originalMembersRef.current = mapped.map((m) => ({ ...m }));
      }

      if (assetRes.status === "fulfilled") {
        const data = assetRes.value.data;
        const generalRole = data?.result?.general_role || data?.general_role || "NONE";
        const enabled = generalRole === "VIEWER" || generalRole === "EDITOR";
        setGeneralAccessEnabled(enabled);
        originalGeneralAccessRef.current = enabled;
      }
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [assetId]);

  useEffect(() => {
    if (isOpen && assetId) {
      fetchData();
    }
    if (!isOpen) {
      setMembers([]);
      originalMembersRef.current = [];
      setGeneralAccessEnabled(false);
      originalGeneralAccessRef.current = false;
    }
  }, [isOpen, assetId, fetchData]);

  const updateMemberRole = useCallback((userId: string, newRole: string) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.userId !== userId || m.isOwner) return m;
        const original = originalMembersRef.current.find((o) => o.userId === userId);
        const isModified = original ? original.role !== newRole : true;
        return { ...m, role: newRole, isModified };
      })
    );
  }, []);

  const toggleGeneralAccess = useCallback((enabled: boolean) => {
    setGeneralAccessEnabled(enabled);
  }, []);

  const hasChanges =
    generalAccessEnabled !== originalGeneralAccessRef.current ||
    members.some((m) => m.isModified);

  const handleSave = useCallback(async () => {
    if (!assetId) return;
    setSaving(true);
    try {
      const modifiedInvitees = members
        .filter((m) => m.isModified && !m.isOwner)
        .map((m) => {
          if (m.role === "remove access") {
            return { email_id: m.email, remove: true };
          }
          return { email_id: m.email, role: m.role.toUpperCase() };
        });

      await shareAsset({
        asset_ids: [assetId],
        general_role: generalAccessEnabled ? "VIEWER" : "NONE",
        invitees: modifiedInvitees,
      });

      await fetchData();
      toast.success("Changes saved successfully");
    } catch {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [assetId, members, generalAccessEnabled, fetchData]);

  const handleCancel = useCallback(() => {
    setMembers(originalMembersRef.current.map((m) => ({ ...m })));
    setGeneralAccessEnabled(originalGeneralAccessRef.current);
  }, []);

  return {
    members,
    generalAccessEnabled,
    loading,
    saving,
    hasChanges,
    updateMemberRole,
    toggleGeneralAccess,
    handleSave,
    handleCancel,
    refetchMembers: fetchData,
  };
}
