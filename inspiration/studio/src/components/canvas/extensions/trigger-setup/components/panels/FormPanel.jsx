import React, { useState, useEffect, useCallback } from "react";
import { Link2, Info, ExternalLink, Loader2 } from "lucide-react";
import { getTriggerTheme, getTriggerIcon } from "../../triggerThemeRegistry";
import { TRIGGER_TYPES } from "../../constants";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import assetSDKServices from "../../../../services/assetSDKServices";
import { canvasSDKServices } from "../../../../services/canvasSDKServices";

const VALID_QUESTION_TYPES = [
  "SHORT_TEXT",
  "LONG_TEXT",
  "MCQ",
  "SCQ",
  "PHONE_NUMBER",
  "ZIP_CODE",
  "DROP_DOWN",
  "DROP_DOWN_STATIC",
  "YES_NO",
  "RANKING",
  "EMAIL",
  "AUTHORIZATION",
  "QUESTION_FX",
  "WELCOME",
  "QUOTE",
  "ENDING",
  "DATE",
  "CURRENCY",
  "KEY_VALUE_TABLE",
  "NUMBER",
  "FILE_PICKER",
  "TIME",
  "SIGNATURE",
  "LOADING",
  "ADDRESS",
  "PDF_VIEWER",
  "TEXT_PREVIEW",
  "AUTOCOMPLETE",
  "CLOUD_FILE_EXPLORER",
  "MULTI_QUESTION_PAGE",
  "QUESTIONS_GRID",
  "PICTURE",
  "QUESTION_REPEATER",
  "COLLECT_PAYMENT",
  "RATING",
  "SLIDER",
  "OPINION_SCALE",
  "TERMS_OF_USE",
  "STRIPE_PAYMENT",
];

const FormPanel = ({ state, variables, workspaceId }) => {
  console.log("FormPanel", state, variables, workspaceId);
  const { formConnection, setFormConnection } = state;
  const [formList, setFormList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFields, setLoadingFields] = useState(false);

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
          sort_type: "desc",
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
          return (
            nodeType &&
            VALID_QUESTION_TYPES.includes(nodeType) &&
            nodeType !== "WELCOME" &&
            nodeType !== "ENDING"
          );
        })
        .map(([id, node]) => ({
          id,
          type: node?.type,
          name:
            node.config?.name || node.config?.title || node.config?.label || id,
          key: node.config?.key || id,
          config: node.config,
          validation: node.validation,
          settings: node.settings,
          _raw: node,
        }));

      return fields;
    } catch (error) {
      return [];
    } finally {
      setLoadingFields(false);
    }
  }, []);

  const handleFormChange = async (formId) => {
    const selectedForm = formList.find(
      (f) => f._id === formId || f.asset_id === formId,
    );
    if (selectedForm) {
      const fields = await fetchFormFields(selectedForm);
      setFormConnection({
        ...selectedForm,
        name: selectedForm.name || selectedForm.title,
        id: selectedForm._id || selectedForm.asset_id,
        fields,
      });
    }
  };

  const renderIcon = (size = "w-10 h-10", invert = false) => {
    if (iconData.type === "svg") {
      return (
        <img
          src={iconData.src}
          alt="Form"
          className={size}
          style={invert ? { filter: "brightness(0) invert(1)" } : undefined}
        />
      );
    }
    const IconComp = iconData.component;
    return <IconComp className={size} style={{ color: colors.primary }} />;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Link2 className="w-4 h-4" style={{ color: colors.primary }} />
          Connected Form
        </Label>

        {loadingFields ? (
          <div
            className="p-4 rounded-xl border"
            style={{ borderColor: colors.border, backgroundColor: colors.bg }}
          >
            <div className="flex items-center gap-3">
              <Loader2
                className="w-5 h-5 animate-spin"
                style={{ color: colors.primary }}
              />
              <p className="text-sm text-muted-foreground">
                Loading form fields...
              </p>
            </div>
          </div>
        ) : formConnection ? (
          <div
            className="p-4 rounded-xl border"
            style={{ borderColor: colors.border, backgroundColor: colors.bg }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {renderIcon("w-10 h-10")}
                <div>
                  <p className="font-medium text-gray-900">
                    {formConnection.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formConnection.fields?.length || 0} fields
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormConnection(null)}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <div
                className="p-6 rounded-xl border-2 border-dashed text-center"
                style={{
                  borderColor: colors.border,
                  backgroundColor: `${colors.bg}80`,
                }}
              >
                <Loader2
                  className="w-10 h-10 mx-auto mb-3 animate-spin"
                  style={{ color: colors.border }}
                />
                <p className="text-sm text-muted-foreground">
                  Loading forms...
                </p>
              </div>
            ) : formList.length === 0 ? (
              <div
                className="p-6 rounded-xl border-2 border-dashed text-center"
                style={{
                  borderColor: colors.border,
                  backgroundColor: `${colors.bg}80`,
                }}
              >
                <div className="mx-auto mb-3 opacity-50">
                  {renderIcon("w-10 h-10")}
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  No forms found
                </p>
                <p className="text-xs text-muted-foreground">
                  Create and publish a form in your workspace first
                </p>
              </div>
            ) : (
              <Select onValueChange={handleFormChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a form" />
                </SelectTrigger>
                <SelectContent>
                  {formList.map((form) => (
                    <SelectItem
                      key={form._id || form.asset_id}
                      value={form._id || form.asset_id}
                    >
                      {form.name || form.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-sm">How it works</h4>
        <ol className="text-sm text-muted-foreground space-y-3">
          <li className="flex gap-3">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
              style={{ backgroundColor: colors.light, color: colors.text }}
            >
              1
            </span>
            <span>Connect a form from your workspace</span>
          </li>
          <li className="flex gap-3">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
              style={{ backgroundColor: colors.light, color: colors.text }}
            >
              2
            </span>
            <span>Deploy your workflow</span>
          </li>
          <li className="flex gap-3">
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
              style={{ backgroundColor: colors.light, color: colors.text }}
            >
              3
            </span>
            <span>Each form submission triggers this workflow</span>
          </li>
        </ol>
      </div>

      <div className="bg-muted/30 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Form field values are automatically mapped to workflow variables.
            Access them in subsequent nodes using the variable picker.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormPanel;
