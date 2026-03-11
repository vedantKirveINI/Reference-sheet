import { usePublish } from "../context";
import CopyableTextField from "../../publish/components/copyable-text-field";
import { getSheetURL } from "../../publish/forms/utils";
import ResponseMappingTable from "../../publish/forms/tabs/form-responses/response-mapping/components/response-mapping-table";
import UnmappedQuestions from "../../publish/forms/tabs/form-responses/response-mapping/components/unmapped-questions";
import ErrorMessage from "../../publish/forms/tabs/form-responses/response-mapping/components/error-message";
import {
  UATU_CANVAS,
  UATU_PREDICATE_EVENTS_CANVAS,
} from "@oute/oute-ds.common.core.utils";

const ResponsesTab = ({ onAnalyticsEvent }) => {
  const { 
    assetDetails, 
    questions, 
    responseMappings, 
    setResponseMappings,
    onMappingsChange,
  } = usePublish();

  const handleMappingsChange = (mappings) => {
    setResponseMappings(mappings);
    onMappingsChange?.(mappings);
  };

  return (
    <div className="p-6 space-y-6">
      <CopyableTextField
        title="Responses Sheet Link"
        value={
          !!assetDetails?.asset?.published_info
            ? getSheetURL({ assetDetails })
            : "Publish form to get the sheet link."
        }
        isEnabled={!!assetDetails?.asset?.published_info}
        onCopy={(url) => {
          onAnalyticsEvent?.(UATU_CANVAS, {
            subEvent: UATU_PREDICATE_EVENTS_CANVAS.COPY_SHEET_URL,
            url,
          });
        }}
        dataTestId="form-response-sheet-link"
      />

      <div className="space-y-4">
        <div className="border border-zinc-200 rounded-lg overflow-hidden">
          <div className="max-h-[300px] overflow-auto">
            <ResponseMappingTable
              questions={questions}
              mappings={responseMappings}
              onChange={handleMappingsChange}
              dataTestId="form-response-mapping-table"
            />
          </div>
        </div>
        
        <ErrorMessage
          mappings={responseMappings}
          questions={questions}
          dataTestId="form-response-mapping-errors"
        />
      </div>

      <UnmappedQuestions
        questions={questions}
        mappedQuestions={responseMappings}
        dataTestId="form-response-mapping-unmapped"
      />
    </div>
  );
};

export default ResponsesTab;
