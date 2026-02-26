import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import debounce from "lodash/debounce";
import { searchUsers, inviteShareMembers } from "@/services/api";

export interface SearchResult {
  _id: string;
  name: string;
  email_id: string;
  meta?: any;
}

export interface SelectedUser {
  _id: string;
  name: string;
  email: string;
}

interface UseSearchInviteOptions {
  assetId: string;
  tableId: string;
  onInviteSuccess: () => void;
}

export function useSearchInvite({ assetId, tableId, onInviteSuccess }: UseSearchInviteOptions) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [inviteRole, setInviteRole] = useState("VIEWER");
  const [inviting, setInviting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const debouncedSearchRef = useRef(
    debounce(async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setShowDropdown(false);
        return;
      }
      setSearching(true);
      try {
        const res = await searchUsers({ q, page: 1, limit: 10 });
        const data = res.data;
        const docs = data?.result?.docs || data?.docs || data?.result || [];
        setResults(Array.isArray(docs) ? docs : []);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300)
  );

  useEffect(() => {
    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, []);

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    debouncedSearchRef.current(value);
  }, []);

  const selectUser = useCallback((user: SearchResult) => {
    setSelectedUsers((prev) => {
      if (prev.some((u) => u._id === user._id)) return prev;
      return [...prev, { _id: user._id, name: user.name, email: user.email_id }];
    });
    setQuery("");
    setResults([]);
    setShowDropdown(false);
  }, []);

  const removeUser = useCallback((userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u._id !== userId));
  }, []);

  const handleInvite = useCallback(async () => {
    if (selectedUsers.length === 0 || !assetId) return;
    setInviting(true);
    try {
      await inviteShareMembers({
        workspace_id: "",
        table_id: tableId || "",
        notify: true,
        asset_ids: [assetId],
        invitees: selectedUsers.map((u) => ({
          email_id: u.email,
          role: inviteRole.toUpperCase(),
        })),
      });
      setSelectedUsers([]);
      setQuery("");
      setResults([]);
      onInviteSuccess();
      toast.success("Invitations sent successfully");
    } catch {
      toast.error("Failed to send invitations. Please try again.");
    } finally {
      setInviting(false);
    }
  }, [selectedUsers, assetId, tableId, inviteRole, onInviteSuccess]);

  return {
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
  };
}
