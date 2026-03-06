import { useState } from "react";
import { Crown, Loader2, Users, ChevronRight } from "lucide-react";
import type { MemberInfo } from "../../hooks/useShareModal";
import { Avatar, MiniAvatar } from "../../share-modal"; // re-use local helpers
import { HoverRoleDropdown } from "../hover-role-dropdown";

interface MembersSectionProps {
  members: MemberInfo[];
  loading: boolean;
  hasMemberChanges: boolean;
  onRoleChange: (userId: string, role: string) => void;
}

export function MembersSection({
  members,
  loading,
  hasMemberChanges,
  onRoleChange,
}: MembersSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const memberCount = members.length;
  const isExpanded = expanded;

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-5 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`transition-transform duration-200 ${
              isExpanded ? "rotate-90" : ""
            }`}
          >
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            People with access
          </span>
        </div>

        {!isExpanded && (
          <div className="flex items-center gap-2.5">
            {memberCount > 0 ? (
              <>
                <div className="flex -space-x-2">
                  {members.slice(0, 4).map((m) => (
                    <MiniAvatar
                      key={m.userId || m.email}
                      name={m.name}
                      email={m.email}
                    />
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
                {hasMemberChanges && (
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-400 ml-1" />
                )}
              </>
            ) : (
              <span className="text-xs text-muted-foreground">No one yet</span>
            )}
          </div>
        )}
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-100 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">
                Loading...
              </span>
            </div>
          ) : memberCount > 0 ? (
            <div className="max-h-60 overflow-y-auto space-y-0.5">
              {members.map((member) => (
                <div
                  key={member.userId || member.email}
                  className="group/member grid grid-cols-[1fr_auto] items-center gap-3 rounded-lg px-3 py-2 transition-all min-w-0 hover:bg-muted/40"
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
                        <div className="truncate text-xs text-muted-foreground">
                          {member.email}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 min-w-22 flex justify-end">
                    {member.isOwner ? (
                      <span className="text-xs text-muted-foreground px-2 py-1">
                        Owner
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {member.isModified && (
                          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-400" />
                        )}
                        <HoverRoleDropdown
                          value={member.role}
                          onChange={(role) =>
                            onRoleChange(
                              member.userId || member.email || "",
                              role
                            )
                          }
                        />
                      </div>
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

