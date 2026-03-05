import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const ODSAccordion = ({ title, content, defaultExpanded, className, ...props }) => {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue={defaultExpanded ? "item-1" : undefined}
      data-testid="ods-accordion"
      className={cn(className)}
      {...props}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger data-testid="ods-accordion-title">
          {title}
        </AccordionTrigger>
        <AccordionContent data-testid="ods-accordion-content">
          {content}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default ODSAccordion;
