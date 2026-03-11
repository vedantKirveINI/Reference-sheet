import DeleteButton from "../delete-button";
import classes from "./index.module.css";
import Select from "./select";
import SimpleInput from "./simpleInput";
// import { FormulaBar } from "@src/module/ods";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";

const RenderCell = ({
  value,
  column,
  onChangeCell,
  rowIndex,
  handleDeleteRow,
}) => {
  return (
    <div style={column?.style || {}} className={classes.cell}>
      {column?.type === "dropdown" && (
        <div style={{ padding: "0rem 10px" }}>
          <Select
            options={column?.options}
            value={value}
            onChange={(val) => {
              onChangeCell({
                columnName: column?.valueAccessor,
                rowIndex,
                value: val,
              });
            }}
          />
        </div>
      )}
      {column?.type === "simpleinput" && (
        <div style={{ padding: "0rem 10px" }}>
          <SimpleInput
            onChange={(val) => {
              onChangeCell({
                columnName: column?.valueAccessor,
                rowIndex,
                value: val,
              });
            }}
            value={value}
          />
        </div>
      )}
      {column?.type === "fx" && (
        <FormulaBar
          placeholder=""
          variables={column?.props?.variables || {}}
          defaultInputContent={value?.blocks || []}
          onInputContentChanged={(content) => {
            onChangeCell({
              columnName: column?.valueAccessor,
              rowIndex,
              value: {
                type: "fx",
                blocks: content,
              },
            });
          }}
          slotProps={{
            conatiner: {
              style: {
                background: "red",
                border: "0px solid rgba(0, 0, 0, 0.20)",
                borderRadius: "10em",
              },
            },
          }}
          wrapContent={true}
        />
      )}
      {column?.type === "delete" && (
        <div style={{ padding: "0rem 10px" }}>
          <DeleteButton
            onClick={() => {
              handleDeleteRow(rowIndex);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default RenderCell;
