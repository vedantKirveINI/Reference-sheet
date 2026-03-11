import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useState,
  useMemo,
} from "react";
import { debounce } from "lodash";
import { toast } from "sonner";
import { Sparkles, Play } from "lucide-react";
import { executeTinyGPTTest } from "../utils/tinyGPTApi";
import { componentSDKServices } from "../../../services/componentSDKServices";
import { variableSDKServices } from "../../../services/variableSDKServices";
import TestProcessingLoader from "../../common-components/TestProcessingLoader";
import ContextualTestScreen from "../../common-components/ContextualTestScreen";
import { GPTTestResult } from "../../common-components/TestResultVariants";
import cloneDeep from "lodash/cloneDeep";

import classes from "../../common-components/CommonTestModule.module.css";

const TinyGPTTestModule = forwardRef(
  (
    {
      go_data,
      variables,
      node,
      onTestComplete = () => {},
      onProcessingChange = () => {},
      theme = {},
    },
    ref,
  ) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [inputs, setInputs] = useState(null);
    const [inputModeActive, setInputModeActive] = useState(false);
    const [state, setState] = useState({});
    const [output, setOutput] = useState(null);
    const [isTestComplete, setIsTestComplete] = useState(false);
    const [hasRunOnce, setHasRunOnce] = useState(false);
    const [executedAt, setExecutedAt] = useState(null);

    const checkForInputs = useCallback(async () => {
      try {
        const response = await componentSDKServices.generateFormSchemaV2(
          go_data,
          { mark_as_ref: true, cleanup_keys: ["default"] },
        );
        if (response.status === "success" && response.result?.keys?.length > 0) {
          setInputs(response.result);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }, [go_data]);

    const runTest = useCallback(async () => {
      try {
        setIsProcessing(true);
        onProcessingChange(true);
        setExecutedAt(new Date().toISOString());

        let resolvedState = { ...state };
        const varResponse = await variableSDKServices.transformedToState(variables);
        if (varResponse.status === "success") {
          resolvedState = { ...varResponse.result, ...resolvedState };
        }

        if (inputs?.blocks) {
          const formResponse = await componentSDKServices.formSchemaToState({
            blocks: cloneDeep(inputs.blocks),
            state: resolvedState,
          });
          if (formResponse.status === "success") {
            resolvedState = { ...formResponse.result, ...resolvedState };
          }
        }

        const result = await executeTinyGPTTest(go_data, resolvedState);

        setOutput(result);
        setIsTestComplete(true);
        setHasRunOnce(true);

        if (result && typeof result === "object") {
          const outputKeys = Object.keys(result);
          const outputSchema = outputKeys.map((key) => ({
            key,
            type: typeof result[key] === "number" ? "Number" : "String",
          }));
          onTestComplete(outputSchema);
        } else {
          onTestComplete(null);
        }
      } catch (error) {
        setOutput({ error: true, message: error.message || "Test execution failed" });
        setIsTestComplete(true);
        setHasRunOnce(true);
        toast.error("Test Failed", {
          description: error.message || "An error occurred during test execution",
        });
        onTestComplete(null);
      } finally {
        setIsProcessing(false);
        onProcessingChange(false);
        setInputModeActive(false);
      }
    }, [state, variables, inputs, go_data, onTestComplete, onProcessingChange]);

    const beginTest = useCallback(async () => {
      try {
        setOutput(null);
        setIsTestComplete(false);

        if (!inputModeActive) {
          setInputs(null);
          const hasInputs = await checkForInputs();
          if (hasInputs) {
            setInputModeActive(true);
            return;
          }
        }

        runTest();
      } catch {
        setIsProcessing(false);
        onProcessingChange(false);
      }
    }, [checkForInputs, inputModeActive, runTest, onProcessingChange]);

    const debouncedBeginTest = useCallback(
      debounce(
        () => {
          if (isProcessing) return;
          beginTest();
        },
        300,
        { leading: true, trailing: false },
      ),
      [beginTest, isProcessing],
    );

    const handleRerun = useCallback(async () => {
      if (isProcessing) return;
      setIsTestComplete(false);
      setOutput(null);
      setInputModeActive(false);

      const hasInputs = await checkForInputs();
      if (hasInputs) {
        setInputModeActive(true);
      } else {
        beginTest();
      }
    }, [beginTest, checkForInputs, isProcessing]);

    useImperativeHandle(
      ref,
      () => ({
        beginTest: debouncedBeginTest,
        isProcessing,
        inputMode: inputModeActive,
      }),
      [debouncedBeginTest, isProcessing, inputModeActive],
    );

    const handleValuesChange = useCallback((values) => {
      setState(values);
    }, []);

    const handleSubmitInputs = useCallback(() => {
      runTest();
    }, [runTest]);

    const renderInputForm = () => {
      if (!inputs?.keys?.length) return null;

      return (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-medium text-gray-900">
              Provide test values
            </span>
          </div>
          <p className="text-xs text-gray-500 -mt-2">
            Your prompt uses variables. Provide sample values to test with.
          </p>
          <div className="space-y-3">
            {inputs.keys.map((key) => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-medium text-gray-700">
                  {key}
                </label>
                <textarea
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[60px]"
                  placeholder={`Enter a value for {{${key}}}...`}
                  onChange={(e) =>
                    handleValuesChange({ ...state, [key]: e.target.value })
                  }
                  value={state[key] || ""}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmitInputs}
            className="w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run Test
          </button>
        </div>
      );
    };

    return (
      <div className={`${classes["common-test-module-container"]}`}>
        {isProcessing ? (
          <div className={classes["loader-container"]}>
            <TestProcessingLoader theme={theme} />
          </div>
        ) : (
          <>
            {inputModeActive && inputs?.keys?.length > 0 && renderInputForm()}
            {!inputModeActive && !isTestComplete && (
              <ContextualTestScreen
                title={hasRunOnce ? "Ready to Rerun" : "Test Your AI"}
                description="Run a test to see how TinyGPT processes your prompt and generates output."
                tips={[
                  "The test will use the persona, prompt, and output format you configured",
                  "Results will show the AI's response in your defined output structure",
                ]}
                icon={Sparkles}
                theme={theme}
                onRunTest={() => debouncedBeginTest()}
                isProcessing={isProcessing}
                isRerun={hasRunOnce}
              />
            )}
            {!inputModeActive && isTestComplete && (
              <GPTTestResult
                inputs={null}
                outputs={output}
                node={node}
                theme={theme}
                executedAt={executedAt}
                onRerun={handleRerun}
                goData={go_data}
              />
            )}
          </>
        )}
      </div>
    );
  },
);

TinyGPTTestModule.displayName = "TinyGPTTestModule";

export default TinyGPTTestModule;
