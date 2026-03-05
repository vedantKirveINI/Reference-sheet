import { memo, useCallback, useMemo, ChangeEvent } from "react";
import { Editor } from "@src/module/editor";
import { canRefreshQuestion } from "../../utils/helpers";
import { Refresh } from "../Refresh";
import { MapSwitch } from "../MapSwitch";
import { MAPPABLE_QUESTIONS } from "../../utils/constants";
import type { IAllNodes, ITheme, INode } from "../../types";

interface QuestionHeaderProps {
  theme?: ITheme;
  style?: React.CSSProperties;
  isRequired?: boolean;
  id: string;
  onMapToggle?: (params: { node: INode; value: boolean }) => void;
  onNodeRefresh?: (nodeId: string) => Promise<void>;
  isMapped: boolean;
  node: INode;
  allNodes?: IAllNodes;
}

const QuestionHeader = ({
  theme = {},
  style = {},
  isRequired = false,
  id,
  onMapToggle,
  onNodeRefresh,
  isMapped,
  node,
  allNodes = {},
}: QuestionHeaderProps) => {
  const question = node?.config;

  const questionTheme = useMemo(
    () => ({
      fontSize: "14px",
      color: theme?.styles?.questions || "#18181b",
      fontFamily: "Inter",
    }),
    [theme?.styles?.questions]
  );


  const handleNodeRefresh = useCallback(async () => {
    if (onNodeRefresh) {
      await onNodeRefresh(node?.id);
    }
  }, [node?.id, onNodeRefresh]);

  const handleMapToggle = useCallback(
    (checked: boolean) => {
      if (onMapToggle) {
        onMapToggle({
          node,
          value: checked,
        });
      }
    },
    [node, onMapToggle]
  );

  const questionStyle: React.CSSProperties = useMemo(() => ({
    fontSize: "14px",
    fontWeight: 500,
    lineHeight: 1.4,
    display: "inline",
  }), []);

  const showRefreshButton = canRefreshQuestion(question, allNodes);
  const showMapSwitch =
    MAPPABLE_QUESTIONS.includes(question?.type || "") &&
    question?.settings?.enableMap;

  return (
    <div className="flex items-start justify-between gap-2">
      <div style={{ ...style, flex: 1 }} className="flex items-start">
        <span className="inline">
          <Editor
            editable={false}
            value={question?.question || ""}
            theme={questionTheme}
            style={questionStyle}
            enableFXPicker={false}
            testId={`${id}-title`}
          />
        </span>
        {isRequired && (
          <span className="text-destructive text-sm font-medium ml-0.5 mt-0.5">*</span>
        )}
      </div>

      <div className="flex gap-2 items-center shrink-0">
        {showRefreshButton && onNodeRefresh && (
          <Refresh onClick={handleNodeRefresh} />
        )}

        {showMapSwitch && (
          <MapSwitch
            key="FX-mapping"
            title="Map"
            styles={{ width: "max-content" }}
            checked={isMapped}
            onChange={(event: ChangeEvent<HTMLInputElement>) => {
              handleMapToggle(event.target.checked);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default memo(QuestionHeader);
