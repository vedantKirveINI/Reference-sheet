import React from "react";
// import { ODSIcon } from '@src/module/ods';
// import { ODSLabel } from '@src/module/ods';
import { ODSIcon, ODSLabel } from "@src/module/ods";
import classes from "./component-not-found.module.css";
import images from "../../../assets/images";

const ComponentNotFound = () => {
  return (
    <div className={classes["component-not-found"]}>
      <ODSIcon imageProps={{ src: images.componentNotFound }} />
      <ODSLabel variant="h6">Component not found</ODSLabel>
    </div>
  );
};

export default ComponentNotFound;
