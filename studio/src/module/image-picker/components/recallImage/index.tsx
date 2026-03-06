import { FormulaBar } from "@src/module/ods";
import { fxInputStyle } from "./styles";

const RecallImage = ({ blocks, variables, handleRecallImage }) => {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
      data-testid="image-picker-recall-image"
    >
      <span data-testid="image-picker-recall-image-text">Recall Image</span>
      <FormulaBar
        wrapContent
        placeholder={
          "Use images or image links  uploaded for previous questions"
        }
        hideInputBorders={false}
        defaultInputContent={blocks}
        onInputContentChanged={(content) => {
          handleRecallImage(content);
        }}
        variables={variables}
        slotProps={{
          container: {
            style: {
              ...fxInputStyle()
            },
          },
        }}
      />
    </div>
  );
};

export default RecallImage;
