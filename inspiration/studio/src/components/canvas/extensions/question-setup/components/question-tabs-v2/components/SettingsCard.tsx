import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getQuestionCategoryColor } from "../../../constants/questionCategoryColors";
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface SettingsCardProps {
  questionType: string;
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}

const SettingsCard = ({
  questionType,
  title,
  icon: Icon,
  children,
  className,
}: SettingsCardProps) => {
  const categoryColor = getQuestionCategoryColor(questionType);

  return (
    <Card
      className={cn("mb-4 overflow-hidden", className)}
      style={{
        borderLeft: `3px solid ${categoryColor.primary}`,
      }}
    >
      <CardHeader
        className="border-b py-3"
        style={{
          backgroundColor: `${categoryColor.light}40`,
        }}
      >
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {Icon && (
            <Icon
              className="h-4 w-4"
              style={{ color: categoryColor.primary }}
            />
          )}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">{children}</CardContent>
    </Card>
  );
};

export default SettingsCard;
