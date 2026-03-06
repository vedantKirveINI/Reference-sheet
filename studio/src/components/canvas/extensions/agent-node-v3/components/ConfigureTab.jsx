import React, { useState } from "react";
import { Bot, Pencil, ChevronDown, ChevronUp, Settings2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { cn } from "@/lib/utils";

const ConfigureTab = ({
  state,
  variables,
  onEditAgent,
}) => {
  const { selectedAgent, message, threadId, messageId, onMessageChange, onThreadIdChange, onMessageIdChange } = state;
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(threadId?.blocks?.length || messageId?.blocks?.length)
  );

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#8F40FF]" />
          <Label className="text-sm font-medium text-gray-900">Selected Agent</Label>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#3A0782] flex items-center justify-center overflow-hidden">
              {selectedAgent?.meta?.thumbnail ? (
                <img
                  src={selectedAgent.meta.thumbnail}
                  alt={selectedAgent?.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedAgent?.name || 'Agent'}</p>
              <p className="text-xs text-gray-500">{selectedAgent?.description || 'No description'}</p>
            </div>
          </div>
          <button 
            onClick={onEditAgent}
            className="flex items-center gap-1.5 text-sm text-[#8F40FF] hover:underline font-medium"
          >
            <Pencil className="w-3.5 h-3.5" />
            Change
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium text-gray-900">
            Message <span className="text-red-500">*</span>
          </Label>
          <p className="text-sm text-gray-500 mt-1">
            Enter the message that the agent will process and respond to.
          </p>
        </div>
        <FormulaBar
          variables={variables}
          defaultInputContent={message?.blocks || []}
          onInputContentChanged={onMessageChange}
          placeholder="Enter your message here..."
          wrapContent={true}
          slotProps={{
            container: {
              style: {
                overflow: "auto",
                width: "100%",
                minHeight: "100px",
              },
            },
          }}
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={cn(
            "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
            "hover:bg-gray-50",
            showAdvanced ? "bg-gray-50" : ""
          )}
        >
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Advanced Settings</span>
            {(threadId?.blocks?.length > 0 || messageId?.blocks?.length > 0) && (
              <span className="text-xs bg-[#8F40FF]/10 text-[#8F40FF] px-2 py-0.5 rounded-full">
                Configured
              </span>
            )}
          </div>
          {showAdvanced ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-5 pl-1">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-900">Thread ID</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Enter a thread ID to continue an existing conversation. If no thread ID is provided, each message will start a new conversation.
                </p>
              </div>
              <FormulaBar
                variables={variables}
                defaultInputContent={threadId?.blocks || []}
                onInputContentChanged={onThreadIdChange}
                placeholder="Thread ID (optional)"
                wrapContent={true}
                slotProps={{
                  container: {
                    style: {
                      overflow: "auto",
                      width: "100%",
                    },
                  },
                }}
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-900">Message ID</Label>
                <p className="text-sm text-gray-500 mt-1">
                  Provide a message ID to overwrite an existing message with that ID. If the ID doesn't exist, a new message will be created with the given ID.
                </p>
              </div>
              <FormulaBar
                variables={variables}
                defaultInputContent={messageId?.blocks || []}
                onInputContentChanged={onMessageIdChange}
                placeholder="Message ID (optional)"
                wrapContent={true}
                slotProps={{
                  container: {
                    style: {
                      overflow: "auto",
                      width: "100%",
                    },
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfigureTab;
