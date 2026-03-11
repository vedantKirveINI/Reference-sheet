import React, { useEffect } from "react";
import classes from "../../AgentComposer.module.css";
// import { ODSLabel } from '@src/module/ods';
// import { ODSTextField } from '@src/module/ods';
import { ODSLabel, ODSTextField } from "@src/module/ods";

export const Initialize = ({
  data,
  onChange = () => {},
  setValidTabIndices,
  setError,
}) => {
  useEffect(() => {
    const isValid = !!data?.name;

    setValidTabIndices((prev) => {
      if (isValid) {
        if (!prev.includes(0)) {
          return [...prev, 0];
        }
        return prev;
      } else {
        return prev.filter((index) => index !== 0);
      }
    });
    setError((prev) => ({
      ...prev,
      0: isValid ? [] : ["Tiny Composer name is required"],
    }));
  }, [data, setValidTabIndices, setError]);
  return (
    <div className={classes["initialize-container"]}>
      <ODSLabel variant="body1" required>
        Name Tiny Composer
      </ODSLabel>
      <div className={classes["sub-container"]}>
        <ODSLabel variant="body2" color="#607D8B">
          Give a suitable name to tiny composer that will help you find your
          composer on canvas
        </ODSLabel>
        <ODSTextField
          className="black"
          value={data?.name}
          autoFocus
          onFocus={(e) => e.target.select()}
          data-testid="tiny-composer-name"
          placeholder="Compose highly curated emails"
          onChange={(e) => {
            onChange("name", e.target.value);
          }}
          fullWidth
        />
      </div>
    </div>
  );
};
