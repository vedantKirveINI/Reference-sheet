import React from "react";
import { Database, Server, Globe, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ConnectionCard = ({ data, label, accentColor = "#3b82f6" }) => {
  const { fields } = data;
  const { host, port, database, username } = fields || {};
  
  const hostWithPort = port ? `${host}:${port}` : host;
  
  if (!host && !database) {
    return (
      <div className="rounded-xl bg-background border border-border/50 shadow-sm p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Database className="w-4 h-4" />
          <span className="text-sm italic">No connection data available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-background border border-border/50 shadow-sm overflow-hidden">
      {label && (
        <div 
          className="px-4 py-2.5 border-b border-border/30 flex items-center gap-2"
          style={{ backgroundColor: `${accentColor}08` }}
        >
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <Database 
              className="w-4 h-4" 
              style={{ color: accentColor }} 
            />
          </div>
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
      )}
      
      <div className="p-4 space-y-3">
        {hostWithPort && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <Server className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Host</p>
              <p className="text-sm font-mono text-foreground truncate">{hostWithPort}</p>
            </div>
          </div>
        )}
        
        {database && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <Database className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Database</p>
              <p className="text-sm font-mono text-foreground truncate">{database}</p>
            </div>
          </div>
        )}
        
        {username && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Username</p>
              <p className="text-sm font-mono text-foreground truncate">{username}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionCard;
