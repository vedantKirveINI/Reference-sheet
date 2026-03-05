import React, { useState, useEffect, useCallback } from "react";
import { FileText, Loader2, Check, ExternalLink } from "lucide-react";
import { getTriggerTheme, getTriggerIcon } from "../../triggerThemeRegistry";
import { TRIGGER_TYPES } from "../../constants";
import { cn } from "@/lib/utils";
import assetSDKServices from "../../../../services/assetSDKServices";
import { canvasSDKServices } from "../../../../services/canvasSDKServices";

const VALID_QUESTION_TYPES = [
  "SHORT_TEXT", "LONG_TEXT", "MCQ", "SCQ", "PHONE_NUMBER", "ZIP_CODE",
  "DROP_DOWN", "DROP_DOWN_STATIC", "YES_NO", "RANKING", "EMAIL",
  "AUTHORIZATION", "QUESTION_FX", "DATE", "CURRENCY", "KEY_VALUE_TABLE",
  "NUMBER", "FILE_PICKER", "TIME", "SIGNATURE", "ADDRESS", "AUTOCOMPLETE",
  "PICTURE", "RATING", "SLIDER", "OPINION_SCALE", "TERMS_OF_USE",
];

const FormSourcePicker = ({ state, workspaceId }) => {
  const { formConnection, setFormConnection } = state;
  const [formList, setFormList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const theme = getTriggerTheme(TRIGGER_TYPES.FORM);
  const iconData = getTriggerIcon(TRIGGER_TYPES.FORM, true);
  const colors = theme.colors;

  useEffect(() => {
    const fetchForms = async () => {
      if (!workspaceId) return;
      try {
        setLoading(true);
        const response = await assetSDKServices.getFlatList({
          workspace_id: workspaceId,
          annotation: "FC",
          published_only: true,
          sort_by: "edited_at",
          sort_type: "desc"
        });
        if (response?.result) {
          setFormList(response.result);
        }
      } catch (error) {
        setFormList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchForms();
  }, [workspaceId]);

  const fetchFormFields = useCallback(async (form) => {
    try {
      setLoadingFields(true);
      const query = { asset_id: form.asset_id || form._id };
      const res = await canvasSDKServices.getPublishedByAsset(query);
      const formData = res?.result?.flow ?? {};
      
      const fields = Object.entries(formData)
        .filter(([id, node]) => {
          const nodeType = node?.type;
          return nodeType && 
                 VALID_QUESTION_TYPES.includes(nodeType) && 
                 nodeType !== "WELCOME" && 
                 nodeType !== "ENDING";
        })
        .map(([id, node]) => ({
          id,
          type: node?.type,
          name: node.config?.name || node.config?.title || node.config?.label || id,
          key: node.config?.key || id,
          _raw: node,
        }));
      return fields;
    } catch (error) {
      return [];
    } finally {
      setLoadingFields(false);
    }
  }, []);

  const handleFormSelect = async (form) => {
    const fields = await fetchFormFields(form);
    setFormConnection({
      ...form,
      name: form.name || form.title,
      id: form._id || form.asset_id,
      fields,
    });
  };

  const filteredForms = formList.filter(f => 
    (f.name || f.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderIcon = () => {
    if (iconData.type === "svg") {
      return <img src={iconData.src} alt="Form" className="w-5 h-5" />;
    }
    const IconComp = iconData.component;
    return <IconComp className="w-5 h-5" style={{ color: colors.primary }} />;
  };

  if (formConnection) {
    return (
      <div
        className="p-3 rounded-lg border flex items-center justify-between"
        style={{ borderColor: colors.border, backgroundColor: colors.bg }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center"
            style={{ backgroundColor: colors.primary }}
          >
            {iconData.type === "svg" ? (
              <img src={iconData.src} alt="Form" className="w-4 h-4" style={{ filter: "brightness(0) invert(1)" }} />
            ) : (() => {
              const IconComp = iconData.component;
              return <IconComp className="w-4 h-4 text-white" />;
            })()}
          </div>
          <div>
            <p className="font-medium text-sm">{formConnection.name}</p>
            <p className="text-xs text-muted-foreground">
              {formConnection.fields?.length || 0} fields available
            </p>
          </div>
        </div>
        <button
          onClick={() => setFormConnection(null)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Change
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ backgroundColor: colors.light }}
        >
          {renderIcon()}
        </div>
        <span className="text-sm font-medium">Select a Form</span>
      </div>

      {loading ? (
        <div className="p-4 text-center">
          <Loader2 className="w-5 h-5 mx-auto animate-spin text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-2">Loading forms...</p>
        </div>
      ) : formList.length === 0 ? (
        <div className="p-4 rounded-lg border border-dashed text-center" style={{ borderColor: colors.border }}>
          <p className="text-sm text-muted-foreground">No forms found</p>
          <p className="text-xs text-muted-foreground mt-1">Create a form in your workspace first</p>
        </div>
      ) : (
        <>
          {formList.length > 4 && (
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-md bg-background"
            />
          )}
          <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto">
            {filteredForms.map((form) => (
              <button
                key={form._id || form.asset_id}
                onClick={() => handleFormSelect(form)}
                disabled={loadingFields}
                className={cn(
                  "p-2.5 rounded-md border text-left transition-all hover:shadow-sm",
                  "border-border hover:border-opacity-80 bg-background"
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 shrink-0" style={{ color: colors.primary }} />
                  <span className="text-sm font-medium truncate">{form.name || form.title}</span>
                </div>
              </button>
            ))}
          </div>
          {loadingFields && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Loading form fields...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FormSourcePicker;
