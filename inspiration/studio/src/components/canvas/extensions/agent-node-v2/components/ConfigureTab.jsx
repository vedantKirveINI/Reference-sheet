import React, { useEffect, useState, useMemo } from "react";
import { Bot, Search, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar, ODSTextField as TextField, ODSIcon } from "@src/module/ods";
import assetSDKServices from "../../../services/assetSDKServices";
import _ from "lodash";

const ConfigureTab = ({ state, variables, workspaceId }) => {
  const { 
    selectedAgent, 
    setSelectedAgent, 
    inputMapping, 
    setInputMapping, 
    agentConfig,
    setAgentConfig,
    validation 
  } = state;

  const [agents, setAgents] = useState([]);
  const [agentsToShow, setAgentsToShow] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const query = {
          workspace_id: workspaceId,
          annotation: "AGENT",
          sort_by: "edited_at",
          sort_type: "desc",
        };

        const res = await assetSDKServices.getFlatList(query);
        const filteredAgents = res.result || [];
        setAgents(filteredAgents);
        setAgentsToShow(filteredAgents);
      } catch {
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (workspaceId) {
      fetchAgents();
    }
  }, [workspaceId]);

  const handleSearch = useMemo(
    () =>
      _.debounce((search) => {
        const filteredAgents = agents.filter((item) => {
          return item?.name?.toLowerCase()?.includes(search?.toLowerCase());
        });
        setAgentsToShow(filteredAgents);
      }, 200),
    [agents]
  );

  const handleAgentSelect = (agent) => {
    setSelectedAgent(agent);
    setIsDropdownOpen(false);
    setSearchQuery("");
    setAgentsToShow(agents);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Select Agent<span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-500">
          Choose an agent from your available agents to orchestrate this workflow step.
        </p>
        
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={cn(
              "w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between",
              "hover:border-[#8B5CF6]",
              isDropdownOpen ? "border-[#8B5CF6]" : "border-gray-200",
              selectedAgent ? "bg-[#8B5CF6]/5" : "bg-white"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center",
                selectedAgent ? "bg-[#8B5CF6] text-white" : "bg-gray-100 text-gray-400"
              )}>
                <Bot className="w-4 h-4" />
              </div>
              <span className={cn(
                "font-medium",
                selectedAgent ? "text-gray-900" : "text-gray-400"
              )}>
                {selectedAgent?.name || "Select an agent..."}
              </span>
            </div>
            <ChevronDown className={cn(
              "w-5 h-5 text-gray-400 transition-transform",
              isDropdownOpen && "rotate-180"
            )} />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-hidden">
              <div className="p-2 border-b border-gray-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search agents..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      handleSearch(e.target.value);
                    }}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#8B5CF6]"
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center text-gray-500 text-sm">Loading agents...</div>
                ) : agentsToShow.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No agents found</div>
                ) : (
                  agentsToShow.map((agent) => (
                    <button
                      key={agent._id}
                      onClick={() => handleAgentSelect(agent)}
                      className={cn(
                        "w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between",
                        selectedAgent?._id === agent._id && "bg-[#8B5CF6]/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-[#8B5CF6]" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{agent.name}</div>
                          {agent.description && (
                            <div className="text-xs text-gray-500 truncate max-w-[200px]">{agent.description}</div>
                          )}
                        </div>
                      </div>
                      {selectedAgent?._id === agent._id && (
                        <Check className="w-4 h-4 text-[#8B5CF6]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Input Mapping<span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-gray-500">
          Map input data to be passed to the agent. Use variables from previous steps.
        </p>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Enter input for the agent, e.g., {{customer.query}} or 'Process this request'"
          defaultInputContent={inputMapping?.blocks || []}
          onInputContentChanged={(blocks) => setInputMapping({ type: "fx", blocks })}
          slotProps={{
            container: {
              className: cn(
                "min-h-[120px] rounded-xl border border-gray-300 bg-white",
                !validation.isValid && validation.errors.includes("Input mapping is required") && "border-red-400"
              ),
            },
          }}
        />
        <p className="text-sm text-gray-400">
          Use {"{{data}}"} to insert values from previous steps in your workflow
        </p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-900">
          Agent Configuration
        </Label>
        <p className="text-sm text-gray-500">
          Additional configuration options for the agent execution.
        </p>
        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 text-sm">Enable verbose logging</div>
              <div className="text-xs text-gray-500">Log detailed execution steps</div>
            </div>
            <button
              onClick={() => setAgentConfig(prev => ({ ...prev, verbose: !prev.verbose }))}
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                agentConfig.verbose ? "bg-[#8B5CF6]" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
                agentConfig.verbose ? "translate-x-5" : "translate-x-1"
              )} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900 text-sm">Auto-retry on failure</div>
              <div className="text-xs text-gray-500">Automatically retry failed agent executions</div>
            </div>
            <button
              onClick={() => setAgentConfig(prev => ({ ...prev, autoRetry: !prev.autoRetry }))}
              className={cn(
                "w-10 h-6 rounded-full transition-colors relative",
                agentConfig.autoRetry ? "bg-[#8B5CF6]" : "bg-gray-300"
              )}
            >
              <div className={cn(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
                agentConfig.autoRetry ? "translate-x-5" : "translate-x-1"
              )} />
            </button>
          </div>
        </div>
      </div>

      {selectedAgent && (
        <div className="bg-[#8B5CF6]/5 rounded-xl p-4 border border-[#8B5CF6]/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#8B5CF6] flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{selectedAgent.name}</div>
              <div className="text-sm text-gray-500 mt-1">
                {selectedAgent.description || "No description available"}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigureTab;
