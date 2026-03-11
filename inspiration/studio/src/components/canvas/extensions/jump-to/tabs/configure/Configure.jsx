import React, { useEffect, useMemo, useState } from "react";
import { ODSLabel, ODSAutocomplete as Autocomplete, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { QuestionType } from "../../../../../../module/constants";
import { localStorageConstants } from "../../../../../../module/constants";

const Configure = ({
  nodeData,
  data,
  getNodes,
  selectedNodeId,
  setSelectedNodeId,
  variables,
  messageContent,
  setMessageContent,
}) => {
  const [nodes, setNodes] = useState([]);

  const handleNodeChange = (event, newValue) => {
    setSelectedNodeId(newValue?.key);
  };

  const selectedOption = useMemo(() => {
    return nodes?.find((node) => node.key === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  useEffect(() => {
    const getNodesData = async () => {
      const response = await getNodes({ fetchPreviousNodes: true });
      const filteredNodes = response.filter(
        (node) =>
          node?.module === "Question" &&
          node?.type !== QuestionType.LOADING &&
          node?.type !== QuestionType.ENDING
      );
      setNodes(filteredNodes);
    };
    getNodesData();
  }, [getNodes, nodeData]);

  return (
    <div
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "1.5em",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <ODSLabel
          variant="h6"
          fontWeight="600"
          required
          data-testid="jump-to-node-label"
        >
          Select Target Node
        </ODSLabel>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}
        >
          <ODSLabel
            variant="subtitle1"
            color="#607D8B"
            data-testid="jump-to-node-description"
          >
            Redirects the flow to a previously created node in your workflow.
          </ODSLabel>

          {nodes?.length > 0 ? (
            <Autocomplete
              fullWidth
              variant="black"
              options={nodes}
              searchable={true}
              data-testid="jump-to-node-dropdown"
              getOptionLabel={(option) =>
                option?.description
                  ? `${option?.name} (${option?.description})`
                  : option?.name
              }
              onChange={handleNodeChange}
              isOptionEqualToValue={(option, value) => {
                return option?.key === value.key;
              }}
              renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                  <li {...rest} key={key}>
                    {option?.description
                      ? `${option?.name} (${option?.description})`
                      : option?.name}
                  </li>
                );
              }}
              disableClearable={false}
              textFieldProps={{
                placeholder: "Select a node",
                autoFocus: true,
              }}
              value={selectedOption}
            />
          ) : (
            <></>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <ODSLabel
          variant="h6"
          fontWeight="600"
          required
          data-testid="jump-to-node-label"
        >
          Jump-back Message
        </ODSLabel>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75em" }}
        >
          <ODSLabel
            variant="subtitle1"
            color="#607D8B"
            data-testid="jump-to-node-description"
          >
            Message shown to the filler when they are sent back to the previous
            question.
          </ODSLabel>
          <FormulaBar
            variables={variables}
            wrapContent
            placeholder="Please change your response to proceed further."
            defaultInputContent={messageContent?.blocks || []}
            onInputContentChanged={(blocks) => {
              setMessageContent({ type: "fx", blocks });
            }}
            slotProps={{
              container: {
                style: {
                  height: "10rem",
                  overflow: "auto",
                },
                "data-testid": "transformer-fx-container",
              },
            }}
            enableObjectMapping={
              localStorage.getItem(localStorageConstants.DEV_MODE) === "true"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default Configure;
