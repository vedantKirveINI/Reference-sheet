import {
  forwardRef,
  Fragment,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import TabContainer from "../common-components/TabContainer";
import HITL_NODE, { TEMPLATE_BUTTONS } from "./constant";
import { Initialize } from "./Initialize";
import { ConfigScreen } from "./ConfigScreen";
import CommonTestModule from "../common-components/CommonTestModule";
import storageSDKServices from "../../services/storageSDKServices";
import { useNodeAnimation } from "../common-hooks/useNodeAnimation";
import AddFilesTab from "./components/AddFilesTab";

const HITL = forwardRef(
  (
    {
      canvasRef,
      annotation,
      data,
      nodeData,
      variables,
      onSave = () => {},
      workspaceId,
      assetId,
      projectId,
      parentId,
    },
    ref
  ) => {
    const testModuleRef = useRef();
    const {
      scope,
      showingPreviewAnimation,
      hidePreviewAnimation,
      previewOpen,
    } = useNodeAnimation();
    const [config, setConfig] = useState({
      step_name: "",
      template_type: "",
      instructions: { type: "fx", blocks: [] },
      summary_content: {
        value: "",
        editable: false,
        type: "text",
      },
      buttons: [
        { label: "Button 1", value: "button_1", color: "gray" },
        { label: "Button 2", value: "button_2", color: "gray" },
      ],
      fallback: {
        enabled: false,
        timeout_duration: 30,
        timeout_unit: "minutes",
        action: "auto_trigger",
        fallback_value: "",
      },
      branding: {
        logo_url: "",
        logo_details: {},
        primary_color: "#1A73E8",
        accent_color: "#F4B400",
      },
      ...(data || {}),
    });
    const [tabIndex, setTabIndex] = useState(0);
    const [validTabIndices, setValidTabIndices] = useState([0]);
    const [error, setError] = useState({
      0: [],
      1: [],
      2: [],
    });

    // Template selection handlers
    const handleTemplateChange = (event) => {
      const templateType = event.target.value;

      // Update template type in config
      setConfig((prevConfig) => ({
        ...prevConfig,
        template_type: templateType,
        // Set buttons based on template
        buttons: templateType
          ? TEMPLATE_BUTTONS[templateType] || prevConfig.buttons
          : prevConfig.buttons,
        // Reset fallback value when template changes
        fallback: {
          ...prevConfig.fallback,
          fallback_value: "",
        },
      }));
    };

    // Configuration handlers
    const handleConfigChange = (newConfig) => {
      setConfig(newConfig);
    };

    const handleButtonChange = useCallback(
      (index, field, value) => {
        // Create a copy of the buttons array using the latest state
        setConfig((prevConfig) => {
          const updatedButtons = [...prevConfig.buttons];

          // Create a copy of the specific button we're updating
          const updatedButton = { ...updatedButtons[index] };

          // Update the specified field
          updatedButton[field] = value;

          // If we're updating the label, also update the value to match
          if (field === "label") {
            updatedButton.value = value;
          }

          // Put the updated button back in the array
          updatedButtons[index] = updatedButton;

          // Return the new config state
          return {
            ...prevConfig,
            buttons: updatedButtons,
          };
        });
      },
      [] // No dependencies needed since we're using the function form of setConfig
    );

    const handleAddButton = useCallback(() => {
      setConfig({
        ...config,
        buttons: [...config.buttons, { label: "", value: "", color: "gray" }],
      });
    }, [config]);

    const handleRemoveButton = useCallback(
      (index) => {
        if (config.buttons.length <= 2) return; // Maintain minimum 2 buttons

        const newButtons = [...config.buttons];
        newButtons.splice(index, 1);

        // If the removed button was selected as fallback, reset fallback value
        if (config.fallback.fallback_value === config.buttons[index].value) {
          setConfig({
            ...config,
            buttons: newButtons,
            fallback: {
              ...config.fallback,
              fallback_value: "",
            },
          });
        } else {
          setConfig({
            ...config,
            buttons: newButtons,
          });
        }
      },
      [config]
    );

    const handleFallbackChange = useCallback(
      (fallback) => {
        setConfig({
          ...config,
          fallback,
        });
      },
      [config]
    );

    const handleBrandingChange = useCallback(
      (branding) => {
        setConfig({
          ...config,
          branding,
        });
      },
      [config]
    );

    const handleLogoUpload = useCallback(
      (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Check file type
        const validTypes = ["image/png", "image/jpeg", "image/svg+xml"];
        if (!validTypes.includes(file.type)) {
          alert("Please upload a PNG, JPG, or SVG file");
          return;
        }

        const maxSize = 2 * 1024 * 1024;
        const isLargeFile = file.size > maxSize;
        if (isLargeFile) {
          setError((prev) => {
            const newErrors = { ...prev };
            if (!newErrors[1]) newErrors[1] = [];

            if (isLargeFile) {
              newErrors[1] = [
                ...newErrors[1],
                "Logo size exceeds 2MB. Please upload a smaller file.",
              ];
            } else {
              newErrors[1] = newErrors[1].filter(
                (err) =>
                  err !== "Logo size exceeds 2MB. Please upload a smaller file."
              );
            }

            return newErrors;
          });

          // Update valid tab indices
          // setValidTabIndices((prev) => {
          //   if (!prev.includes(1)) {
          //     return prev;
          //   }
          //   return prev.filter((index) => index !== 1);
          // });

          return;
        }

        // Read the file and upload it using storageSDKServices
        const reader = new FileReader();
        reader.onload = async (e) => {
          const arrayBuffer = e.target.result;
          // Convert ArrayBuffer to Blob
          const file_obj = new Blob([arrayBuffer], { type: file.type });

          // Prepare the request body
          const body = {
            fileName: file.name,
            fileType: file.type,
            file_obj,
          };

          // If we already have a logo URL, we're updating an existing file
          // if (config.branding?.logo_url && config.branding?.filePath) {
          //   body.op = "update";
          //   body.filePath = config.branding.filePath;
          // }

          try {
            // Upload the file using storageSDKServices
            const response = await storageSDKServices.uploadFile(body);

            if (response.status === "success") {
              // Update the config with the CDN URL and file path
              setConfig({
                ...config,
                branding: {
                  ...config.branding,
                  logo_url: response.result.cdn,
                  logo_details: {
                    ...(response.result || {}),
                    fileName: file.name,
                    fileType: file.type,
                  },
                },
              });
            }
          } catch (error) {
            // Handle upload error
            alert(
              "An error occurred while uploading the logo. Please try again."
            );
            console.error("Logo upload error:", error);
          }
        };

        reader.readAsArrayBuffer(file);
      },
      [config]
    );

    const handleAddFiles = useCallback(() => {
      showingPreviewAnimation();
    }, [showingPreviewAnimation]);

    const savedFilesHandler = useCallback(
      (files) => {
        setConfig({
          ...config,
          files,
        });
        hidePreviewAnimation();
      },
      [config, hidePreviewAnimation]
    );

    const tabs = useMemo(() => {
      return [
        {
          label: "INITIALIZE",
          panelComponent: Initialize,
          panelComponentProps: {
            templateType: config.template_type,
            onTemplateChange: handleTemplateChange,
            setValidTabIndices,
            error,
            setError,
            variables,
          },
        },
        {
          label: "CONFIGURE",
          panelComponent: previewOpen ? AddFilesTab : Fragment,
          panelComponentProps: !previewOpen
            ? null
            : {
                onSave: savedFilesHandler,
                onCancel: hidePreviewAnimation,
                files: config?.files,
                variables,
              },
        },
        {
          label: "TEST",
          panelComponent: CommonTestModule,
          panelComponentProps: {
            canvasRef,
            annotation,
            go_data: config,
            ref: testModuleRef,
            variables,
            workspaceId: workspaceId,
            assetId: assetId,
            projectId: projectId,
            parentId: parentId,
            node: nodeData || HITL_NODE,
          },
          onTestComplete: () => {
            setValidTabIndices([0, 1, 2]);
          },
        },
      ];
    }, [
      annotation,
      assetId,
      canvasRef,
      config,
      error,
      hidePreviewAnimation,
      nodeData,
      parentId,
      previewOpen,
      projectId,
      savedFilesHandler,
      variables,
      workspaceId,
    ]);

    useImperativeHandle(ref, () => {
      return {
        getData: () => config,
      };
    });
    return (
      <div
        style={{
          position: "relative",
          height: "100%",
          width: "100%",
          borderBottomLeftRadius: "inherit",
        }}
      >
        <TabContainer
          tabs={tabs || []}
          onTabSwitch={(activeIndex) => {
            hidePreviewAnimation();
            setTabIndex(activeIndex);
          }}
          colorPalette={{
            dark: HITL_NODE.dark,
            light: HITL_NODE.light,
            foreground: HITL_NODE.foreground,
          }}
          hasTestTab={HITL_NODE.hasTestModule}
          errorMessages={error}
          validTabIndices={validTabIndices}
          onSave={onSave}
          showCommonActionFooter={!previewOpen}
          validateTabs={true}
          onTest={() => {
            testModuleRef.current?.beginTest();
          }}
          showBottomBorder={true}
        />
        <div
          ref={scope}
          style={{
            position: "absolute",
            top: "calc(3.5rem + 1px)",
            left: 0,
            width: "100%",
            height: "calc(100% - 9rem)",
            background: previewOpen ? "#fff" : "transparent",
            display: tabIndex === 1 ? "block" : "none",
          }}
        >
          <ConfigScreen
            config={config}
            validTabIndices={validTabIndices}
            setValidTabIndices={setValidTabIndices}
            error={error}
            setError={setError}
            onConfigChange={handleConfigChange}
            onButtonChange={handleButtonChange}
            onAddButton={handleAddButton}
            onRemoveButton={handleRemoveButton}
            onFallbackChange={handleFallbackChange}
            onBrandingChange={handleBrandingChange}
            onLogoUpload={handleLogoUpload}
            variables={variables}
            onAddFiles={handleAddFiles}
            previewOpen={previewOpen}
          />
        </div>
      </div>
    );
  }
);

export default HITL;
