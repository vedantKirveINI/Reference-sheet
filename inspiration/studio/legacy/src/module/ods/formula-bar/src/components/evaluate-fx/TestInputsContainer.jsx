import React, { useEffect, useState } from "react";
import DataBlock from '../data-block/index.jsx';
// import TextField from "oute-ds-text-field";
// import Accordion from "oute-ds-accordion";
// import Icon from "oute-ds-icon";
import { ODSTextField as TextField, ODSAccordion as Accordion, ODSIcon as Icon } from "../../../../index.jsx";

const TestInputsContainer = ({ data = [], setData }) => {
  const [inputs, setInputs] = useState({});
  useEffect(() => {
    let _inputs = {};
    data.forEach((d) => {
      if (!_inputs?.[d?.variableData?.nodeId]) {
        _inputs[d?.variableData?.nodeId] = d;
      }
    });
    setInputs(_inputs);
  }, [data]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
        padding: "0.5rem",
      }}
    >
      {Object.keys(inputs)?.length > 0 ? (
        Object.keys(inputs).map((k, index) => {
          const d = inputs[k];
          return (
            <Accordion
              key={`test-input-${index}`}
              title={<DataBlock block={d} />}
              sx={{ border: "none", padding: "0.5rem", background: "#f5f5f5" }}
              summaryProps={{
                sx: { background: "none" },
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
              defaultExpanded={index === 0}
              content={
                <div style={{ padding: "0.5rem" }}>
                  <TextField
                    size="small"
                    className="black"
                    placeholder={d.variableData?.type || "any"}
                    defaultValue={
                      typeof d?.variableData?.default === "object"
                        ? JSON.stringify(d?.variableData?.default, null, 2)
                        : d?.variableData?.default || ""
                    }
                    fullWidth
                    multiline
                    maxRows={10}
                    onChange={(e) => {
                      setData((prev) => {
                        return prev.map((p) => {
                          if (p?.variableData?.nodeId === k) {
                            return {
                              ...p,
                              variableData: {
                                ...p?.variableData,
                                default: e.target.value,
                              },
                            };
                          }
                          return p;
                        });
                      });
                    }}
                  />
                </div>
              }
            />
          );
        })
      ) : (
        <div style={{ padding: "1rem" }}>No inputs needed.</div>
      )}
    </div>
  );
};

export default TestInputsContainer;
