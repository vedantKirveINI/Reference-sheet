import { cn } from "@/lib/utils";
import { icons } from "@/components/icons";
import { AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const ACCORDION_ICON_MAP = {
  google_tag_manager: icons.settings,
  google_analytics: icons.barChart3,
  meta_pixel: icons.share2,
};

const FormAccordion = ({
  title,
  description,
  children,
  isOpen,
  onToggle,
  id,
  dataTestId,
  icon,
}) => {
  const testIdPrefix = `accordion-${id}`;
  const IconComponent = icon || ACCORDION_ICON_MAP[id] || icons.settings;

  return (
    <AccordionItem
      value={id}
      className="border border-border rounded-lg bg-card shadow-sm overflow-hidden transition-all hover:shadow-md data-[state=open]:border-border border-b-0"
      data-testid={dataTestId ? `${dataTestId}-container` : ""}
    >
      <AccordionTrigger
        className="px-4 py-3 hover:no-underline hover:bg-muted/50"
        data-testid={dataTestId ? `${dataTestId}-header` : ""}
      >
        <div className="flex-1 text-left flex items-center gap-3">
          {IconComponent && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted border border-border shrink-0">
              <IconComponent className="w-4 h-4 text-muted-foreground" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3
              className="text-sm font-semibold text-foreground"
              data-testid={`${testIdPrefix}-title`}
            >
              {title}
            </h3>
            {description && (
              <p
                className="text-xs text-muted-foreground mt-0.5 line-clamp-2"
                data-testid={`${testIdPrefix}-description`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent
        className="px-4 pb-4 pt-0"
        data-testid={dataTestId ? `${dataTestId}-content` : ""}
      >
        <div className="pt-2">
          {children}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default FormAccordion;
