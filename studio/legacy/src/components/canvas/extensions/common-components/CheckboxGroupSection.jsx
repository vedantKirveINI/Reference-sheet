import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import classes from "./CheckboxGroupSection.module.css";

import InfoDisplay from "./InfoDisplay";
// import ODSCheckbox from "oute-ds-checkbox";
// import ODSTextField from "oute-ds-text-field";
import { ODSCheckbox, ODSTextField } from "@src/module/ods";

const CheckboxGroupSection = forwardRef(
  (
    {
      defaultSelectedOptions = [],
      defaultOtherContent = "",
      title = "",
      description = "",
      options = {},
    },
    ref
  ) => {
    const [selectedOptions, setSelectedOptions] = useState(
      defaultSelectedOptions || []
    );
    const [otherContent, setOtherContent] = useState(defaultOtherContent || "");

    useImperativeHandle(ref, () => {
      return {
        selectedOptions: selectedOptions,
        otherContent: otherContent,
      };
    }, [selectedOptions, otherContent]);

    const handleCheckboxChange = useCallback((event) => {
      const { name, checked } = event.target;

      if (checked) {
        setSelectedOptions((prev) => [...prev, name]);
      } else {
        setSelectedOptions((prev) => prev.filter((option) => option !== name));
      }

      //   if (key === "OTHER") {
      //     setOtherContentEl(
      //       event.target.checked ? event.target.parentElement : null
      //     );
      //   }
    }, []);

    return (
      <div
        className={classes["info-display-container"]}
        data-testid="checkbox-group-section"
      >
        <InfoDisplay title={title} description={description} />
        <div
          className={classes["source-preference-checkboxes"]}
          data-testid="checkbox-group-section-checkboxes"
        >
          {Object.keys(options).map((key) => {
            return (
              <ODSCheckbox
                key={key}
                labelText={options[key]}
                labelProps={{
                  variant: "body1",
                }}
                name={options[key]}
                defaultChecked={selectedOptions.includes(options[key])}
                onChange={handleCheckboxChange}
                data-testid={`checkbox-group-section-checkbox-${options[key]}`}
              />
            );
          })}
          {selectedOptions.includes(options?.OTHER) && (
            <ODSTextField
              value={otherContent}
              onChange={(e) => setOtherContent(e.target.value)}
              placeholder="Please specify other source preferences"
              multiline
              minRows={4}
              maxRows={4}
              sx={{
                width: "100%",
                borderRadius: "12px",
                border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
                background: "var(--white, #FFF)",
                boxShadow: "0px 0px 0px 0px rgba(122, 124, 141, 0.20)",
                "& .MuiInputBase-input": {
                  padding: "5px",
                  color: "#263238",
                  fontSize: "16px",
                  fontStyle: "normal",
                  fontWeight: 400,
                  lineHeight: "24px",
                  letterSpacing: "0.5px",
                },
              }}
              data-testid="checkbox-group-section-other-source-preference"
            />
            // <ODSPopover
            //   id={popoverId}
            //   open={open}
            //   anchorEl={otherContentEl}
            //   onClose={() => setOtherContentEl(null)}
            //   anchorOrigin={{
            //     vertical: "bottom",
            //     horizontal: "left",
            //   }}
            // >
            //   <ODSTextField
            //     value={sourcePreference?.otherContent || ""}
            //     onChange={(e) =>
            //       setSourcePreference((prevSourcePreference) => {
            //         return {
            //           ...prevSourcePreference,
            //           otherContent: e.target.value,
            //         };
            //       })
            //     }
            //     placeholder="Please specify"
            //     multiline
            //     rows={4}
            //     maxRows={4}
            //     sx={{
            //       width: "400px",
            //       border: "0.75px solid var(--grey-lighten-4, #CFD8DC)",
            //       background: "var(--white, #FFF)",
            //       boxShadow: "0px 0px 0px 0px rgba(122, 124, 141, 0.20)",
            //       "& .MuiInputBase-input": {
            //         padding: "5px",
            //         borderRadius: 0,
            //         color: "#263238",
            //         fontSize: "16px",
            //         fontStyle: "normal",
            //         fontWeight: 400,
            //         lineHeight: "24px",
            //         letterSpacing: "0.5px",
            //       },
            //     }}
            //   />
            // </ODSPopover>
          )}
        </div>
      </div>
    );
  }
);

export default CheckboxGroupSection;
