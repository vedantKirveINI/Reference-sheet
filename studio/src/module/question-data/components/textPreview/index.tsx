
import { editorStyles, getMainContainerStyles } from "./styles";
import { ODSAutocomplete as ODSAutoComplete } from "@src/module/ods";
import { Editor } from "@src/module/editor";
import { FormulaBar } from "@src/module/ods";
import { removeTagsFromString } from "@oute/oute-ds.core.constants";
const CONTENT_TYPES = ["Static", "Dynamic"];

const TextPreviewData = ({ question, onChange, variables }: any) => {
  const onChangeContentType = (e, value) => {
    if (value === "Static") {
      onChange({
        settings: {
          ...question?.settings,
          contentType: "Static",
          dynamicContent: {},
        },
      });
      return;
    }
    if (value === "Dynamic") {
      onChange({
        settings: {
          ...question?.settings,
          contentType: "Dynamic",
          staticContent: "",
        },
      });
      return;
    }
  };
  return (
    <div style={getMainContainerStyles()}>
      <ODSAutoComplete
        variant="black"
        fullWidth
        options={CONTENT_TYPES}
        textFieldProps={{
          size: "medium",
          placeholder: "Select content type",
        }}
        value={question?.settings?.contentType || CONTENT_TYPES[0]}
        onChange={onChangeContentType}
      />
      {question?.settings?.contentType === "Static" && (
        <>
          <Editor
            editable={true}
            value={question?.settings?.staticContent}
            placeholder="Type the message your users will see. This is a static, read-only field — they won’t be able to edit it during form filling."
            onChange={(val) => {
              onChange({
                settings: {
                  ...question?.settings,
                  staticContent: val,
                },
              });
            }}
            style={editorStyles()}
            testId={"text-preview-editor"}
            maxLength={1000}
          />
          <span style={{ alignSelf: "flex-end" }}>
            {removeTagsFromString(question?.settings?.staticContent)?.length}
            /1000
          </span>
        </>
      )}
      {question?.settings?.contentType === "Dynamic" && (
        <FormulaBar
          wrapContent
          isReadOnly={false}
          placeholder="Pick a variable or reference from previous answers."
          hideInputBorders={false}
          slotProps={{
            conatiner: {
              style: {
                background: "#FFF",
                border: "2px solid red",
                borderRadius: "0.75em",
              },
            },
          }}
          defaultInputContent={question?.settings?.dynamicContent?.blocks || []}
          onInputContentChanged={(content) => {
            onChange({
              settings: {
                ...question?.settings,
                dynamicContent: {
                  type: "fx",
                  blocks: content,
                },
              },
            });
          }}
          variables={variables}
        />
      )}
    </div>
  );
};

export default TextPreviewData;
