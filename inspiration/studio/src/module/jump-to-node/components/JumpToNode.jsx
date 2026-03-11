import React, { useState, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { CornerDownRight } from "lucide-react";

const JumpToNode = ({ value, nodes = [], onChange = () => {} }) => {
  const [selectedNodeId, setSelectedNodeId] = useState(value);

  useEffect(() => {
    setSelectedNodeId(value);
  }, [value]);

  const nodeOptions = useMemo(() => {
    return (nodes || []).filter((node) => node.name);
  }, [nodes]);

  const handleChange = (e) => {
    const nodeId = e.target.value;
    setSelectedNodeId(nodeId);
    const selectedNode = nodeOptions.find(
      (n) => (n.key || n.id) === nodeId
    );
    if (selectedNode) {
      onChange(e, selectedNode);
    }
  };

  return (
    <div
      className="flex flex-col gap-5 p-5"
      style={{ fontFamily: "Archivo, sans-serif" }}
      data-testid="jump-to-node-container"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center">
          <CornerDownRight className="w-4 h-4 text-violet-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">Jump to Node</p>
          <p className="text-xs text-gray-500">
            Redirects the flow to a previously created node in your workflow.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">
          Select Node
        </label>
        <select
          value={selectedNodeId || ""}
          onChange={handleChange}
          className={cn(
            "w-full h-10 px-3 rounded-lg border border-gray-300 bg-white",
            "text-sm text-gray-900",
            "focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent",
            "appearance-none cursor-pointer"
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
          }}
          data-testid="jump-to-node-dropdown"
        >
          <option value="" disabled>
            Choose a node...
          </option>
          {nodeOptions.map((node, index) => (
            <option key={node.key || node.id || index} value={node.key || node.id}>
              {node.description || node.name}
            </option>
          ))}
        </select>
        {nodeOptions.length === 0 && (
          <p className="text-xs text-gray-400">
            No nodes available. Add nodes to your flow first.
          </p>
        )}
      </div>
    </div>
  );
};

export default JumpToNode;
