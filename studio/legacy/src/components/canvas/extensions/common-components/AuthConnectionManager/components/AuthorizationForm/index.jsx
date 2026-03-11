import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

import classes from "./index.module.css";
import { AUTH_TYPES } from "../../../../../utils/constants";
import { canvasSDKServices } from "../../../../../services/canvasSDKServices";
// import { showAlert } from "oute-ds-alert";
import { showAlert } from "@src/module/ods";
import { QuestionFiller } from "@oute/oute-ds.skeleton.question-filler";
import { Mode, ViewPort } from "../../../../../../../module/constants";

const DEFAULT_THEME = {
  name: "Default Theme",
  styles: {
    fontFamily: "Helvetica Neue",
    questionSize: "M",
    buttonCorners: "rounded",
    textAlignment: "center",
    questions: "#263238",
    description: "#263238",
    answer: "#263238",
    buttons: "#000000",
    buttonText: "#FFFFFF",
    backgroundColor: "#FFFFFF",
    backgroundImage: "",
  },
};
const getAuthTypeTitle = (auth_type) => {
  if (auth_type === AUTH_TYPES.APIKEY) return "API Authorization";

  if (auth_type === AUTH_TYPES.CUSTOM) return "Custom Authorization";

  if (auth_type === AUTH_TYPES.BASIC) return "Basic Authorization";

  return null;
};

const AuthorizationForm = forwardRef(
  (
    {
      authorization = {},
      formId,
      parentId,
      projectId,
      workspaceId,
      onSubmit = () => {},
    },
    ref
  ) => {
    const title = getAuthTypeTitle(authorization?.authorization_type);
    const fillerRef = useRef();
    const [flow, setFlow] = useState({});
    const [result, setResult] = useState({});
    const [taskGraph, setTaskGraph] = useState([]);
    const [resourceIds, setResourceIds] = useState({
      assetId: formId,
      projectId: projectId,
      workspaceId: workspaceId,
      parentId: parentId,
      canvasId: "",
      _id: "",
    });
    const isFormLoaded = Object.keys(flow)?.length > 0;

    const getPublishedByAsset = useCallback(async () => {
      if (!formId) {
        showAlert({
          type: "error",
          message: "Form is not valid",
        });
        return;
      }

      const { result, result: { flow = {}, task_graph = [] } = {} } =
        await canvasSDKServices.getPublishedByAsset({
          asset_id: formId,
        });
      const canvasId = result?.canvas_id;
      setResourceIds((prevIds) => {
        return {
          ...prevIds,
          canvasId: canvasId,
        };
      });
      setResult(result);
      setFlow(flow);
      setTaskGraph(task_graph);
    }, [formId]);

    useEffect(() => {
      getPublishedByAsset();
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        onSubmit: async () => {
          await fillerRef?.current?.onSubmit();
        },
      }),
      [fillerRef]
    );

    return (
      <>
        {title ? (
          <>
            {/* <p
              className={classes["title"]}
              data-testid="existing-connections-title"
            >
              {title}
            </p> */}
            <div
              style={{
                fontSize: "10px",
                display: "flex",
                flex: 1,
                overflowY: "scroll",
              }}
            >
              {!isFormLoaded ? (
                <>loading...</>
              ) : (
                <QuestionFiller
                  ref={fillerRef}
                  key="form-node"
                  mode={Mode.CLASSIC}
                  taskGraph={taskGraph}
                  questions={flow}
                  viewPort={ViewPort.MOBILE}
                  variables={{}}
                  resourceIds={resourceIds}
                  showFooter={false}
                  hideQuestionIndex={true}
                  theme={DEFAULT_THEME}
                  onSuccess={async (answers) =>
                    await onSubmit({
                      state: answers,
                      flow: { ...result, id: result?._id },
                    })
                  }
                  showEndingScreen={false}
                />
              )}
            </div>
          </>
        ) : (
          <p className={classes["title"]}>
            Authorization type not recognized. Please reach out to support for
            assistance.
          </p>
        )}
      </>
    );
  }
);

export default AuthorizationForm;
