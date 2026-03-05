// import { ODSAutocomplete as Autocomplete } from "@src/module/ods";
// import Accordion from "oute-ds-accordion";
// import { ODSTextField as TextField } from "@src/module/ods";
// import { FormulaBar } from "@src/module/ods";
import { ODSInputGridV3 as InputGridV3 } from "@src/module/ods";
// import { ODSButton } from "@src/module/ods";
// import { ODSIcon } from "@src/module/ods";
// import { ODSLabel } from "@src/module/ods";
import { ODSAutocomplete as Autocomplete, ODSAccordion as Accordion, ODSTextField as TextField, ODSFormulaBar as FormulaBar, ODSButton, ODSIcon, ODSLabel } from "@src/module/ods";
import classes from "../../ArrayAggregator.module.css";
import { useState } from "react";
const Configure = ({
  sources,
  source,
  setSource,
  initializeArrayAggregator,
  editedAggregateOnFields,
  aggregateOnFields,
  variables,
  aggregateOnNodes,
  onAddAggregate,
  onRemoveAggregate,
  onUpdateAggregate,
}) => {
  const [expandedIndex, setExpandedIndex] = useState(0);

  // Handle add aggregate with auto-expand
  const handleAddAggregate = () => {
    onAddAggregate();
    // Set the new row to be expanded (it will be the last index)
    setExpandedIndex(aggregateOnFields.length);
  };

  return (
    <div className={classes["array-aggregator-container"]}>
      {/* Source Selection */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <ODSLabel variant="h6" fontWeight="600">
          Select Iterator
        </ODSLabel>
        <Autocomplete
          value={sources?.find((ele) => ele?.key === source?.key) || null}
          options={sources}
          fullWidth
          data-testid="array-aggregator-source"
          variant="black"
          getOptionLabel={(option) => option?.name}
          isOptionEqualToValue={(option, value) => option?.key === value.key}
          onChange={(e, value) => {
            setSource(value);
            initializeArrayAggregator(value, editedAggregateOnFields);
          }}
          textFieldProps={{
            placeholder: "Select a source iterator node",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.5rem",
        }}
      >
        <ODSLabel variant="capital" fontWeight="600">
          Aggregate fields
        </ODSLabel>
        <ODSButton
          variant={"black-outlined"}
          label={"AGGREGATE"}
          onClick={handleAddAggregate}
          size="medium"
          data-testid="add-aggregate"
          startIcon={
            <ODSIcon
              outeIconName="OUTEAddIcon"
              outeIconProps={{
                sx: {
                  color: "#212121",
                },
              }}
            />
          }
        />
      </div>

      {/* Aggregate Rows */}
      <div style={{ overflowY: "auto", height: "100%" }}>
        {aggregateOnFields.map((aggregate, index) => (
          <div
            key={aggregate.rowid}
            data-testid={`aggregate-${index}`}
            style={{ marginBottom: "0.5rem" }}
          >
            <Accordion
              data-testid={`aggregate-accordion-${index}`}
              expanded={expandedIndex === index}
              onChange={() => {
                setExpandedIndex(expandedIndex === index ? null : index);
              }}
              title={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div>
                    <ODSLabel variant="capital">Field {index + 1}</ODSLabel>
                    {/* <ODSLabel variant="body2" color="#607D8B">
                      {aggregate.key || "Configure aggregate settings"}
                    </ODSLabel> */}
                  </div>
                  {aggregateOnFields.length > 1 && (
                    <ODSIcon
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAggregate(aggregate.rowid);
                      }}
                      outeIconName="OUTETrashIcon"
                      buttonProps={{
                        "data-testid": `delete-aggregate-${index}`,
                      }}
                      outeIconProps={{
                        sx: {
                          width: "1.25rem",
                          height: "1.25rem",
                          cursor: "pointer",
                        },
                      }}
                    />
                  )}
                </div>
              }
              content={
                <div className={classes["main-container"]}>
                  {/* Title Field */}
                  <div className={classes["sub-container"]}>
                    <ODSLabel variant="body1" fontWeight="600">
                      Title
                    </ODSLabel>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <ODSLabel variant="body2" color="#607D8B">
                        This title will be shown in the FX under aggregator
                        nesting
                      </ODSLabel>

                      <TextField
                        value={aggregate.key || ""}
                        onChange={(e) =>
                          onUpdateAggregate(index, "key", e.target.value)
                        }
                        data-testid={`aggregate-title-${index}`}
                        fullWidth
                        className="black"
                        placeholder="Enter title"
                        autoFocus={expandedIndex === index}
                      />
                    </div>
                  </div>

                  {/* Condition Field */}
                  <div className={classes["sub-container"]}>
                    <ODSLabel variant="body1" fontWeight="600">
                      Condition
                    </ODSLabel>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <ODSLabel variant="body2" color="#607D8B">
                        Define the condition for aggregator
                      </ODSLabel>
                      <FormulaBar
                        wrapContent={true}
                        placeholder="Enter condition"
                        defaultInputContent={
                          aggregate.filter_condition?.blocks || []
                        }
                        onInputContentChanged={(blocks) => {
                          onUpdateAggregate(index, "filter_condition", {
                            type: "fx",
                            blocks,
                          });
                        }}
                        variables={variables}
                        slotProps={{
                          container: {
                            "data-testid": `aggregate-condition-${index}`,
                          },
                        }}
                      />
                    </div>
                  </div>

                  {/* Single InputGridV3 for configuration - matching original */}
                  <div
                    className={classes["sub-container"]}
                    data-testid={`aggregate-configuration-${index}`}
                  >
                    <ODSLabel variant="body1" fontWeight="600">
                      Value
                    </ODSLabel>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <ODSLabel variant="body2" color="#607D8B">
                        Configure data type and value you want the condition to
                        be
                      </ODSLabel>

                      {/* Single InputGridV3 like in original code */}
                      <div
                        style={{
                          border: "1px solid #CFD8DC",
                          borderRadius: "0.375rem",
                          padding: "1rem",
                        }}
                      >
                        <InputGridV3
                          variables={aggregateOnNodes || variables}
                          initialValue={aggregate.schema || []}
                          onGridDataChange={(updatedValue) => {
                            onUpdateAggregate(index, "schema", updatedValue);
                          }}
                          isValueMode={true}
                          allowQuestionDataType={false}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              }
              summaryProps={{
                sx: {
                  flexDirection: "row",
                  border: "none",
                  padding: "1rem 1.5rem !important",
                  height: "auto !important",
                  background: "#ECEFF1",
                  "& .MuiAccordionSummary-content": {
                    margin: "0 !important",
                    padding: "0 !important",
                  },
                },
              }}
              style={{
                border: "0.0625rem solid #CFD8DC",
                borderRadius: "0.375rem",
              }}
            />
          </div>
        ))}

        {/* Add Aggregate Button */}
      </div>
    </div>
  );
};

export default Configure;
