import { useEffect } from "react";
import classes from "./configure.module.css";
// import { FormulaBar } from "oute-ds-formula-bar";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { FormFieldWrapper } from "./form-field-wrapper";

const Configure = ({
  data,
  variables,
  setError,
  setValidTabIndices,
  onChange = () => {},
}) => {
  useEffect(() => {
    const validationErrors = {
      searchQuery: !data?.searchQuery?.blocks?.length,
      numberOfResults: !data?.numberOfResults?.blocks?.length,
    };

    const hasErrors = Object.values(validationErrors).some((error) => error);

    setValidTabIndices((prev) => {
      if (hasErrors) {
        return prev?.filter((ele) => ele != 0);
      }
      if (prev?.includes(0)) {
        return prev;
      }
      return [...prev, 0];
    });

    setError((prev) => {
      let errorMessages = [];
      if (validationErrors?.searchQuery) {
        errorMessages.push("Search Query is required");
      }
      if (validationErrors?.numberOfResults) {
        errorMessages.push("Number of Result is required");
      }
      return {
        ...prev,
        0: errorMessages,
      };
    });
  }, [data, setError, setValidTabIndices]);

  return (
    <div className={classes["configure-container"]}>
      <FormFieldWrapper
        heading="Search query"
        label="Enter the text or query you want to search for. This could be a keyword, phrase, or topic you'd like to explore across search engines."
        isRequired={true}
      >
        <FormulaBar
          wrapContent={true}
          placeholder="Enter your query"
          variables={variables}
          defaultInputContent={data?.searchQuery?.blocks || []}
          onInputContentChanged={(content) => {
            onChange("searchQuery", {
              type: "fx",
              blocks: content,
            });
          }}
          slotProps={{
            container: { "data-testid": "search-query" },
          }}
        />
      </FormFieldWrapper>

      <FormFieldWrapper
        heading="Number of results"
        label="Specify the number of search results you would like to receive, up to a maximum of 100."
        isRequired={true}
      >
        <FormulaBar
          wrapContent={true}
          placeholder="E.g. 10"
          variables={variables}
          defaultInputContent={data?.numberOfResults?.blocks || []}
          onInputContentChanged={(content) => {
            onChange("numberOfResults", {
              type: "fx",
              blocks: content,
            });
          }}
          slotProps={{
            container: { "data-testid": "number-of-results" },
          }}
        />
      </FormFieldWrapper>
    </div>
  );
};

export default Configure;
