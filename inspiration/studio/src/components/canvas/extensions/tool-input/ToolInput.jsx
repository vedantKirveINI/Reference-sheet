import { forwardRef, useImperativeHandle, useState } from "react";
import Table from "../common-components/Table";

const ToolInputComp = forwardRef(({ data = {} }, ref) => {
  const [inputs, setInputs] = useState(
    data?.length
      ? data
      : [
          {
            type: "STRING",
            key: "",
            description: "",
          },
        ]
  );

  useImperativeHandle(ref, () => {
    return {
      getData: () => inputs,
    };
  }, [inputs]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderTop: "1px solid black",
        borderBottom: "1px solid black",
      }}
    >
      <div
        style={{
          borderRadius: " 0.375rem",
          border: "0.047rem solid #2196f3",
          background: "#e3f2fd",
          margin: "1rem",
        }}
      >
        <p
          style={{
            color: "#000",
            fontSize: "0.875rem",
            lineHeight: "2rem",
            letterSpacing: "0.078rem",
            margin: "0",
            padding: "0.5rem",
          }}
        >
          <span style={{ fontWeight: "700", color: "#1976d2" }}>Note: </span>{" "}
          Add a relevant description for each input field and a default value if
          applicable
        </p>
      </div>
      <div
        style={{
          margin: "18px 12px 18px 12px",
          flex: 1,
          display: "flex",
        }}
      >
        <Table
          style={{}}
          columns={[
            {
              title: "TYPE",
              style: { width: 120 },
              type: "dropdown",
              options: [
                "STRING",
                "NUMBER",
                "BOOLEAN",
                "INT",
                "OBJECT",
                "ARRAY",
                "ANY",
              ],
              valueAccessor: "type",
            },
            {
              title: "KEY",
              style: { width: 90 },
              type: "simpleinput",
              valueAccessor: "key",
            },
            {
              title: "DESCRIPTION",
              style: { flex: 1 },
              type: "simpleinput",
              valueAccessor: "description",
            },
            {
              title: "DEFAULT VALUE",
              style: { flex: 1 },
              type: "simpleinput",
              valueAccessor: "default",
            },
            //   {
            //     title: "Required",
            //     type: "switch",
            //     style: { width: 90 },
            //     valueAccessor: "required",
            //   },
            {
              title: "",
              style: { width: 65 },
              type: "delete",
            },
          ]}
          onChange={setInputs}
          data={inputs}
        />
      </div>
    </div>
  );
});

export default ToolInputComp;
