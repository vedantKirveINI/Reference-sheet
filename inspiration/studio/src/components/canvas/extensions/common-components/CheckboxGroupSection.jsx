import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import classes from "./CheckboxGroupSection.module.css";

import InfoDisplay from "./InfoDisplay";
// import { ODSCheckbox } from "@src/module/ods";
// import { ODSTextField } from "@src/module/ods";
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
            //     
            //   />
            // </ODSPopover>
          )}
        </div>
      </div>
    );
  }
);

export default CheckboxGroupSection;
