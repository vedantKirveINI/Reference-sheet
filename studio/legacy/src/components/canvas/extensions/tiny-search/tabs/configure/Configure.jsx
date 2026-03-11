import { useEffect } from "react";
import classes from "./configure.module.css";
// import ODSAutoComplete from "oute-ds-autocomplete";
// import ODSSwitch from "oute-ds-switch";
// import Radio from "oute-ds-radio";
// import RadioGroup from "oute-ds-radio-group";
// import { FormulaBar } from "oute-ds-formula-bar";
import { ODSSwitch, ODSRadio as Radio, ODSRadioGroup as RadioGroup, ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { FormFieldWrapper } from "./form-field-wrapper";
// import { LANGUAGE_OPTIONS } from "../../utils";

const TIME_RANGE_OPTIONS = ["Year", "Month", "Day"];

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
      // language: !data?.language,
      numberOfResults: !data?.numberOfResults?.blocks?.length,
      dateTimeRange: !data?.timeRange,
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
      // if (validationErrors?.language) {
      //   errorMessages.push("Language is required");
      // }
      if (validationErrors?.numberOfResults) {
        errorMessages.push("Number of Result is required");
      }
      if (validationErrors?.dateTimeRange) {
        errorMessages.push("Time Range is required");
      }
      return {
        ...prev,
        0: errorMessages,
      };
    });
  }, [data, setError, setValidTabIndices]);

  // const selectedLanguage = data?.language
  //   ? LANGUAGE_OPTIONS.find((lang) => lang?.id === data?.language)
  //   : null;

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

      {/* <FormFieldWrapper
        heading="Language"
        label="Select the language in which you'd like the search results to appear."
        isRequired={true}
      >
        <ODSAutoComplete
          options={LANGUAGE_OPTIONS}
          variant="black"
          value={selectedLanguage}
          onChange={(e, value) => {
            onChange("language", value?.id);
          }}
          isOptionEqualToValue={(option, value) => {
            return option?.id === value?.id;
          }}
          textFieldProps={{
            inputProps: {
              placeholder: "Select a language",
              "data-testid": "select-language-input",
            },
          }}
          fullWidth={true}
          blurOnSelect={true}
          searchable={true}
        />
      </FormFieldWrapper> */}

      <FormFieldWrapper
        heading="Number of results"
        label="Specify how many search results you want to receive. The default is usually 10, but you can choose more or fewer based on your needs."
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

      <FormFieldWrapper
        heading="Time range"
        label="Select the time range from which you want to see search results"
        isRequired={true}
      >
        <RadioGroup
          value={
            data?.timeRange
              ?.split(" ")
              .map(
                (word) =>
                  word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              )
              .join(" ") || null
          }
          onChange={(e) => {
            onChange("timeRange", e.target.value.toLocaleLowerCase());
          }}
          row
          sx={{
            gap: "1.5rem",
          }}
        >
          {TIME_RANGE_OPTIONS.map((data, index) => (
            <Radio
              key={`${data}_${index}`}
              labelText={data}
              formControlLabelProps={{
                value: data,
                sx: {
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.75rem",
                  alignItems: "center",
                  margin: 0,
                  border: "1.5px solid transparent",
                  ...(data?.toLocaleLowerCase() === data?.timeRange && {
                    borderColor: "#000",
                    background: "rgba(33, 33, 33, 0.12)",
                  }),
                  "& .Mui-checked": {
                    color: "#000 !important",
                  },
                },
              }}
              radioProps={{
                sx: {
                  padding: "0rem !important",
                },
                "data-testid": `search-configure-time-range-${data?.toLowerCase()}`,
              }}
              labelProps={{
                variant: "body1",
              }}
            />
          ))}
        </RadioGroup>
      </FormFieldWrapper>

      <FormFieldWrapper
        heading="Safe search"
        label="Toggle this option to enable or disable safe search. When on, it filters out explicit or harmful content from the search results."
        isRequired={false}
        flexDirection="row"
      >
        <ODSSwitch
          checked={data?.safeSearch == 1}
          onChange={(e) => {
            onChange("safeSearch", e.target.checked ? 1 : 0);
          }}
          variant="black"
          size="medium"
          data-testid="safe-search-switch"
        />
      </FormFieldWrapper>
    </div>
  );
};

export default Configure;
