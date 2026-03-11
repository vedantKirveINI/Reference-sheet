import { useState } from "react";
import { ODSSwitch } from "@src/module/ods";
import { switchContainer } from "./styles";
import WarningModal from "../../common/WarningModal";
interface WarningState {
  open: boolean;
  confirmParams?: any;
}

function MapSwitch({
  value,
  onChange,
  isValueMode,
  dataTestId = "parent",
  variant = "",
}) {
  const [warningModal, setWarningModal] = useState<WarningState>({
    open: false,
    confirmParams: null,
  });

  const handleSwitchChange = (val) => {
    if ("isMap" in value) {
      if (value.isMap == true) {
        //isMap == true

        if ("value" in value) {
          if (
            value.value?.blockStr == undefined ||
            value.value?.blockStr == ""
          ) {
            onChange({
              key: "isMap",
              value: val.target.checked,
            });
          } else {
            setWarningModal({
              open: true,
              confirmParams: val.target.checked, // Use the switch's new checked value
            });
          }
        } else {
          onChange({
            key: "isMap",
            value: val.target.checked,
          });
        }
      } else {
        //isMap == false
        if ("value" in value) {
          if (value.value.length == 1) {
            if (value.value[0].type == "String") {
              if ("key" in value.value[0] || "value" in value.value[0]) {
                setWarningModal({
                  open: true,
                  confirmParams: val.target.checked, // Use the switch's new checked value
                });
              } else {
                onChange({
                  key: "isMap",
                  value: val.target.checked,
                });
              }
            } else {
              setWarningModal({
                open: true,
                confirmParams: val.target.checked, // Use the switch's new checked value
              });
            }
          } else {
            setWarningModal({
              open: true,
              confirmParams: val.target.checked, // Use the switch's new checked value
            });
          }
        } else {
          onChange({
            key: "isMap",
            value: val.target.checked,
          });
        }
      }
    } else if ("value" in value) {
      if (value.value.length == 1) {
        if (value.value[0].type == "String") {
          if ("key" in value.value[0] || "value" in value.value[0]) {
            setWarningModal({
              open: true,
              confirmParams: val.target.checked, // Use the switch's new checked value
            });
          } else {
            onChange({
              key: "isMap",
              value: val.target.checked,
            });
          }
        } else {
          setWarningModal({
            open: true,
            confirmParams: val.target.checked, // Use the switch's new checked value
          });
        }
      } else {
        setWarningModal({
          open: true,
          confirmParams: val.target.checked, // Use the switch's new checked value
        });
      }
    } else {
      onChange({
        key: "isMap",
        value: val.target.checked,
      });
    }
  };

  const handleConfirm = (confirmedValue) => {
    onChange({
      key: "isMap",
      value: confirmedValue,
    });
    setWarningModal({ open: false, confirmParams: null });
  };

  if (!isValueMode) {
    return null;
  }

  return (
    <>
      <div style={switchContainer} data-testid={`${dataTestId}_map_switch`}>
        <ODSSwitch
          labelText="MAP"
          variant={variant}
          size="small"
          checked={value.isMap || false}
          labelProps={{ variant: "subtitle1" }}
          onChange={handleSwitchChange}
        />
      </div>

      <WarningModal
        warningModal={warningModal}
        setWarningModal={setWarningModal}
        onConfirm={handleConfirm}
        variant={variant}
      />
    </>
  );
}

export default MapSwitch;
