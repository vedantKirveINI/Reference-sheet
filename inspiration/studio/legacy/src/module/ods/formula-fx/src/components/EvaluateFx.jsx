import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ODSAccordion as Accordion, ODSLabel as Label, ODSIcon as Icon, ODSButton as Button } from "@src/module/ods";
import utility from "oute-services-flow-utility-sdk";
import ExplanationContainer from "./ExplanationContainer.jsx";
import TestInputsContainer from "./TestInputsContainer.jsx";

const EvaluateFx = forwardRef(({ contentRef = {} }, ref) => {
  const [data, setData] = useState([]);
  const [nodeInputs, setNodeInputs] = useState([]);
  const [output, setOutput] = useState("");
  const [isError, setIsError] = useState(false);

  const evaluateFxBtnRef = useRef();

  const refreshData = useCallback(() => {
    console.log("refreshing data");
    const content = contentRef.current.getContent();
    setData(content);
    setNodeInputs(
      content.filter((d) => d.type === "NODE" || d.subCategory === "NODE")
    );
  }, [contentRef]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);
  
  useEffect(() => {
    if (!nodeInputs?.length) {
      evaluateFxBtnRef?.current?.click();
    }
  }, [nodeInputs]);
  
  useImperativeHandle(
    ref,
    () => ({
      refreshData,
    }),
    [refreshData]
  );
  
  if (!data?.length)
    return (
      <div style={{ padding: "1rem" }}>
        <Label variant="capital">Nothing to Evaluate</Label>
      </div>
    );
    
  return (
    <>
      <div
        style={{
          display: "grid",
          gridAutoRows: "max-content",
          width: "24rem",
          height: "20rem",
          gap: "1rem",
          overflow: "auto",
          padding: "1rem",
          boxSizing: "border-box",
          alignContent: "start",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {data.filter((d) => {
          return d.subCategory === "FUNCTIONS" || d.type === "FUNCTIONS";
        }).length > 0 && (
          <div>
            <Accordion
              title={<Label variant="capital">Explanation</Label>}
              sx={{
                border: "none",
                borderRadius: "0px !important",
                borderBottom: "0.75px solid #90A4AE",
              }}
              summaryProps={{
                sx: {
                  background: "transparent",
                },
                expandIcon: (
                  <Icon
                    outeIconName="OUTEChevronLeftIcon"
                    outeIconProps={{
                      sx: {
                        transform: "rotate(-90deg)",
                        color: "#90A4AE",
                        width: 20,
                        height: 20,
                      },
                    }}
                  />
                ),
              }}
              content={
                <ExplanationContainer
                  data={data.filter((d) => {
                    return (
                      d.subCategory === "FUNCTIONS" || d.type === "FUNCTIONS"
                    );
                  })}
                />
              }
            />
          </div>
        )}
        {nodeInputs.length > 0 && (
          <div>
            <Accordion
              title={<Label variant="capital">Inputs</Label>}
              defaultExpanded={true}
              sx={{
                border: "none",
                borderRadius: "0px !important",
                borderBottom: "0.75px solid #90A4AE",
              }}
              summaryProps={{
                sx: {
                  background: "transparent",
                },
                expandIcon: (
                  <Icon
                    outeIconName="OUTEChevronLeftIcon"
                    outeIconProps={{
                      sx: {
                        transform: "rotate(-90deg)",
                        color: "#90A4AE",
                        width: 20,
                        height: 20,
                      },
                    }}
                  />
                ),
              }}
              content={
                <TestInputsContainer setData={setData} data={nodeInputs} />
              }
            />
          </div>
        )}
        <div>
          <Accordion
            title={<Label variant="capital">Outputs</Label>}
            defaultExpanded
            sx={{
              border: "none",
              borderRadius: "0px !important",
            }}
            summaryProps={{
              sx: {
                background: "transparent",
              },
              expandIcon: (
                <Icon
                  outeIconName="OUTEChevronLeftIcon"
                  outeIconProps={{
                    sx: {
                      transform: "rotate(-90deg)",
                      color: "#90A4AE",
                      width: 20,
                      height: 20,
                    },
                  }}
                />
              ),
            }}
            content={
              <div
                data-testid="evaluate-fx-output"
                style={{
                  fontSize: "0.75rem",
                  background: "#f5f5f5",
                  minHeight: "2rem",
                  alignItems: "center",
                  display: "flex",
                  padding: "0.5rem",
                  boxSizing: "border-box",
                  color: isError ? "red" : "black",
                }}
              >
                {output}
              </div>
            }
          />
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "1rem",
          right: "1rem",
          background: "#fff",
        }}
      >
        <Button
          label="EVALUATE"
          variant="black-outlined"
          data-testid="evaluate-fx-button"
          ref={evaluateFxBtnRef}
          onClick={async () => {
            try {
              setIsError(false);
              const output = await utility.resolveValue(
                {},
                "evaluatedOutput",
                {
                  type: "fx",
                  blocks: data,
                },
                undefined,
                undefined,
                undefined,
                { use_default: true }
              );
              if (output?.value && typeof output?.value == "object") {
                setOutput(<pre>{JSON.stringify(output?.value, null, 2)}</pre>);
              } else {
                setOutput(output?.value?.toString());
              }
            } catch (e) {
              setOutput(e.message);
              setIsError(true);
            }
          }}
        />
      </div>
    </>
  );
});

export default EvaluateFx;

