import React, { useEffect, useState } from "react";
// import TextField from "oute-ds-text-field";
// import Button from "oute-ds-button";
// import Autocomplete from "oute-ds-autocomplete";
// import Label from "oute-ds-label";
import styles from "./EditTitle.module.css";
// import Icon from "oute-ds-icon";
import { ODSTextField as TextField, ODSButton as Button, ODSAutocomplete as Autocomplete, ODSLabel as Label, ODSIcon as Icon } from "@src/module/ods";
import { QUESTIONS_NODES } from "../question-setup/constants/questionNodes";

const EditTitle = ({ data = {}, onSave = () => {}, onDiscard = () => {} }) => {
  const questionNodes = Object.keys(QUESTIONS_NODES).map((key) => {
    return QUESTIONS_NODES[key];
  });
  const [name, setName] = useState(data.name || "");
  const [hoverDescription, setHoverDescription] = useState(
    data.hoverDescription || ""
  );
  const [errorText, setErrorText] = useState({
    nodeName: "",
    nodeDescription: "",
  });
  const [selectedQuestionType, setSelectedQuestionType] = useState(null);
  useEffect(() => {
    setSelectedQuestionType(
      questionNodes.find((node) => node.type === data.nodeType)
    );
  }, [data.nodeType, questionNodes]);

  const handleSave = () => {
    const trimmedName = name.trim();
    if (trimmedName === "") {
      setErrorText({ ...errorText, nodeName: "This field is mandatory" });
    }
    if (trimmedName && trimmedName.length <= 40) {
      onSave({ name, hoverDescription, selectedQuestionType });
    }
  };
  return (
    <div className={styles.container}>
      <div className={styles.nodeGroup}>
        {/* {data.nodeModule === "Question" && (
          <Autocomplete
            disbaled
            value={selectedQuestionType}
            options={questionNodes}
            searchable={true}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(option, value) => {
              return option.type === value.type;
            }}
            renderOption={(props, option) => (
              <li {...props}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  <Icon
                    imageProps={{
                      src: option._src,
                      style: { width: "1.6rem", height: "1.6rem" },
                    }}
                  />
                  <Label variant="body1">{option.name}</Label>
                </div>
              </li>
            )}
            onChange={(e, value) => {
              setName(value.name);
              setSelectedQuestionType(value);
            }}
            textFieldProps={{
              placeholder: "Please select a question type.",
              label: "Question Type",
              InputProps: {
                startAdornment: selectedQuestionType?._src ? (
                  <Icon
                    imageProps={{
                      src: selectedQuestionType._src,
                      style: { width: "1.6rem", height: "1.6rem" },
                    }}
                  />
                ) : null,
              },
            }}
          />
        )} */}
        <div className={styles.textFieldWrapper}>
          <Label variant="body1">
            Node Name<sup style={{ color: "red" }}>*</sup>
          </Label>
          <TextField
            placeholder="Type your node name here"
            value={name}
            onChange={(e) => {
              setErrorText({ ...errorText, nodeName: "" });
              if (e.target.value?.length > 40) {
                setErrorText({
                  ...errorText,
                  nodeName: "Character limit reached",
                });
              } else {
                setName(e.target.value);
              }
            }}
            onFocus={(e) => e.target.select()}
            onBlur={() => setErrorText((prev) => ({ ...prev, nodeName: "" }))}
            InputProps={{
              endAdornment: `${name.length}/40`,
              "data-testid": "node-title-edit-text-field",
            }}
            inputProps={{
              "data-testid": "node-title-editor-input",
            }}
            error={errorText?.nodeName !== ""}
            helperText={errorText?.nodeName}
            sx={{
              marginBottom: 0,
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: !errorText?.nodeName && "#212121",
                },
              },
            }}
          />
        </div>

        <div className={styles.textFieldWrapper}>
          <Label variant="body1">Node Description</Label>
          <TextField
            placeholder="Type your description here"
            value={hoverDescription}
            onChange={(e) => {
              setErrorText({ ...errorText, nodeDescription: "" });
              if (e.target.value?.length > 80) {
                setErrorText({
                  ...errorText,
                  nodeDescription: "Character limit reached",
                });
              } else {
                setHoverDescription(e.target.value);
              }
            }}
            onFocus={(e) => e.target.select()}
            onBlur={() =>
              setErrorText((prev) => ({ ...prev, nodeDescription: "" }))
            }
            InputProps={{
              endAdornment: `${hoverDescription.length}/80`,
              "data-testid": "node-description-edit-text-field",
            }}
            inputProps={{
              "data-testid": "node-description-editor-input",
            }}
            error={errorText?.nodeDescription !== ""}
            helperText={errorText?.nodeDescription}
            sx={{
              marginBottom: 0,
              "& .MuiOutlinedInput-root": {
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: !errorText?.nodeDescription && "#212121",
                },
              },
            }}
          />
        </div>
      </div>
      <div className={styles.buttonGroup}>
        <Button
          label="DISCARD"
          onClick={() => onDiscard()}
          variant="black-outlined"
          data-testid="node-meta-discard-button"
          sx={{
            width: "7.5rem",
            height: "2.75rem",
          }}
        />
        <Button
          label="SAVE"
          variant="black"
          onClick={handleSave}
          sx={{
            width: "7.5rem",
            height: "2.75rem",
          }}
          data-testid="node-meta-save-button"
        />
      </div>
    </div>
  );
};

export default EditTitle;
