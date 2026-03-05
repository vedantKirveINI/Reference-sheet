import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";
import utility from "oute-services-flow-utility-sdk";
import ExplanationContainer from "./ExplanationContainer.jsx";
import TestInputsContainer from "./TestInputsContainer.jsx";
import { transformFormulaError } from "../utils/error-message-transformer.js";

const EvaluateFx = forwardRef(
  ({ contentRef = {}, hideExplanation = false }, ref) => {
    const [data, setData] = useState([]);
    const [nodeInputs, setNodeInputs] = useState([]);
    const [output, setOutput] = useState("");
    const [isError, setIsError] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const evaluateFxBtnRef = useRef();

    const refreshData = useCallback(() => {
      const content = contentRef.current.getContent();
      setData(content);
      setNodeInputs(
        content.filter((d) => d.type === "NODE" || d.subCategory === "NODE")
      );
    }, [contentRef]);

    useEffect(() => {
      refreshData();
    }, [refreshData]);

    useImperativeHandle(
      ref,
      () => ({
        refreshData,
      }),
      [refreshData]
    );

    if (!data?.length)
      return (
        <div className="p-4 text-center text-muted-foreground text-sm">
          <Label className="uppercase">Nothing to Evaluate</Label>
        </div>
      );

    const hasFunctions =
      data.filter((d) => {
        return d.subCategory === "FUNCTIONS" || d.type === "FUNCTIONS";
      }).length > 0;

    const ChevronLeftIcon = getLucideIcon("OUTEChevronLeftIcon", {
      size: 16,
      className: "text-[#90A4AE] rotate-[-90deg] transition-transform",
    });

    // Determine default value based on whether explanation is hidden
    const getDefaultValue = () => {
      if (nodeInputs.length > 0) {
        return ["inputs", "outputs"];
      }
      return ["outputs"];
    };

    // Simplified view without accordions (for Test section)
    if (hideExplanation) {
      return (
        <div className="flex flex-col w-full max-h-full gap-3 p-0 box-border relative bg-transparent" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col gap-4 p-0">
            {nodeInputs.length > 0 && (
              <div className="flex flex-col">
                <Label className="text-foreground text-sm font-medium uppercase text-sm font-semibold mb-2 block">
                  Inputs
                </Label>
                <TestInputsContainer setData={setData} data={nodeInputs} />
              </div>
            )}
            <div className="flex flex-col">
              <Label className="text-foreground text-sm font-medium uppercase text-sm font-semibold mb-2 block">
                Outputs
              </Label>
              <div
                data-testid="evaluate-fx-output"
                className={cn(
                  "text-sm bg-muted min-h-[3rem] max-h-[10rem] flex items-start p-3 box-border rounded-md border border-border font-mono break-words overflow-y-auto overflow-x-hidden [&_pre]:m-0 [&_pre]:text-xs [&_pre]:whitespace-pre-wrap [&_pre]:break-words",
                  isError ? "text-destructive bg-destructive/10 border-destructive/30" : "text-foreground bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                )}
              >
                {output || (
                  <span className="text-[#78909c]">No output yet</span>
                )}
              </div>
            </div>
          </div>
          <div className="sticky bottom-0 bg-muted pt-3 pb-2 border-t border-border mt-auto flex justify-end pr-0 z-[200]">
            <Button
              variant="default"
              data-testid="evaluate-fx-button"
              ref={evaluateFxBtnRef}
              className="w-full text-sm font-semibold py-2 px-4 rounded-md"
              disabled={isLoading}
              onClick={async () => {
                try {
                  // Refresh data to get latest formula blocks
                  refreshData();
                  
                  // Set loading state
                  setIsLoading(true);
                  setIsError(false);
                  
                  // Add 1-second delay (dummy loader)
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  
                  // Get fresh data after refresh
                  const currentData = contentRef.current.getContent();
                  
                  // Evaluate formula
                  const output = await utility.resolveValue(
                    {},
                    "evaluatedOutput",
                    {
                      type: "fx",
                      blocks: currentData,
                    },
                    undefined,
                    undefined,
                    undefined,
                    { use_default: true }
                  );
                  if (output?.value && typeof output?.value == "object") {
                    setOutput(
                      <pre>{JSON.stringify(output?.value, null, 2)}</pre>
                    );
                  } else {
                    setOutput(output?.value?.toString());
                  }
                } catch (e) {
                  setOutput(transformFormulaError(e));
                  setIsError(true);
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              {isLoading ? (
                getLucideIcon("OUTELoaderIcon", { size: 16, className: "mr-2 animate-spin" })
              ) : (
                getLucideIcon("OUTEPlayIcon", { size: 16, className: "mr-2" })
              )}
              Evaluate
            </Button>
          </div>
        </div>
      );
    }

    // Full view with accordions (for other use cases)
    return (
      <div className="flex flex-col w-full max-h-full gap-3 p-0 box-border relative bg-transparent" onClick={(e) => e.stopPropagation()}>
        <Accordion
          type="multiple"
          defaultValue={getDefaultValue()}
          className="w-full max-h-[calc(21.65rem-10rem)] overflow-y-auto overflow-x-hidden"
        >
          {hasFunctions && !hideExplanation && (
            <AccordionItem
              value="explanation"
              className="border-b border-[#cfd8dc]"
            >
              <AccordionTrigger className="py-2 hover:no-underline [&>svg]:hidden">
                <div className="flex items-center justify-between w-full pr-4">
                  <Label className="uppercase text-sm font-semibold">
                    Explanation
                  </Label>
                  {ChevronLeftIcon}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <ExplanationContainer
                  data={data.filter((d) => {
                    return (
                      d.subCategory === "FUNCTIONS" || d.type === "FUNCTIONS"
                    );
                  })}
                />
              </AccordionContent>
            </AccordionItem>
          )}
          {nodeInputs.length > 0 && (
            <AccordionItem value="inputs" className="border-b border-[#cfd8dc]">
              <AccordionTrigger className="py-2 hover:no-underline [&>svg]:hidden">
                <div className="flex items-center justify-between w-full pr-4">
                  <Label className="uppercase text-sm font-semibold">
                    Inputs
                  </Label>
                  {ChevronLeftIcon}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-2">
                <TestInputsContainer setData={setData} data={nodeInputs} />
              </AccordionContent>
            </AccordionItem>
          )}
          <AccordionItem value="outputs" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline [&>svg]:hidden">
              <div className="flex items-center justify-between w-full pr-4">
                <Label className="uppercase text-sm font-semibold">
                  Outputs
                </Label>
                {ChevronLeftIcon}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2">
              <div
                data-testid="evaluate-fx-output"
                className={cn(
                  "text-sm bg-muted min-h-[3rem] max-h-[10rem] flex items-start p-3 box-border rounded-md border border-border font-mono break-words overflow-y-auto overflow-x-hidden [&_pre]:m-0 [&_pre]:text-xs [&_pre]:whitespace-pre-wrap [&_pre]:break-words",
                  isError ? "text-destructive bg-destructive/10 border-destructive/30" : "text-foreground bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                )}
              >
                {output}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="sticky bottom-0 bg-muted pt-3 pb-2 border-t border-border mt-auto flex justify-end z-[200]">
          <Button
            variant="default"
            data-testid="evaluate-fx-button"
            ref={evaluateFxBtnRef}
            disabled={isLoading}
            onClick={async () => {
              try {
                // Refresh data to get latest formula blocks
                refreshData();
                
                // Set loading state
                setIsLoading(true);
                setIsError(false);
                
                // Add 1-second delay (dummy loader)
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Get fresh data after refresh
                const currentData = contentRef.current.getContent();
                
                // Evaluate formula
                const output = await utility.resolveValue(
                  {},
                  "evaluatedOutput",
                  {
                    type: "fx",
                    blocks: currentData,
                  },
                  undefined,
                  undefined,
                  undefined,
                  { use_default: true }
                );
                if (output?.value && typeof output?.value == "object") {
                  setOutput(
                    <pre>{JSON.stringify(output?.value, null, 2)}</pre>
                  );
                } else {
                  setOutput(output?.value?.toString());
                }
              } catch (e) {
                setOutput(transformFormulaError(e));
                setIsError(true);
              } finally {
                setIsLoading(false);
              }
            }}
          >
            {isLoading ? (
              getLucideIcon("OUTELoaderIcon", { size: 16, className: "mr-2 animate-spin" })
            ) : (
              getLucideIcon("OUTEPlayIcon", { size: 16, className: "mr-2" })
            )}
            Evaluate
          </Button>
        </div>
      </div>
    );
  }
);

export default EvaluateFx;
