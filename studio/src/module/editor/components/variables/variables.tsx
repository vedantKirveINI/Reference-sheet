import { ReactNode, useMemo } from "react";
import {
  SchemaList,
  processNodeVariablesForSchemaList,
} from "@/components/formula-fx/src";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import "./variables.css";
import {
  createRecallPayload,
  type BlockData,
  type RecallPayload,
} from "../../utils/create-recall-payload";

interface IVariablesProps {
  nodeVariables: any[];
  localVariables: any[];
  globalVariables: any[];
  onDataBlockClick: (payload: RecallPayload) => void;
}

const Variables = ({
  nodeVariables = [],
  onDataBlockClick = ({}: RecallPayload) => {},
}: IVariablesProps): ReactNode => {
  const processedSchemaData = useMemo(
    () => processNodeVariablesForSchemaList(nodeVariables),
    [nodeVariables]
  );

  const hasVariables = processedSchemaData.length > 0;

  return (
    <div className="flex flex-col pl-3 pr-0 pt-3 pb-3">
      {!hasVariables && (
        <div
          className="flex items-center justify-center min-h-[6rem] rounded-md border border-dashed border-border bg-muted/20 px-4 py-6 mr-3"
          data-testid="no-incoming-nodes-label-container"
        >
          <Label className="text-center text-sm font-normal text-muted-foreground leading-snug">
            It looks like there are no incoming nodes, which is why you
            don&apos;t see any variables to select. Please connect a node to
            this one and try again
          </Label>
        </div>
      )}

      {hasVariables && (
        <ScrollArea
          className="lexical-schema-list-container h-[15rem] w-full"
          data-testid="recall-variables-container"
        >
          <div className="pr-3">
            {processedSchemaData.map((option) => (
              <SchemaList
                key={option.nodeId}
                node={option}
                parentKey={option.key}
                onClick={((block: BlockData) => {
                  onDataBlockClick(
                    createRecallPayload({
                      nodeVariables: nodeVariables,
                      blockData: block,
                    })
                  );
                }) as unknown as () => void}
                showArrayStructure={true}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default Variables;
