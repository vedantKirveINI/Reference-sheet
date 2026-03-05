import React, { useCallback, useState } from "react";
import { Database, Table, Check, Zap, Link, List, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import DatabaseTableSelector from "../../common-components/DatabaseTableSelector";
import { ConnectionManager } from "@/components/connection-manager/ConnectionManager";
import { useDatabaseConnectionAdapter } from "@/components/connection-manager/adapters/useDatabaseConnectionAdapter";
import { DATABASE_TYPES, DATABASE_CONFIGS } from "../../utils/databaseConfig";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";

const InitialiseTab = ({
  state,
  workspaceId,
  databaseType,
  projectId,
}) => {
  const {
    connection,
    schemas,
    table,
    onConnectionChange,
    onSchemaChange,
    refreshConnection,
    isRefreshingConnection,
  } = state;

  const dbConfig = DATABASE_CONFIGS[databaseType] || DATABASE_CONFIGS[DATABASE_TYPES.POSTGRESQL];
  const themeColor = dbConfig.colorTheme.dark;

  const [connectionManagerView, setConnectionManagerView] = useState(null);

  const adapter = useDatabaseConnectionAdapter({
    resourceIds: { workspaceId, projectId },
    databaseType,
    selectedConnection: connection,
    onConnectionChange: (conn, isNew) => {
      onConnectionChange(null, conn, isNew);
    },
  });

  const isMakingConnection = connectionManagerView === "add-new" || connectionManagerView === "edit";

  const handleTableSelect = useCallback(
    (_, schema) => {
      onSchemaChange(_, schema);
    },
    [onSchemaChange]
  );

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div
          className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${themeColor}15` }}
        >
          <List className="w-8 h-8" style={{ color: themeColor }} />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Find All Records</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Query multiple rows from your {dbConfig.name} database
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
          onViewChange={setConnectionManagerView}
          databaseType={databaseType}
        />
      </div>

      {!isMakingConnection && (
        <div className="border-t border-gray-200 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                table ? "text-white" : "bg-gray-100 text-gray-600"
              )}
              style={table ? { backgroundColor: themeColor } : {}}
            >
              {table ? <Check className="w-4 h-4" /> : <Table className="w-4 h-4" />}
            </div>
            <h3 className="font-medium text-gray-900">Select Table</h3>
          </div>

          {connection ? (
            <div className="flex items-center gap-2">
              <DatabaseTableSelector
                tables={schemas}
                value={table}
                onChange={handleTableSelect}
                disabled={!connection}
                themeColor={themeColor}
                placeholder="Select a table..."
              />
              {table && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={async () => {
                    const result = await refreshConnection(databaseType);
                    if (result.success) {
                      toast.success(result.message || "Connection refreshed successfully!");
                    } else {
                      toast.error(result.message || "Failed to refresh connection");
                    }
                  }}
                  disabled={!connection || isRefreshingConnection}
                  className="h-10 w-10 shrink-0"
                  title="Refresh connection"
                >
                  {isRefreshingConnection ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <icons.refreshCw className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <Link className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Connect to a database first</p>
              <p className="text-sm text-gray-400 mt-1">Select a connection above to view available tables</p>
            </div>
          )}
        </div>
      )}

      {connection && table && (
        <div
          className="rounded-xl p-4 text-center border"
          style={{
            backgroundColor: `${themeColor}10`,
            borderColor: `${themeColor}20`
          }}
        >
          <p className="text-sm font-medium" style={{ color: themeColor }}>
            Connection and table selected. Click Continue to configure filters and sorting.
          </p>
        </div>
      )}

      {connection && !table && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: themeColor }} />
            When to use Find All Records
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span style={{ color: themeColor }} className="mt-0.5">•</span>
              <span><strong>List filtered data</strong> — Get records matching specific criteria</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: themeColor }} className="mt-0.5">•</span>
              <span><strong>Generate reports</strong> — Pull data for dashboards or exports</span>
            </li>
            <li className="flex items-start gap-2">
              <span style={{ color: themeColor }} className="mt-0.5">•</span>
              <span><strong>Batch processing</strong> — Iterate over multiple records in your workflow</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default InitialiseTab;
