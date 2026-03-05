import { useFormPublishContext } from "../../../hooks/use-form-publish-context";
import CopyableTextField from "../../../components/copyable-text-field";
import { getSheetURL } from "../../utils";
import ResponseMappingTable from "../form-responses/response-mapping/components/response-mapping-table";
import UnmappedQuestions from "../form-responses/response-mapping/components/unmapped-questions";
import ErrorMessage from "../form-responses/response-mapping/components/error-message";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { icons } from "@/components/icons";
import {
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";

const FormResponsesTab = ({
  assetDetails,
  responseMappings = [],
  setResponseMappings,
  onMappingsChange,
  onAnalyticsEvent,
  questions = [],
}) => {
  const { isAssetPublished } = useFormPublishContext();

  const handleMappingsChange = (mappings) => {
    setResponseMappings(mappings);
    onMappingsChange?.(mappings);
  };

  return (
    <div className="p-4 space-y-4" data-testid="form-responses-tab">
      <Alert className="bg-muted/50 border-border flex items-start gap-2 [&>svg]:relative [&>svg]:static [&>svg]:top-auto [&>svg]:left-auto [&>svg~*]:pl-0">
        {icons.info && <icons.info className="h-4 w-4 shrink-0 mt-0.5" />}
        <div className="flex-1">
          <AlertTitle className="text-sm font-semibold">Response Management</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground">
            Configure how form submissions are captured and mapped to your spreadsheet columns.
          </AlertDescription>
        </div>
      </Alert>

      <div className="space-y-2">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            Responses Sheet
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All form submissions are automatically saved to a spreadsheet.
          </p>
        </div>
        
        <CopyableTextField
          title="Sheet Link"
          value={
            isAssetPublished
              ? getSheetURL({ assetDetails })
              : "Publish form to get the sheet link"
          }
          isEnabled={isAssetPublished}
          onCopy={(url) => {
            onAnalyticsEvent?.(UATU_CANVAS, {
              subEvent: UATU_PREDICATE_EVENTS_CANVAS.COPY_SHEET_URL,
              url,
            });
          }}
          dataTestId="form-response-sheet-link"
        />
      </div>

      <div className="space-y-2">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-foreground">
            Column Mapping
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Map form questions to spreadsheet columns. Add custom columns or rename existing ones.
          </p>
        </div>

        <Card className="p-2.5 bg-muted/50 border-border">
          <div className="flex items-start gap-2">
            {icons.fileSpreadsheet && (
              <icons.fileSpreadsheet className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground mb-0.5">
                How it works
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Each row maps a question to a column. <strong>Name</strong> is the column header. 
                <strong> Value</strong> can be a question response or a static value you define.
              </p>
            </div>
          </div>
        </Card>

        <div className="border border-border rounded-lg overflow-hidden">
          <ResponseMappingTable
            questions={questions}
            mappings={responseMappings}
            onChange={handleMappingsChange}
            dataTestId="form-response-mapping-table"
          />
        </div>
        
        <ErrorMessage
          mappings={responseMappings}
          questions={questions}
          dataTestId="form-response-mapping-errors"
        />

        <UnmappedQuestions
          questions={questions}
          mappedQuestions={responseMappings}
          dataTestId="form-response-mapping-unmapped"
        />
      </div>
    </div>
  );
};

export default FormResponsesTab;
