import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";

const NoConnectionPreview = ({ 
  integrationName = "", 
  integrationIcon = null,
  onAddConnection = null 
}) => {
  const displayName = integrationName || "your app";
  const PlusIcon = icons.add;

  return (
    <div
      className="flex flex-col items-center justify-center w-full px-6 py-10"
      data-testid="no-connection-preview-root"
    >
      <h3
        className="text-base font-semibold text-[#263238] mb-1.5 text-center"
        data-testid="no-connection-preview-title"
      >
        Start by creating a connection
      </h3>
      <p
        className="text-sm text-[#78909c] mb-6 text-center max-w-md"
        data-testid="no-connection-preview-description"
      >
        Connect your {displayName} to begin exploring and managing your data.
      </p>

      {onAddConnection && (
        <Button
          data-testid="add-connection-inline-button"
          variant="black"
          size="default"
          onClick={onAddConnection}
          className="gap-2 uppercase tracking-wide"
        >
          <PlusIcon className="h-4 w-4" />
          NEW CONNECTION
        </Button>
      )}
    </div>
  );
};

export default NoConnectionPreview;
