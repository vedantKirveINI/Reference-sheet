/**
 * @deprecated Use SendEmailToYourselfV2 from send-email-to-yourself-v2/ instead.
 * This component uses the legacy TabContainer pattern and will be removed in a future version.
 * All new implementations should use the WizardDrawer-based SendEmailToYourselfV2.
 */
import {
  forwardRef,
  useImperativeHandle,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import TabContainer from "../common-components/TabContainer";
import SEND_EMAIL_TO_YOURSELF_NODE from "./constant";
import Configure from "./tabs/configure/Configure";
import CommonTestModuleV3 from "../common-components/CommonTestModuleV3";
import userServices from "../../services/userSdkServices";

const SendEmailToYourself = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data = {},
      variables,
      onSave = () => {},
      nodeData,
      workspaceId,
      assetId,
      projectId,
      parentId,
    },
    ref
  ) => {
    const [subject, setSubject] = useState(data?.subject);
    const [bodyType, setBodyType] = useState(data?.bodyType);
    const [body, setBody] = useState(data?.body);
    const [state, setState] = useState(data?.state?.blocks);
    const [templateId, setTemplateId] = useState(data?.templateId);
    const [validTabIndices, setValidTabIndices] = useState([0]);
    const [user, setUser] = useState();
    const testModuleRef = useRef();

    const getUser = async () => {
      try {
        const res = await userServices.getUser();
        setUser(res?.result);
      } catch (e) {}
    };
    useEffect(() => {
      getUser();
    }, []);

    const getData = useCallback(() => {
      const data = {
        templateId,
        to: {
          type: "fx",
          blocks: [
            {
              type: "PRIMITIVES",
              value: user?.email_id,
            },
          ],
        },
        subject,
        bodyType,
        body:
          bodyType === "Template"
            ? {
                type: "fx",
                blocks: [
                  {
                    type: "PRIMITIVES",
                    value: body,
                  },
                ],
              }
            : body,
        state: state,
      };
      return data;
    }, [subject, state, body, bodyType, user]);

    const tabs = useMemo(
      () => [
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            variables,
            subject,
            setSubject,
            bodyType,
            setBodyType,
            body,
            setBody,
            state,
            setState,
            workspaceId,
            templateId,
            setTemplateId,
            setValidTabIndices,
          },
        },
        {
          label: "TEST",
          panelComponent: CommonTestModuleV3,
          panelComponentProps: {
            canvasRef,
            annotation,
            ref: testModuleRef,
            go_data: getData(),
            variables,
            workspaceId: workspaceId,
            assetId: assetId,
            projectId: projectId,
            parentId: parentId,
            node: nodeData || SEND_EMAIL_TO_YOURSELF_NODE,
            onTestComplete: () => {
              setValidTabIndices([0, 1]);
            },
            resultType: "json",
            persistTestData: true,
            inputMode: "auto",
            useV3Input: true,
            useV4Result: true,
            autoContextualContent: true,
          },
        },
      ],
      [
        annotation,
        assetId,
        canvasRef,
        getData,
        nodeData,
        parentId,
        subject,
        bodyType,
        body,
        state,
        templateId,
        projectId,
        variables,
        workspaceId,
      ]
    );

    useImperativeHandle(
      ref,
      () => ({
        getData,
      }),
      [getData]
    );

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: SEND_EMAIL_TO_YOURSELF_NODE.dark,
          light: SEND_EMAIL_TO_YOURSELF_NODE.light,
          foreground: SEND_EMAIL_TO_YOURSELF_NODE.foreground,
        }}
        hasTestTab={SEND_EMAIL_TO_YOURSELF_NODE.hasTestModule}
        validTabIndices={validTabIndices}
        onSave={onSave}
        onTest={() => {
          testModuleRef?.current.beginTest();
        }}
        showCommonActionFooter={true}
        validateTabs={true}
        showBottomBorder={true}
      />
    );
  }
);

export default SendEmailToYourself;
