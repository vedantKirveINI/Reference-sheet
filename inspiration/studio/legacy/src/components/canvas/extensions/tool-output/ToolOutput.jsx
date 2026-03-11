import { forwardRef, useImperativeHandle, useState } from "react";
import Table from "../common-components/Table";
// import Autocomplete from "oute-ds-autocomplete";
import { ODSAutocomplete as Autocomplete } from "@src/module/ods";

const STATUSES = [
  {
    value: "success",
    label: "Success",
  },
  {
    value: "failure",
    label: "Failure",
  },
];

const ToolOutputComp = forwardRef(({ data = {}, variables }, ref) => {
  const [outputs, setOutputs] = useState(
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

  const [status, setStatus] = useState("success");

  useImperativeHandle(ref, () => {
    return {
      getData: () => outputs,
    };
  }, [outputs]);

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
          margin: "18px 12px 0px 12px",
        }}
      >
        <div
          style={{
            marginBottom: 7,
            fontWeight: 500,
            fontSize: "1rem",
            color: "#263238",
          }}
        >
          Select type
        </div>
        <Autocomplete
          options={STATUSES}
          variant="black"
          fullWidth
          value={STATUSES?.find((option) => option.value === status) || ""}
          onChange={(e, value) => {
            setStatus(value?.value);
            // onChange(value);
          }}
          textFieldProps={{
            placeholder: "",
            // InputProps: {
            //   endAdornment: <Icon outeIconName="OUTESearchIcon" />,
            // },
            // inputRef: selectAppRef,
          }}
          sx={{
            "& .MuiOutlinedInput-root": { paddingRight: "1rem !important" },
          }}
          searchable={false}
          openOnFocus
          getOptionLabel={(option) => option.label}
        />
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
              title: "DEFAULT VALUE",
              style: { flex: 1 },
              type: "fx",
              valueAccessor: "default",
              props: {
                variables,
              },
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
          onChange={setOutputs}
          data={outputs}
        />
      </div>
    </div>
  );
});

export default ToolOutputComp;
