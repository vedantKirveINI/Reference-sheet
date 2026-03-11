import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";

interface AltTextSectionProps {
  altText: string;
  onChange: (altText: string) => void;
}

const AltTextSection = ({ altText, onChange }: AltTextSectionProps) => {
  return (
    <Collapsible className="group" data-testid="advanced-toggle">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-0 py-2 h-auto font-medium text-muted-foreground hover:text-foreground">
          <icons.chevronRight className="size-3.5 transition-transform group-data-[state=open]:rotate-90" />
          <span>Advanced</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-2 pl-2">
        <Label>Alt Text (Accessibility)</Label>
        <Textarea
          placeholder="Describe the image for screen readers..."
          value={altText}
          onChange={(e) => onChange(e.target.value)}
          data-testid="alt-text-input"
        />
        <span className="text-xs text-muted-foreground">
          This helps users who use screen readers understand the image
        </span>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default AltTextSection;
