import { memo } from "react";
import { ODSLabel, ODSTooltip, ODSIcon } from "@src/module/ods";
import ShowInfo from "../../ShowInfo";
import { getContainerStyles } from "./styles";
import isEmpty from "lodash/isEmpty";
import getTypeValue from "../../../utils/getTypeValue";
interface KeyRendererType {
  value: string;
  hideColumnType?: boolean;
  type?: string;
  disable?: boolean;
  icon?: string | null | undefined;
  alias?: string;
  allowQuestionDataType?: boolean;
}

const DEFAULT_VALUE = "Please enter key";

function LeftAdornment({
  value,
  type,
  icon,
  alias,
  allowQuestionDataType,
}: {
  value: string;
  type: string;
  icon: string | null | undefined;
  alias?: string;
  allowQuestionDataType?: boolean;
}) {
  if (allowQuestionDataType && icon) {
    const typeValue = getTypeValue({ alias, type, allowQuestionDataType });

    return (
      <ODSTooltip title={typeValue}>
        <ODSIcon
          imageProps={{
            src: icon,
            style: { width: "1rem", height: "1rem", margin: "0 0.25rem" },
          }}
        />
      </ODSTooltip>
    );
  }

  return <ShowInfo title={`${value}: ${type}`} />;
}

function KeyRenderer({
  value = "",
  hideColumnType = false,
  type = "",
  icon = "",
  alias = "",
  allowQuestionDataType = false,
}: KeyRendererType) {
  const keyValue = !isEmpty(value) ? value : DEFAULT_VALUE;

  return (
    <div style={getContainerStyles()}>
      {hideColumnType && (
        <LeftAdornment
          value={value}
          type={type}
          icon={icon}
          alias={alias}
          allowQuestionDataType={allowQuestionDataType}
        />
      )}

      <ODSTooltip title={keyValue} style={{ width: "100%", minWidth: "0px" }}>
        <ODSLabel
          variant="body1"
          color={!isEmpty(value) ? "#666" : "#a2a2a2"}
          style={{
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
          }}
        >
          {keyValue}
        </ODSLabel>
      </ODSTooltip>
    </div>
  );
}

export default memo(KeyRenderer);
