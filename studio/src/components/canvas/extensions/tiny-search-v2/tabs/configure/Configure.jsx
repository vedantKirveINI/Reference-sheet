import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Hash } from "lucide-react";

const FormSection = ({ title, description, required, error, icon: Icon, children }) => (
  <div className="space-y-2">
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon size={16} className="text-blue-600" />
        </div>
      )}
      <div className="flex-1">
        <Label className="text-sm font-medium text-gray-900">
          {title}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
    <div className={Icon ? "pl-11" : ""}>{children}</div>
    {error && <p className={cn("text-xs text-red-500", Icon && "pl-11")}>{error}</p>}
  </div>
);

const Configure = ({
  data,
  variables,
  setError,
  setValidTabIndices,
  onChange = () => { },
}) => {
  useEffect(() => {
    const validationErrors = {
      searchQuery: !data?.searchQuery?.blocks?.length,
      numberOfResults: !data?.numberOfResults?.blocks?.length,
    };

    const hasErrors = Object.values(validationErrors).some((error) => error);

    setValidTabIndices((prev) => {
      if (hasErrors) {
        return prev?.filter((ele) => ele != 1);
      }
      if (prev?.includes(1)) {
        return prev;
      }
      return [...prev, 1];
    });

    setError((prev) => {
      let errorMessages = [];
      if (validationErrors?.searchQuery) {
        errorMessages.push("Search Query is required");
      }
      if (validationErrors?.numberOfResults) {
        errorMessages.push("Number of Results is required");
      }
      return {
        ...prev,
        1: errorMessages,
      };
    });
  }, [data, setError, setValidTabIndices]);

  const getTextValue = (field) => {
    return field?.blocks?.[0]?.value || "";
  };

  const setTextValue = (key, value) => {
    onChange(key, {
      type: "fx",
      blocks: [{ type: "text", value }],
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        <FormSection
          title="Search Query"
          description="Enter the text, keyword, or topic you want to search for across the web."
          required
          icon={Search}
          error={!getTextValue(data?.searchQuery) ? null : null}
        >
          <Textarea
            placeholder="e.g., Latest AI trends in healthcare 2024"
            value={getTextValue(data?.searchQuery)}
            onChange={(e) => setTextValue("searchQuery", e.target.value)}
            className="min-h-[6.25rem] rounded-xl border-gray-300 resize-none"
            data-testid="search-query"
          />
        </FormSection>

        <FormSection
          title="Number of Results"
          description="How many search results would you like? (1-100)"
          required
          icon={Hash}
        >
          <Input
            type="number"
            placeholder="10"
            min={1}
            max={100}
            value={getTextValue(data?.numberOfResults)}
            onChange={(e) => setTextValue("numberOfResults", e.target.value)}
            className="h-11 rounded-xl border-gray-300 w-32"
            data-testid="number-of-results"
          />
        </FormSection>
      </div>
    </div>
  );
};

export default Configure;
