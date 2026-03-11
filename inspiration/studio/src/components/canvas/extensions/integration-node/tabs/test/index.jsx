import React, { forwardRef, useRef, useImperativeHandle } from "react";

import classes from "./index.module.css";

import { ODSButton } from "@src/module/ods";
import CommonTestModuleV3 from "../../../common-components/CommonTestModuleV3";
import { getCanvasTheme } from "../../../../../../module/constants";

export const FormTestContent = forwardRef(
  (
    {
      node = {},
      getGoData = () => {},
      variables = {},
      workspaceId,
      assetId,
      projectId,
      parentId,
      canvasRef,
      annotation,
    },
    ref,
  ) => {
    const testModuleRef = useRef();

    useImperativeHandle(ref, () => ({
      beginTest: () => {
        if (testModuleRef.current) {
          testModuleRef.current.beginTest();
        }
      },
    }));

    return (
      <div className="w-full h-full flex flex-col p-5">
        <CommonTestModuleV3
          canvasRef={canvasRef}
          annotation={annotation}
          ref={testModuleRef}
          node={node}
          go_data={getGoData()}
          variables={variables}
          workspaceId={workspaceId}
          assetId={assetId}
          projectId={projectId}
          parentId={parentId}
          resultType="json"
          persistTestData={true}
          inputMode="auto"
          useV3Input={true}
          useV4Result={true}
          autoContextualContent={true}
        />
      </div>
    );
  },
);

FormTestContent.displayName = "FormTestContent";

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
      <CommonTestModuleV3
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
        resultType="json"
        persistTestData={true}
        inputMode="auto"
        useV3Input={true}
        useV4Result={true}
        autoContextualContent={true}
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
