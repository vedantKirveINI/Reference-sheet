import React, { useEffect, useMemo, useState } from "react";
import { Bot, Zap, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import assetSDKServices from "../../../services/assetSDKServices";
import _ from "lodash";
import { AGENT_NODE_V3 } from "../constants";

const AgentCard = ({ agent, isSelected, onSelect }) => {
  const thumbnail = agent?.meta?.thumbnail;

  return (
    <button
      onClick={() => onSelect(agent)}
      className={cn(
        "w-full p-4 rounded-xl border-2 text-left transition-all",
        "hover:border-[#8F40FF] hover:bg-[#8F40FF]/5",
        isSelected
          ? "border-[#8F40FF] bg-[#8F40FF]/5"
          : "border-gray-200 bg-white"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden",
            isSelected ? "bg-[#3A0782]" : "bg-gray-100"
          )}
        >
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={agent?.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <Bot
            className={cn(
              "w-5 h-5",
              isSelected ? "text-white" : "text-gray-400",
              thumbnail ? "hidden" : ""
            )}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{agent?.name}</div>
          <div className="text-sm text-gray-500 truncate">
            {agent?.description || "No description"}
          </div>
        </div>
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-[#3A0782] flex items-center justify-center flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
    </button>
  );
};

const AgentsListLoader = () => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <div key={i} className="animate-pulse p-4 rounded-xl border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-3 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const NoAgentsPreview = () => (
  <div className="text-center py-8">
    <Bot className="w-12 h-12 text-gray-300 mx-auto mb-3" />
    <p className="text-gray-500 font-medium">No agents found</p>
    <p className="text-sm text-gray-400 mt-1">Create an agent to get started</p>
  </div>
);

const InitialiseTab = ({
  selectedAgent,
  onAgentChange,
  workspaceId,
  initialAssetId,
}) => {
  const [agents, setAgents] = useState([]);
  const [agentsToShow, setAgentsToShow] = useState([]);
  const [loading, setLoading] = useState(true);
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
        const agentList = res.result || [];
        setAgents(agentList);
        setAgentsToShow(agentList);

        const targetId = selectedAgent?._id || selectedAgent?.id || initialAssetId;
        if (targetId) {
          const found = agentList.find((item) => item?._id === targetId);
          if (found) {
            onAgentChange(found);
          }
        }
      } catch (error) {
        console.error("Failed to fetch agents:", error);
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
        const filtered = agents.filter((item) =>
          item?.name?.toLowerCase()?.includes(search?.toLowerCase())
        );
        setAgentsToShow(filtered);
      }, 200),
    [agents]
  );

  const onSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    handleSearch(value);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-[#8F40FF]/10 rounded-2xl flex items-center justify-center">
          <img src={AGENT_NODE_V3._src} alt="Agent" className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Select an Agent</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Choose a pre-configured agent to process messages and carry out conversations.
          </p>
        </div>
      </div>

      {selectedAgent && (
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h3 className="font-medium text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#8F40FF]" />
            What this agent does
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-[#8F40FF] mt-0.5">•</span>
              <span><strong>Process messages</strong> — Send messages to the agent for processing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8F40FF] mt-0.5">•</span>
              <span><strong>Carry conversations</strong> — Maintain context across a thread</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#8F40FF] mt-0.5">•</span>
              <span><strong>Use tools</strong> — Execute actions based on the conversation</span>
            </li>
          </ul>
        </div>
      )}

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search agents by name..."
            value={searchQuery}
            onChange={onSearchChange}
            className="pl-10"
          />
        </div>

        {loading ? (
          <AgentsListLoader />
        ) : agentsToShow.length === 0 ? (
          <NoAgentsPreview />
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {agentsToShow.map((agent) => (
              <AgentCard
                key={agent._id}
                agent={agent}
                isSelected={selectedAgent?._id === agent._id}
                onSelect={onAgentChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InitialiseTab;
