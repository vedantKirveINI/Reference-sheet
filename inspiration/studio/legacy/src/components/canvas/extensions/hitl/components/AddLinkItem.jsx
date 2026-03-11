import React, { useCallback, useEffect, useRef, useState } from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import { FormulaBar } from "oute-ds-formula-bar";
// import Icon from "oute-ds-icon";
// import Label from "oute-ds-label";
import { ODSAutocomplete as Autocomplete, ODSFormulaBar as FormulaBar, ODSIcon as Icon, ODSLabel as Label } from "@src/module/ods";
import { FILE_TYPES } from "../constant";
const AddLinkItem = ({
  variables,
  onLinkAdded = () => {},
  onCancel = () => {},
}) => {
  const fxRef = useRef();
  const [selectedType, setSelectedType] = useState(FILE_TYPES[0]);
  const [linkData, setLinkData] = useState();
  const [error, setError] = useState("");

  const onInputContentChanged = (content) => {
    setLinkData(content);
  };

  const validateLink = useCallback(() => {
    if (!linkData?.length) {
      setError("Please enter or select a valid link");
      fxRef?.current?.focus();
      return;
    }
    onLinkAdded({
      url: { type: "fx", blocks: linkData },
      source: "link",
      type: selectedType.value,
    });
  }, [linkData, onLinkAdded, selectedType.value]);

  useEffect(() => {
    fxRef?.current?.focus();
  }, []);

  useEffect(() => {
    //Add "enter" key listener which will call validateLink
    const listener = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        validateLink();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [onCancel, validateLink]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <Autocomplete
          value={selectedType}
          onChange={(event, newValue) => {
            setSelectedType(newValue);
          }}
          data-testid="link-type"
          options={FILE_TYPES}
          variant="black"
          getOptionLabel={(option) => option.label}
          isOptionEqualToValue={(option, value) => option.value === value.value}
          disableClearable
        />
        <FormulaBar
          ref={fxRef}
          variables={variables}
          defaultInputContent={linkData}
          placeholder="Enter link here"
          onInputContentChanged={onInputContentChanged}
          slotProps={{
            container: {
              "data-testid": "file-link",
            },
          }}
        />
        <Icon
          outeIconName="CheckIcon"
          outeIconProps={{ sx: { color: "#212121" } }}
          buttonProps={{ "data-testid": "check-icon" }}
          onClick={validateLink}
        />
        <Icon
          outeIconName="OUTECloseIcon"
          outeIconProps={{ sx: { color: "#212121" } }}
          buttonProps={{ "data-testid": "close-icon" }}
          onClick={onCancel}
        />
      </div>
      {error && (
        <Label color="error" variant="subtitle1" data-testid="file-link-error">
          {error}
        </Label>
      )}
    </div>
  );
};

export default AddLinkItem;
