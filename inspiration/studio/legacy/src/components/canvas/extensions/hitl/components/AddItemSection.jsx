import React, { useCallback, useRef, useState } from "react";
// import Autocomplete from "oute-ds-autocomplete";
// import { FormulaBar } from "oute-ds-formula-bar";
// import Icon from "oute-ds-icon";
import { ODSAutocomplete as Autocomplete, ODSFormulaBar as FormulaBar, ODSIcon as Icon } from "@src/module/ods";
import { FILE_TYPES } from "../constant";
const AddItemSection = ({ onLinkAdded = () => {}, onCancel = () => {} }) => {
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

  return (
    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
      <Autocomplete
        value={selectedType}
        onChange={(event, newValue) => {
          setSelectedType(newValue);
        }}
        options={FILE_TYPES}
        variant="black"
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        disableClearable
      />
      <FormulaBar
        ref={fxRef}
        defaultInputContent={linkData}
        placeholder="Enter link here"
        onInputContentChanged={onInputContentChanged}
      />
      <Icon
        outeIconName="CheckIcon"
        outeIconProps={{ sx: { color: "#212121" } }}
        onClick={validateLink}
      />
      <Icon
        outeIconName="OUTECloseIcon"
        outeIconProps={{ sx: { color: "#212121" } }}
        onClick={onCancel}
      />
    </div>
  );
};

export default AddItemSection;
