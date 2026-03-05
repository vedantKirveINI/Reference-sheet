import { Alert, AlertDescription } from "@/components/ui/alert";
import { icons } from "@/components/icons";

const InfoLabel = ({ message }) => {
  return (
    <Alert 
      className="bg-muted/50 border-border flex items-center gap-3 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0" 
      data-testid="remove-branding-info-label"
    >
      {icons.info && (
        <icons.info className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
      <AlertDescription className="text-sm text-muted-foreground flex-1">
        {message}
      </AlertDescription>
    </Alert>
  );
};

export default InfoLabel;
