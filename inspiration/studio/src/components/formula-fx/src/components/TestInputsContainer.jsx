import React, { useEffect, useState } from "react";
import DataBlock from "./data-block/index.jsx";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { getLucideIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

const TestInputsContainer = ({ data = [], setData }) => {
  const [inputs, setInputs] = useState({});
  useEffect(() => {
    let _inputs = {};
    data.forEach((d) => {
      if (!_inputs?.[d?.variableData?.nodeId]) {
        _inputs[d?.variableData?.nodeId] = d;
      }
    });
    setInputs(_inputs);
  }, [data]);

  const inputKeys = Object.keys(inputs);
  const defaultExpandedValue = inputKeys.length > 0 ? `test-input-0` : undefined;

  return (
    <div className="flex flex-col gap-2 p-2">
      {inputKeys.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          defaultValue={defaultExpandedValue}
          className="w-full"
        >
          {inputKeys.map((k, index) => {
            const d = inputs[k];
            const itemId = `test-input-${index}`;
            const ChevronLeftIcon = getLucideIcon("OUTEChevronLeftIcon", {
              size: 16,
              className: "text-[#90A4AE] rotate-[-90deg] transition-transform",
            });

            return (
              <AccordionItem
                key={itemId}
                value={itemId}
                className={cn(
                  "border border-[#cfd8dc] rounded-lg bg-white",
                  index < inputKeys.length - 1 && "mb-2"
                )}
              >
                <AccordionTrigger className="py-2 px-3 hover:no-underline [&>svg]:hidden">
                  <div className="flex items-center justify-between w-full pr-4">
                    <DataBlock block={d} />
                    {ChevronLeftIcon}
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <Textarea
                    className="w-full min-h-[60px] max-h-[200px] resize-y text-sm font-mono"
                    placeholder={d.variableData?.type || "any"}
                    defaultValue={
                      typeof d?.variableData?.default === "object"
                        ? JSON.stringify(d?.variableData?.default, null, 2)
                        : d?.variableData?.default || ""
                    }
                    onChange={(e) => {
                      setData((prev) => {
                        return prev.map((p) => {
                          if (p?.variableData?.nodeId === k) {
                            return {
                              ...p,
                              variableData: {
                                ...p?.variableData,
                                default: e.target.value,
                              },
                            };
                          }
                          return p;
                        });
                      });
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      ) : (
        <div className="p-4 text-center text-sm text-[#78909c]">
          No inputs needed.
        </div>
      )}
    </div>
  );
};

export default TestInputsContainer;

