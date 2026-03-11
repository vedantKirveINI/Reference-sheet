import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
// import { showAlert } from "oute-ds-alert";
import { showAlert } from "@src/module/ods";
import utility from "oute-services-utility-sdk";

import { DataField, RequestAuthType, RequestBodyType } from "../../classes";

import AuthorizationPanel from "./panelComponents/authorization-panel";
import BodyPanel from "./panelComponents/body-panel";
import HeadersPanel from "./panelComponents/headers-panel";
import ParamsPanel from "./panelComponents/params-panel";
import HTTP_NODE, { AUTH, BODY, HEADER, PARAMS } from "./constant";
import {
  authorizationOptions,
  isCurlCommand,
  methodOptions,
  parsedCurlJSONToHttpData,
  radioGroupData,
  subTypeOptions,
} from "./utils";

import Initialize from "./tabs/initialize/Initialize";
import Configure from "./tabs/configure/Configure";
import TabContainer from "../common-components/TabContainer";
import CommonTestModule from "../common-components/CommonTestModule";
import { addIndices } from "../extension-utils";

const Http = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data,
      nodeData,
      variables = {},
      onSave = () => {},
      workspaceId,
      assetId,
      projectId,
      parentId,
    },
    ref
  ) => {
    // const tabRef = useRef();
    const formulaBarRef = useRef();
    const testModuleRef = useRef();

    // const [isRunning, setIsRunning] = useState(false);
    const [url, setUrl] = useState(data.url || {});

    const [queryParams, setQueryParams] = useState(data?.query_params || []);
    const [headers, setHeaders] = useState(data?.headers || []);
    const [authorizationType, setAuthorizationType] = useState(
      data?.authorization?.type
        ? authorizationOptions.filter(
            (option) => option.id === data.authorization.type
          )[0]
        : authorizationOptions[0]
    );
    const [basicAuthData, setBasicAuthData] = useState(
      data?.authorization?.data?.length &&
        data.authorization?.type === RequestAuthType.BASIC.id
        ? data?.authorization?.data
        : [
            new DataField("username", { type: "fx", blocks: [] }),
            new DataField("password", { type: "fx", blocks: [] }),
          ]
    );
    const [bearerAuth, setBearerAuth] = useState(
      data?.authorization?.data?.length &&
        data.authorization?.type === RequestAuthType.BEARER.id
        ? data?.authorization?.data
        : [new DataField("token", { type: "fx", blocks: [] })]
    );
    const [method, setMethod] = useState(
      data?.method
        ? methodOptions.filter((option) => data?.method === option)[0]
        : methodOptions[0]
    );

    const [formGridData, setFormGridData] = useState(
      data?.body?.data?.length && data?.body?.type === RequestBodyType.FORM_DATA
        ? data.body.data
        : []
    );
    const [urlencodedGridData, setUrlEncodedGridData] = useState(
      data?.body?.data?.length &&
        data?.body?.type === RequestBodyType.X_WWW_FORM_URL_ENCODED
        ? data.body.data
        : []
    );
    const [binaryData, setBinaryData] = useState(
      data?.body?.data && data?.body?.type === RequestBodyType.BINARY
        ? data.body.data
        : null
    );
    const [rawData, setRawData] = useState(
      data?.body?.data && data?.body?.type === RequestBodyType.RAW
        ? data?.body?.data
        : {}
    );
    const [subType, setSubType] = useState(
      data?.body?.sub_type
        ? subTypeOptions.filter((option) => data.body.sub_type === option.id)[0]
        : subTypeOptions[0]
    );
    const [bodyType, setBodyType] = useState(
      data?.body?.type || radioGroupData[0].value
    );

    // const [nodeLabel, setNodeLabel] = useState(data.label || HTTP_TYPE);

    // const [showRunInputsDialog, setShowRunInputsDialog] = useState(false);

    // const [runInputData, setRunInputData] = useState();

    // const [terminalPanelData, setTerminalPanelData] = useState([]);

    const [outputSchema, setOutputSchema] = useState(data?.output?.schema);

    const isUrlPresent = data?.url?.text?.trim() || data?.url?.blocks?.length;

    const [validTabIndices, setValidTabIndices] = useState(
      isUrlPresent ? [0] : []
    );
    const [errorMessages, setErrorMessages] = useState({
      0: [],
      1: [],
      2: [],
    });
    // const updateTerminalData = (message) => {
    //   setTerminalPanelData((prev) => {
    //     return [...prev, { timestamp: dateUtils.formatDate(), message }];
    //   });
    // };

    const resetBodyRelatedStates = useCallback(() => {
      setBodyType(radioGroupData[0].value);
      setFormGridData([]);
      setUrlEncodedGridData([]);
      setRawData({});
      setBinaryData(null);
      setSubType(subTypeOptions[0]);
    }, []);

    const getData = useCallback(() => {
      // Initialize an object to store HTTP data
      const httpData = {
        url: url, // Retrieve URL data
        method: method, // Retrieve HTTP method data

        // Retrieve query parameters data (if not in "save" mode)
        query_params: queryParams,

        // Retrieve headers data (if not in "save" mode)
        headers: headers,

        authorization: {
          type: authorizationType?.id,
          data:
            // Check the authorization type and provide corresponding data
            authorizationType?.id === RequestAuthType.BASIC.id
              ? basicAuthData
              : authorizationType?.id === RequestAuthType.BEARER.id
                ? bearerAuth
                : null,
        },

        body: {
          type: bodyType,
          data:
            bodyType === RequestBodyType.FORM_DATA
              ? formGridData
              : bodyType === RequestBodyType.X_WWW_FORM_URL_ENCODED
                ? urlencodedGridData
                : bodyType === RequestBodyType.BINARY
                  ? binaryData
                  : bodyType === RequestBodyType.RAW
                    ? rawData
                    : null,
          ...(bodyType === RequestBodyType.RAW
            ? { sub_type: subType?.id }
            : {}),
        },

        output: {
          // response: outputData,
          schema: outputSchema,
        },

        path_variable: {
          data: [],
        },
        errors: Object.values(errorMessages).reduce(
          (acc, errors) => [...acc, ...errors],
          []
        ),
      };

      // Return the assembled HTTP data object
      return JSON.parse(JSON.stringify(httpData));
    }, [
      authorizationType?.id,
      basicAuthData,
      bearerAuth,
      binaryData,
      bodyType,
      errorMessages,
      formGridData,
      headers,
      method,
      outputSchema,
      queryParams,
      rawData,
      subType?.id,
      url,
      urlencodedGridData,
    ]);

    const resetHttpState = useCallback(() => {
      setHeaders([]);
      setMethod(methodOptions[0]);
      setUrl({});
      setOutputSchema(null);
      setRawData({});
      setBinaryData({});
      setFormGridData([]);
      setBearerAuth([new DataField("token", { type: "fx", blocks: [] })]);
      setAuthorizationType(authorizationOptions[0]);
      setQueryParams([]);
      setBodyType(radioGroupData[0].value);
      setSubType(subTypeOptions[0]);
    }, []);

    const emptyDynamicRow = useMemo(() => {
      return {
        expand: false,
        key: "",
        value: { type: "fx", blocks: [] },
        valueStr: "",
        rowid: crypto.randomUUID(),
      };
    }, []);

    const updateHttpState = useCallback(
      (httpData) => {
        if (httpData.url) {
          formulaBarRef.current?.updateInputContent([...httpData.url.blocks]);
          setUrl(httpData.url);
        }
        if (httpData.headers) {
          setHeaders([...httpData.headers, emptyDynamicRow]);
        }
        if (httpData.method) {
          setMethod(httpData.method);
        }
        if (httpData.body_type) {
          setBodyType(httpData.body_type);
        }
        if (httpData.query_params) {
          setQueryParams([...httpData.query_params, emptyDynamicRow]);
        }
        if (httpData.formGridData) {
          setFormGridData([...httpData.formGridData, emptyDynamicRow]);
        }
        if (httpData.urlencodedGridData) {
          setUrlEncodedGridData([
            ...httpData.urlencodedGridData,
            emptyDynamicRow,
          ]);
        }
        if (httpData.binaryData) {
          setBinaryData(httpData.binaryData);
        }
        if (httpData.rawData) {
          setRawData(httpData.rawData);
        }
        if (httpData.subType) {
          setSubType(httpData.subType);
        }
      },
      [emptyDynamicRow]
    );

    const httpConfigureData = useMemo(() => {
      return [
        {
          label: BODY,
          panelComponent: BodyPanel,
          panelComponentProps: {
            formGridData,
            setFormGridData,
            urlencodedGridData,
            setUrlEncodedGridData,
            rawData,
            setRawData,
            binaryData,
            setBinaryData,
            bodyType,
            setBodyType,
            subType,
            setSubType,
            headers,
            setHeaders,
            variables,
          },
        },
        {
          label: PARAMS,
          panelComponent: ParamsPanel,
          panelComponentProps: {
            queryParams,
            setQueryParams,
            variables,
          },
        },
        {
          label: HEADER,
          panelComponent: HeadersPanel,
          panelComponentProps: {
            headers,
            setHeaders,
            variables,
          },
        },
        {
          label: AUTH,
          panelComponent: AuthorizationPanel,
          panelComponentProps: {
            variables,
            authorizationOptions,
            authorizationType,
            setAuthorizationType,
            basicAuthData,
            setBasicAuthData,
            bearerAuth,
            setBearerAuth,
          },
        },
        // {
        //   label: "OUTPUT",
        //   panelComponent: OutputPanel,
        //   panelComponentProps: {
        //     terminalPanelData,
        //     setTerminalPanelData,
        //     structurePanelData: outputData,
        //     setStructurePanelData: setOutputData,
        //     isRunning,
        //   },
        // },
      ];
    }, [
      authorizationType,
      basicAuthData,
      bearerAuth,
      binaryData,
      bodyType,
      formGridData,
      headers,
      queryParams,
      rawData,
      subType,
      urlencodedGridData,
      variables,
    ]);
    const onMethodChange = useCallback(
      (e, value) => {
        if (value === methodOptions[0]) {
          resetBodyRelatedStates();
        }
        setMethod(value);
      },
      [resetBodyRelatedStates]
    );
    const onURLChanged = useCallback(
      (fxContent, contentStr) => {
        if (isCurlCommand(contentStr)) {
          try {
            resetHttpState();
            const parsedCurl = utility.curlToJson(contentStr);
            const httpData = parsedCurlJSONToHttpData(parsedCurl);
            updateHttpState(httpData);
          } catch (err) {
            resetHttpState();
            showAlert({
              type: "error",
              message: "Invalid CURL command",
            });
          }
          return;
        }
        setUrl({ type: "fx", blocks: fxContent, text: contentStr });
      },
      [resetHttpState, updateHttpState]
    );

    const showPanel = useMemo(() => {
      return {
        [BODY]: method === methodOptions[0] ? false : true,
        [PARAMS]: true,
        [HEADER]: true,
        [AUTH]: true,
      };
    }, [method]);

    const tabs = useMemo(() => {
      return [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            method,
            url,
            onMethodChange,
            onURLChanged,
            variables,
            formulaBarRef,
            setValidTabIndices,
            setErrorMessages,
          },
          "data-testid": "node-tab-header-initialize",
        },
        {
          label: "CONFIGURE",
          panelComponent: Configure,
          panelComponentProps: {
            httpConfigureData,
            setValidTabIndices,
            setErrorMessages,
            showPanel,
          },
          "data-testid": "node-tab-header-configure",
        },
        {
          label: "TEST",
          panelComponent: CommonTestModule,
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
            node: nodeData || HTTP_NODE,
            onTestComplete: (output_schema) => {
              setOutputSchema(output_schema);
              setValidTabIndices(addIndices(validTabIndices, [2]));
            },
          },
          "data-testid": "node-tab-header-test",
        },
      ];
    }, [
      annotation,
      canvasRef,
      assetId,
      getData,
      httpConfigureData,
      method,
      nodeData,
      onMethodChange,
      onURLChanged,
      parentId,
      projectId,
      showPanel,
      url,
      validTabIndices,
      variables,
      workspaceId,
    ]);

    useImperativeHandle(ref, () => {
      return {
        getData,
      };
    }, [getData]);

    return (
      <TabContainer
        tabs={tabs || []}
        colorPalette={{
          dark: HTTP_NODE.dark,
          light: HTTP_NODE.light,
          foreground: HTTP_NODE.foreground,
        }}
        hasTestTab={HTTP_NODE.hasTestModule}
        errorMessages={errorMessages}
        validTabIndices={validTabIndices}
        defaultTabIndex={isUrlPresent ? 1 : 0}
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

export default Http;
