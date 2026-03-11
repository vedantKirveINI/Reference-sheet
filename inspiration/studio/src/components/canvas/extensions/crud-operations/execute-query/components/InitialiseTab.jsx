import React from "react";
import { Database, Check, Zap, Link, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectionManager } from "@/components/connection-manager/ConnectionManager";
import { useDatabaseConnectionAdapter } from "@/components/connection-manager/adapters/useDatabaseConnectionAdapter";
import { DATABASE_TYPES, DATABASE_CONFIGS } from "../../utils/databaseConfig";

const InitialiseTab = ({
  state,
  workspaceId,
  databaseType,
  projectId,
}) => {
  const {
    connection,
    onConnectionChange,
  } = state;

  const dbConfig = DATABASE_CONFIGS[databaseType] || DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL];
  const themeColor = dbConfig.colorTheme.dark;

  const adapter = useDatabaseConnectionAdapter({
    resourceIds: { workspaceId, projectId },
    databaseType,
    selectedConnection: connection,
    onConnectionChange: (conn, isNew) => {
      onConnectionChange(null, conn, isNew);
    },
  });

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div 
          className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${themeColor}15` }}
        >
          <Code className="w-8 h-8" style={{ color: themeColor }} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Execute Query</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Run custom SQL queries on your {dbConfig.name} database
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              connection ? "text-white" : "bg-gray-100 text-gray-600"
            )}
            style={connection ? { backgroundColor: themeColor } : {}}
          >
            {connection ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
          </div>
          <h3 className="font-medium text-gray-900">Database Connection</h3>
        </div>
        
        <ConnectionManager
          authType="database"
          integrationName={adapter.integrationName}
          integrationIcon={adapter.integrationIcon}
          selectedConnection={adapter.selectedConnection}
          onConnectionSelect={adapter.onSelect}
          connections={adapter.connections}
          onCreateDatabaseConnection={adapter.onCreateDatabaseConnection}
          onUpdateDatabaseConnection={adapter.onUpdateDatabaseConnection}
          onTestDatabaseConnection={adapter.onTestConnection}
          onDeleteConnection={adapter.onDelete}
        />
      </div>

      {connection && (
        <div 
          className="rounded-xl p-4 text-center border"
          style={{ 
            backgroundColor: `${themeColor}10`,
            borderColor: `${themeColor}20`
          }}
        >
          <p className="text-sm font-medium" style={{ color: themeColor }}>
            Connection selected. Click Continue to write your SQL query.
          </p>
        </div>
      )}

      {!connection && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: themeColor }} />
            When to use Execute Query
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span style={{ color: themeColor }} className="mt-0.5">•</span>
              <span><strong>Complex queries</strong> — Write JOINs, subqueries, and advanced SQL</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: themeColor }} className="mt-0.5">•</span>
              <span><strong>Aggregations</strong> — Run COUNT, SUM, AVG, and GROUP BY queries</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: themeColor }} className="mt-0.5">•</span>
              <span><strong>Full control</strong> — Execute any valid SQL statement on your database</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default InitialiseTab;
