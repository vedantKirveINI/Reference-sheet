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
  const [savingMembers, setSavingMembers] = useState(false);
  const [savingGeneralAccess, setSavingGeneralAccess] = useState(false);

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
        const mapped: MemberInfo[] = list.map((m: any) => {
          const rawUserId = m.user_id ?? m.userId ?? m.id ?? "";
          const rawEmail = m.email_id ?? m.email ?? "";
          return {
            userId: String(rawUserId).trim(),
            name: m.name || "",
            email: String(rawEmail).trim(),
            role: (m.role || "viewer").toLowerCase(),
            bgColor: m.bg_color || m.bgColor || "",
            isOwner: (m.role || "").toLowerCase() === "owner",
            isModified: false,
          };
        });
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

  const updateMemberRole = useCallback((memberId: string, newRole: string) => {
    const normalizedNewRole = newRole.toLowerCase();
    const id = String(memberId ?? "").trim();
    if (!id) return;
    setMembers((prev) =>
      prev.map((m) => {
        if (m.isOwner) return m;
        const matchById = m.userId === id || m.email === id;
        if (!matchById) return m;
        const original = originalMembersRef.current.find((o) => o.userId === id || o.email === id);
        const originalRole = (original?.role ?? "").toLowerCase();
        const isModified = originalRole !== normalizedNewRole;
        return { ...m, role: normalizedNewRole, isModified };
      })
    );
  }, []);

  const toggleGeneralAccess = useCallback((enabled: boolean) => {
    setGeneralAccessEnabled(enabled);
  }, []);

  const hasMemberChanges = members.some((m) => m.isModified);
  const hasGeneralAccessChanges = generalAccessEnabled !== originalGeneralAccessRef.current;
  const hasChanges = hasMemberChanges || hasGeneralAccessChanges;

  const handleSaveMembers = useCallback(async () => {
    if (!assetId) return;
    setSavingMembers(true);
    try {
      const modifiedInvitees = members
        .filter((m) => m.isModified && !m.isOwner)
        .map((m) => {
          if (m.role === "remove access") {
            return { email_id: m.email, remove: true };
          }
          return { email_id: m.email, role: m.role.toUpperCase() };
        });

      const originalGA = originalGeneralAccessRef.current;
      await shareAsset({
        asset_ids: [assetId],
        general_role: originalGA ? "VIEWER" : "NONE",
        invitees: modifiedInvitees,
      });

      await fetchData();
      toast.success("Member roles updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSavingMembers(false);
    }
  }, [assetId, members, generalAccessEnabled, fetchData]);

  const handleSaveGeneralAccess = useCallback(async () => {
    if (!assetId) return;
    setSavingGeneralAccess(true);
    try {
      await shareAsset({
        asset_ids: [assetId],
        general_role: generalAccessEnabled ? "VIEWER" : "NONE",
        invitees: [],
      });

      await fetchData();
      toast.success("Access updated");
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSavingGeneralAccess(false);
    }
  }, [assetId, generalAccessEnabled, fetchData]);

  const handleCancelMembers = useCallback(() => {
    setMembers(originalMembersRef.current.map((m) => ({ ...m })));
  }, []);

  const handleCancelGeneralAccess = useCallback(() => {
    setGeneralAccessEnabled(originalGeneralAccessRef.current);
  }, []);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!assetId) return false;
    setSavingMembers(true);
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
      return true;
    } catch {
      toast.error("Failed to save changes");
      return false;
    } finally {
      setSavingMembers(false);
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
    savingMembers,
    savingGeneralAccess,
    saving: savingMembers || savingGeneralAccess,
    hasChanges,
    hasMemberChanges,
    hasGeneralAccessChanges,
    updateMemberRole,
    toggleGeneralAccess,
    handleSave,
    handleCancel,
    handleSaveMembers,
    handleSaveGeneralAccess,
    handleCancelMembers,
    handleCancelGeneralAccess,
    refetchMembers: fetchData,
  };
}
