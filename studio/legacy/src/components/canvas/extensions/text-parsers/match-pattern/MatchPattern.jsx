import React, {
  forwardRef,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import TabContainer from "../../common-components/TabContainer";
import Configure from "../match-pattern/tabs/configure/Configure";
import MATCH_PATTERN_NODE from "./constant";

const MatchPattern = forwardRef(
  ({ data, variables, onSave = () => {} }, ref) => {
    //   Global match
    const [globalMatch, setGlobalMatch] = useState(data?.globalMatch || false);
    // Case sensitive
    const [caseSensitive, setCaseSensitive] = useState(
      data?.caseSensitive || false
    );
    // Multiline
    const [multiline, setMultiline] = useState(data?.multiline || false);
    // Singleline
    const [singleline, setSingleline] = useState(data?.singleline || false);

    const [continueExecutionIfNoMatch, setContinueExecutionIfNoMatch] =
      useState(data?.continueExecutionIfNoMatch || false);

    const [pattern, setPattern] = useState(data?.pattern || "");

    const [text, setText] = useState(data?.text || "");

    const tabs = useMemo(() => {
      return [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            globalMatch,
            caseSensitive,
            multiline,
            singleline,
            continueExecutionIfNoMatch,
            variables,
            pattern,
            setPattern,
            text,
            setText,
            setGlobalMatch,
            setCaseSensitive,
            setMultiline,
            setSingleline,
            setContinueExecutionIfNoMatch,
          },
        },
      ];
    }, [
      caseSensitive,
      continueExecutionIfNoMatch,
      globalMatch,
      multiline,
      pattern,
      singleline,
      text,
      variables,
    ]);

    useImperativeHandle(ref, () => {
      return {
        getData: () => {
          return {
            globalMatch,
            caseSensitive,
            multiline,
            singleline,
            continueExecutionIfNoMatch,
            pattern,
            text,
          };
        },
      };
    }, [
      caseSensitive,
      continueExecutionIfNoMatch,
      globalMatch,
      multiline,
      pattern,
      singleline,
      text,
    ]);

    return (
      // <div className={classes["match-pattern-advanced-container"]}>
      //   <div className={classes["top-child"]}>
      //     <ODSSwitch
      //       labelText={
      //         <ODSAdvancedLabel
      //           labelText="Global Match"
      //           labelProps={{ variant: "body1" }}
      //           sx={{ width: "auto" }}
      //         />
      //       }
      //       checked={globalMatch}
      //       onChange={(e) => {
      //         setGlobalMatch(e.target.checked);
      //       }}
      //     />
      //     <ODSSwitch
      //       labelText={
      //         <ODSAdvancedLabel
      //           labelText="Case Sensitive"
      //           labelProps={{ variant: "body1" }}
      //           sx={{ width: "auto" }}
      //         />
      //       }
      //       checked={caseSensitive}
      //       onChange={(e) => {
      //         setCaseSensitive(e.target.checked);
      //       }}
      //     />
      //     <ODSSwitch
      //       labelText={
      //         <ODSAdvancedLabel
      //           labelText="Multiline"
      //           labelProps={{ variant: "body1" }}
      //           sx={{ width: "auto" }}
      //         />
      //       }
      //       checked={multiline}
      //       onChange={(e) => {
      //         setMultiline(e.target.checked);
      //       }}
      //     />
      //     <ODSSwitch
      //       labelText={
      //         <ODSAdvancedLabel
      //           labelText="Singleline"
      //           labelProps={{ variant: "body1" }}
      //           sx={{ width: "auto" }}
      //         />
      //       }
      //       checked={singleline}
      //       onChange={(e) => {
      //         setSingleline(e.target.checked);
      //       }}
      //     />
      //   </div>
      //   <div className={classes["bottom-child"]}>
      //     <ODSSwitch
      //       labelText={
      //         <ODSAdvancedLabel
      //           labelText="Continue the execution of the route even if the module finds no matches"
      //           labelProps={{ variant: "body1", sx: { width: "auto" } }}
      //         />
      //       }
      //       checked={continueExecutionIfNoMatch}
      //       onChange={(e) => {
      //         setContinueExecutionIfNoMatch(e.target.checked);
      //       }}
      //     />
      //     <FormulaBar
      //       variables={variables}
      //       placeholder="Pattern"
      //       defaultInputContent={pattern?.blocks || []}
      //       onInputContentChanged={(blocks) => setPattern({ type: "fx", blocks })}
      //     />
      //     <FormulaBar
      //       variables={variables}
      //       placeholder="Text"
      //       defaultInputContent={text?.blocks || []}
      //       onInputContentChanged={(blocks) => setText({ type: "fx", blocks })}
      //     />
      //   </div>
      // </div>

      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: MATCH_PATTERN_NODE.dark,
          light: MATCH_PATTERN_NODE.light,
          foreground: MATCH_PATTERN_NODE.foreground,
        }}
        validTabIndices={[0]}
        onSave={onSave}
        showCommonActionFooter={true}
        validateTabs={true}
      />
    );
  }
);

export default MatchPattern;
