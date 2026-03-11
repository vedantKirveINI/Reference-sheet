import { useState, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getQuestionCategoryColor } from "../../../constants/questionCategoryColors";
import { LucideIcon, ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSettingsCardProps {
  questionType: string;
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}

const CollapsibleSettingsCard = ({
  questionType,
  title,
  icon: Icon,
  children,
  className,
  defaultOpen = false,
}: CollapsibleSettingsCardProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const categoryColor = getQuestionCategoryColor(questionType);

  return (
    <Card
      className={cn("mb-4 overflow-hidden", className)}
      style={{
        borderLeft: `3px solid ${categoryColor.primary}`,
      }}
    >
      <CardHeader
        className="border-b py-3 cursor-pointer select-none"
        style={{
          backgroundColor: `${categoryColor.light}40`,
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            {Icon && (
              <Icon
                className="h-4 w-4"
                style={{ color: categoryColor.primary }}
              />
            )}
            {title}
          </div>
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </CardTitle>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4 pt-4">{children}</CardContent>
      )}
    </Card>
  );
};

export default CollapsibleSettingsCard;
