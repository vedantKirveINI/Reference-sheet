import React, { useEffect, useState, useMemo } from "react";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/ui/combobox";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { QuestionType } from "@src/module/constants";

const ConfigureTab = ({ state, variables, getNodes, nodeData }) => {
  const {
    targetNodeId,
    setTargetNodeId,
    messageContent,
    setMessageContent,
    validation,
  } = state;

  const [nodes, setNodes] = useState([]);

  const comboboxOptions = useMemo(
    () =>
      nodes.map((node) => ({
        value: node.key,
        label: node?.description || node?.name || "",
        option: node,
      })),
    [nodes],
  );

  useEffect(() => {
    const getNodesData = async () => {
      if (!getNodes) return;
      const response = await getNodes({ fetchPreviousNodes: true });
      const filteredNodes = response.filter(
        (node) =>
          node?.module === "Question" &&
          node?.type !== QuestionType.LOADING &&
          node?.type !== QuestionType.ENDING,
      );
      setNodes(filteredNodes);
    };
    getNodesData();
  }, [getNodes, nodeData]);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Redirects the flow to a previously created node in your workflow.
      </p>

      <div className="space-y-3">
        <Label>
          Target Node<span className="text-destructive">*</span>
        </Label>

        {nodes?.length > 0 ? (
          <Combobox
            options={comboboxOptions}
            value={targetNodeId ?? undefined}
            onValueChange={(value) => setTargetNodeId(value ?? null)}
            searchable
            placeholder="Select a node to jump to"
            data-testid="jump-to-node-dropdown"
          />
        ) : (
          <div className="rounded-lg border border-border bg-muted p-4 text-center text-sm text-muted-foreground">
            No available nodes to jump to
          </div>
        )}

        {!validation.isValid && (
          <p className="text-sm text-destructive">{validation.errors[0]}</p>
        )}
      </div>

      <div className="space-y-3">
        <Label>Jump-back Message</Label>
        <p className="text-sm text-muted-foreground">
          Message shown when jumping back to a previous question
        </p>
        <FormulaBar
          variables={variables}
          wrapContent
          placeholder="Please change your response to proceed further."
          defaultInputContent={messageContent?.blocks || []}
          onInputContentChanged={(blocks) =>
            setMessageContent({ type: "fx", blocks })
          }
          slotProps={{
            container: {
              className: "rounded-lg border border-input bg-background",
            },
          }}
        />
      </div>
    </div>
  );
};

export default ConfigureTab;
