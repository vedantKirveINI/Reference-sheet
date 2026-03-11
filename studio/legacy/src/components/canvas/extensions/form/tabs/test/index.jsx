import React, { useRef } from "react";

import classes from "./index.module.css";

// import ODSButton from "oute-ds-button";
import { ODSButton } from "@src/module/ods";
import CommonTestModule from "../../../common-components/CommonTestModule";
import { getCanvasTheme } from "../../../../../../module/constants";

export const FormTestModule = ({
  node = {},
  getGoData = () => {},
  variables = {},
  workspaceId,
  assetId,
  projectId,
  parentId,
  canvasRef,
  annotation,
}) => {
  const testMoudleRef = useRef();
  const canvasTheme = getCanvasTheme();
  return (
    <div className={classes["form-test-module-container"]}>
      <CommonTestModule
        canvasRef={canvasRef}
        annotation={annotation}
        ref={testMoudleRef}
        node={node}
        go_data={getGoData()}
        variables={variables}
        workspaceId={workspaceId}
        assetId={assetId}
        projectId={projectId}
        parentId={parentId}
      />
      <div
        className={classes["form-test-module-footer"]}
        data-testid="form-test-module-footer"
        style={{
          borderTop: `0.75px solid ${canvasTheme.dark}`,
        }}
      >
        <ODSButton
          size="large"
          label="TEST"
          variant="black"
          onClick={() => {
            if (testMoudleRef.current) testMoudleRef.current.beginTest();
          }}
          data-testid="test-integration-button"
        />
      </div>
    </div>
  );
};
