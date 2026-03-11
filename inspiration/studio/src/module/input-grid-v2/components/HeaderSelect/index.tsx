import { ODSAutocomplete, ODSIcon, ODSLabel } from "@src/module/ods";
import DATA_TYPE from "../../constant/datatype";

import ShowInfo from "../../common/ShowInfo";
import TOOLTIP_MAPPING from "../../constant/tooltipMapping";
import { endornmentStyles, formItem, optionStyle } from "./styles";
import { lowerCase, startCase } from "lodash";
import { useState } from "react";
import WarningModal from "../../common/WarningModal";
import { questionDataType } from "../../constant/questionDataTypeMapping";
import getDataType from "../../utils/getDataType";
interface WarningState {
  open: boolean;
  confirmParams?: any;
}

const getValue = (data) => {
  if (data?.alias) return startCase(data.alias);

  if (data?.type) return startCase(data.type);

  return "String";
};

function HeaderSelect({
  data,
  onDataTypeChangeHandler,
  readOnly,
  variant,
  allowQuestionDataType,
}) {
  const [warningModal, setWarningModal] = useState<WarningState>({
    open: false,
    confirmParams: null,
  });

  const dataType = getDataType({ allowQuestionDataType });

  return (
    <>
      <div style={formItem}>
        <ODSLabel variant="text">Data Type</ODSLabel>

        <ODSAutocomplete
          data-testid="parent_autocomplete"
          fullWidth
          variant={variant}
          // value={getValue(data)}
          value={startCase(lowerCase(data.type))}
          onChange={(e, val) => {
            setWarningModal({ open: true, confirmParams: val });
          }}
          textFieldProps={{
            placeholder: "Select Data type",
            InputProps: {
              endAdornment: (
                <div style={endornmentStyles}>
                  {!readOnly ? (
                    <ShowInfo title={TOOLTIP_MAPPING[data.type]} />
                  ) : null}

                  <ODSIcon
                    outeIconName="OUTEChevronLeftIcon"
                    outeIconProps={{
                      style: {
                        transform: "rotate(-90deg)",
                      },
                    }}
                  />
                </div>
              ),
            },
          }}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <li key={key} {...rest}>
                <div style={optionStyle}>
                  {option}
                  <ShowInfo title={TOOLTIP_MAPPING[option]} />
                </div>
              </li>
            );
          }}
          options={dataType}
          className="mt-2"
        />
      </div>
      <WarningModal
        warningModal={warningModal}
        setWarningModal={setWarningModal}
        onConfirm={(param) => {
          onDataTypeChangeHandler(
            param,
            questionDataType.includes(lowerCase(param))
          );
          setWarningModal({ open: false });
        }}
      />
    </>
  );
}

export default HeaderSelect;
