import React, {
  useState,
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import { ODSDialog } from "@src/module/ods";
import { toast } from "sonner";
import _ from "lodash";
import {
  Mode,
  ViewPort,
  removeTagsFromString,
  createUID,
} from "@oute/oute-ds.core.constants";
import { QuestionFiller } from "@oute/oute-ds.skeleton.question-filler";
import canvasSDKServices from "../services/canvas-sdk-services";
import Footer from "./footer";
import { getToken } from "../services/base-config";
import { getPostHookMeta } from "../utils/getPostHookMeta";
import { AUTHORIZE_DATA_URL } from "../constants/constant";

type TFormDialogProps = {
  open?: boolean;
  onClose: () => void;
  parentId: string;
  projectId: string;
  workspaceId: string;
  formId: string;
  onSave: () => void;
  setConnectionName: React.Dispatch<React.SetStateAction<string>>;
  question?: any;
  viewPort?: string;
  onNewConnectionAdd?: any;
  connectionName?: string;
};

const FormContent = forwardRef(
  (
    {
      formId,
      parentId,
      projectId,
      workspaceId,
      onClose,
      onSave,
    }: TFormDialogProps,
    ref: React.Ref<any>
  ): any => {
    const fillerRef = useRef<any>();
    const [flow, setFlow] = useState({});
    const [result, setResult] = useState<any>({});
    const [taskGraph, setTaskGraph] = useState([]);
    const [theme, setTheme] = useState({});
    const [resourceIds, setResourceIds] = useState({
      assetId: formId,
      projectId: projectId,
      workspaceId: workspaceId,
      parentId: parentId,
      canvasId: "",
      _id: "",
    });

    const getPublishedByAsset = async () => {
      if (!formId) {
        toast.error("Validation Error", {
          description: "Form is not valid",
        });
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const {
        // eslint-disable-next-line @typescript-eslint/no-shadow
        result,
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-shadow
        result: { flow = {}, task_graph = [], meta = {} } = {},
      } = await canvasSDKServices.getPublishedByAsset({
        asset_id: formId,
      });
      const canvasId = result.canvas_id;
      const parsedTheme = JSON.parse(meta._t);
      setResourceIds((prevIds) => {
        return {
          ...prevIds,
          canvasId: canvasId,
        };
      });
      setTheme(parsedTheme);
      setResult(result);
      setFlow(flow);
      setTaskGraph(task_graph);
    };

    useImperativeHandle(
      ref,
      () => ({
        getData: () => {
          return {
            state: fillerRef?.current?.getData(),
            flow: { ...result, id: result?._id },
          };
        },
      }),
      [fillerRef, result]
    );

    useEffect(() => {
      getPublishedByAsset();
    }, []);

    if (!Object.keys(flow)?.length) {
      return <div>Loading...</div>;
    }

    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        data-testid="connection-form-dialog-content"
      >
        <QuestionFiller
          ref={fillerRef}
          key="form-node"
          mode={Mode.CLASSIC}
          taskGraph={taskGraph}
          questions={flow}
          theme={theme}
          viewPort={ViewPort.MOBILE}
          variables={{}}
          resourceIds={resourceIds}
          showFooter={false}
        />
        <Footer onDiscard={onClose} onSave={onSave} />
      </div>
    );
  }
);

const FormDialog = ({
  open,
  onClose,
  formId,
  parentId,
  projectId,
  workspaceId,
  question = {},
  viewPort,
  onNewConnectionAdd,
  setConnectionName,
  connectionName,
}: Omit<TFormDialogProps, "onSave">) => {
  const formContentRef = useRef<any>();
  const onSave = async () => {
    const data = formContentRef.current && formContentRef.current?.getData();
    if (!data) return;

    const questionIDS: any[] = Object.keys(data?.state);
    const nodes = data?.flow?.flow;

    const configData = {};

    questionIDS.forEach((id) => {
      const configDataKey = removeTagsFromString(nodes[id]?.config?.question);
      configData[configDataKey] = data?.state[id]?.response;
    });

    const postHookMeta = await getPostHookMeta(question, configData);
    if (!_.isEmpty(postHookMeta)) {
      configData["post_hook_meta"] = postHookMeta;
    }

    const body = {
      name: connectionName || `connection-form` + ` - ${new Date().getTime()}`,
      authorization_id: question?.authorization_id,
      request_id: createUID(),
      parent_id: projectId,
      workspace_id: workspaceId,
      configs: configData,
      state: "ACTIVE",
    };

    const postOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        token: getToken(),
      },
      body: JSON.stringify(body),
    };

    const res = await fetch(AUTHORIZE_DATA_URL, postOptions);

    if (!res.ok) {
      toast.error("Connection Error", {
        description: "Something went wrong",
      });
    } else {
      toast.success("API KEY Successfully Saved!");
      onNewConnectionAdd();
      onClose();
    }
  };
  if (!open) return <></>;

  const getDialogLeftPosition = () => {
    const windowWidth = window.innerWidth;

    const extra = viewPort === ViewPort.MOBILE ? 243 : 400;
    const positionFromLeft = windowWidth / 2 + extra;

    if (positionFromLeft + 486 >= windowWidth) {
      return {
        right: 70,
      };
    }
    return { left: positionFromLeft };
  };

  const dialogCoordinates = getDialogLeftPosition();

  return (
    <ODSDialog
      open={open}
      dialogWidth="400px"
      dialogHeight="524px"
      dialogTitle="Add connection"
      onClose={onClose}
      transition="none"
      data-testid="connection-form-dialog"
      dialogContent={
        <FormContent
          ref={formContentRef}
          formId={formId}
          onClose={onClose}
          parentId={parentId}
          projectId={projectId}
          workspaceId={workspaceId}
          setConnectionName={setConnectionName}
          onSave={onSave}
          connectionName={connectionName}
        />
      }
      dialogActions={false}
      removeContentPadding
      dialogCoordinates={dialogCoordinates}
      dialogPosition="coordinates"
    />
  );
};

export default FormDialog;
