import React from "react";
import { Badge } from "@/components/ui/badge";
import { TerminalView } from "@/components/studio/TerminalView";
import { CodeEditor } from "@/components/studio/CodeEditor";
import { cn } from "@/lib/utils";
import { Clock, CheckCircle2, XCircle } from "lucide-react";

const getStatusColor = (status) => {
  if (!status) return "bg-gray-100 text-gray-600";
  if (status >= 200 && status < 300) return "bg-green-100 text-green-700";
  if (status >= 300 && status < 400) return "bg-yellow-100 text-yellow-700";
  if (status >= 400 && status < 500) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
};

const getStatusIcon = (status) => {
  if (!status) return null;
  if (status >= 200 && status < 300) return <CheckCircle2 className="w-4 h-4" />;
  return <XCircle className="w-4 h-4" />;
};

export function OutputTab({ response, logs = [] }) {
  const hasResponse = response && response.status;

  return (
    <div className="space-y-6">
      {hasResponse && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium",
                getStatusColor(response.status)
              )}
            >
              {getStatusIcon(response.status)}
              {response.status}
            </Badge>
            {response.time && (
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>{response.time}ms</span>
              </div>
            )}
          </div>

          {response.headers && Object.keys(response.headers).length > 0 && (
            <div className="space-y-2">
              <h4
                className="text-sm font-medium text-gray-700"
                style={{ fontFamily: "Archivo, sans-serif" }}
              >
                Response Headers
              </h4>
              <div className="bg-gray-50 rounded-xl p-3 space-y-1">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-xs font-mono">
                    <span className="text-gray-500">{key}:</span>
                    <span className="text-gray-700">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4
              className="text-sm font-medium text-gray-700"
              style={{ fontFamily: "Archivo, sans-serif" }}
            >
              Response Body
            </h4>
            <CodeEditor
              value={
                typeof response.body === "string"
                  ? response.body
                  : JSON.stringify(response.body, null, 2)
              }
              language="json"
              readOnly={true}
              maxHeight={250}
              showFormatButton={true}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h4
          className="text-sm font-medium text-gray-700"
          style={{ fontFamily: "Archivo, sans-serif" }}
        >
          Request Logs
        </h4>
        <TerminalView
          logs={logs}
          title="Execution Logs"
          maxHeight={200}
          showSearch={false}
          showClear={false}
        />
      </div>

      {!hasResponse && logs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p
            className="text-gray-500 font-medium"
            style={{ fontFamily: "Archivo, sans-serif" }}
          >
            No response yet
          </p>
          <p className="text-sm text-gray-400 max-w-xs mt-1">
            Send a test request to see the response here
          </p>
        </div>
      )}
    </div>
  );
}

export default OutputTab;
