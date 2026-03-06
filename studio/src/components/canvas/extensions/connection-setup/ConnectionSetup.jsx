import {
  useState,
  useEffect,
  forwardRef,
  useMemo,
  useImperativeHandle,
} from "react";
// import { ODSDialog as Dialog } from "@src/module/ods";
import { ODSDialog as Dialog } from "@src/module/ods";
import { QuestionType } from "../../../../module/constants";
import { CreateEventConnection } from "@src/module";
import classes from "./ConnectionSetup.module.css";
import authorizationSDKServices from "./services/authorizationSdkService";

import TabContainer from "../common-components/TabContainer";
import CONNECTION_SETUP_NODE, { CONNECTION_SETUP_NODE_THEME } from "./constant";
import { AuthorizationTab } from "./tabs/authorization";
import { InputTab } from "./tabs/inputs";
import { TriggerTab } from "./tabs/trigger";

const DEFAULT_QUESTION_TITLE = "Connection";
const DEFAULT_QUESTION_DESCRIPTION =
  "Description here, recall information with @";

const ConnectionSetup = forwardRef(
  ({ projectId, workspaceId, data, variables, eventType }, ref) => {
    const [question, setQuestion] = useState({
      ...data,
      question: DEFAULT_QUESTION_TITLE,
      description: DEFAULT_QUESTION_DESCRIPTION,
      type: QuestionType.CONNECTION,
    });
    const [authorizations, setAuthorizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddAuthorizationDialog, setShowAddAuthorizationDialog] =
      useState(false);
    const [selectedConnection, setSelectedConnection] = useState(
      data?.authorization ?? null
    );

    const [inputs, setInputs] = useState(data?.inputs || []);

    const [triggerData, setTriggerData] = useState({
      event_src: data?.event_src || "",
      event_type: data?.event_type || "",
    });

    useImperativeHandle(
      ref,
      () => ({
        getData: () => {
          const authorization = question?.authorization || {};
          return {
            inputs: inputs,
            type: QuestionType.CONNECTION,
            authorization_id: authorization._id || authorization.id,
            authorization_type: authorization.auth_type,
            outputs: authorization.outputs,
            configs: authorization.configs,
            question: DEFAULT_QUESTION_TITLE,
            description: DEFAULT_QUESTION_DESCRIPTION,
            authorization: {
              ...authorization,
              id: authorization?._id,
            },
            ...triggerData,
          };
        },
      }),
      [inputs, question, triggerData]
    );

    const fetchUserConnection = async () => {
      // @rahul - no need for then, directly use await and in next line set states
      await authorizationSDKServices
        .getByParent({
          parent_id: projectId,
        })
        .then((res) => {
          setAuthorizations([...res?.result]);
          setLoading(false);
        });
    };

    const setQuestionHandler = (key, val) => {
      const updatedQuestion = { ...question, [key]: val };

      setQuestion(updatedQuestion);
    };

    const onCreateEventConnectionUpdate = async () => {
      await fetchUserConnection();
      setShowAddAuthorizationDialog(false);
    };

    const onTriggerDataChange = (key, value) => {
      setTriggerData({ ...triggerData, [key]: value });
    };

    const onInputsChange = (updatedValue) => {
      setInputs(updatedValue);
    };

    useEffect(() => {
      fetchUserConnection();
    }, []);

    const tabData = useMemo(() => {
      const data = [
        {
          label: "AUTHORISATION",
          panelComponent: AuthorizationTab,
          panelComponentProps: {
            selectedConnection,
            setSelectedConnection,
            authorizations,
            loading,
            setShowAddAuthorizationDialog,
            setQuestionHandler,
          },
        },
        {
          label: "INPUT",
          panelComponent: InputTab,
          panelComponentProps: {
            variables,
            inputs,
            onInputsChange,
          },
        },
      ];

      if (eventType && eventType === "TRIGGER") {
        data.splice(1, 0, {
          label: "TRIGGER",
          panelComponent: TriggerTab,
          panelComponentProps: {
            triggerData,
            onTriggerDataChange,
          },
        });
      }

      return data;
    }, [
      selectedConnection,
      setSelectedConnection,
      authorizations,
      loading,
      setShowAddAuthorizationDialog,
      setQuestionHandler,
      variables,
      inputs,
      onInputsChange,
      eventType,
    ]);

    return (
      <>
        <div className={classes["connection-setup-container"]}>
          <TabContainer
            tabs={tabData || []}
            colorPalette={{
              dark: CONNECTION_SETUP_NODE_THEME.dark,
              light: CONNECTION_SETUP_NODE_THEME.light,
              foreground: CONNECTION_SETUP_NODE_THEME.foreground,
            }}
            hasTestTab={CONNECTION_SETUP_NODE.hasTestModule}
            validTabIndices={[]}
            onSave={() => {}}
            showCommonActionFooter={false}
            validateTabs={false}
          />
        </div>
        <Dialog
          open={showAddAuthorizationDialog}
          onClose={() => {
            setShowAddAuthorizationDialog(false);
          }}
          showFullscreenIcon={false}
          dialogTitle="Create Authorization"
          dialogContent={
            <CreateEventConnection
              parent_id={projectId}
              workspace_id={workspaceId}
              onUpdate={onCreateEventConnectionUpdate}
            />
          }
          dialogHeight="auto"
          dialogWidth="750px"
        />
      </>
    );
  }
);

export default ConnectionSetup;
