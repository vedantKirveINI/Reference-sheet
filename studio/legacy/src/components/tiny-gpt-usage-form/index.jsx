import React from "react";
import classes from "./index.module.css";
import FormEmbed from "tc-form-embed";
import { useAuth } from "@oute/oute-ds.common.molecule.tiny-auth";

export const TinyGPTUsageForm = () => {
  const { user } = useAuth();
  return (
    <div className={classes["usage-form-root"]}>
      <FormEmbed
        url={`https://forms-pp.oute.app/VxpwxRtKd/CARD?email=${user?.email}`}
      />
    </div>
  );
};
