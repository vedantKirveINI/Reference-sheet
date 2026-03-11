import React, { useCallback, useEffect, useRef, useState } from "react";
import { ODSFormulaBar as FormulaBar } from "@src/module/ods";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X } from "lucide-react";
import { FILE_TYPES } from "../constant";
const AddLinkItem = ({
  variables,
  onLinkAdded = () => {},
  onCancel = () => {},
}) => {
  const fxRef = useRef();
  const [selectedType, setSelectedType] = useState(FILE_TYPES[0]);
  const [linkData, setLinkData] = useState();
  const [error, setError] = useState("");

  const onInputContentChanged = (content) => {
    setLinkData(content);
  };

  const validateLink = useCallback(() => {
    if (!linkData?.length) {
      setError("Please enter or select a valid link");
      fxRef?.current?.focus();
      return;
    }
    onLinkAdded({
      url: { type: "fx", blocks: linkData },
      source: "link",
      type: selectedType.value,
    });
  }, [linkData, onLinkAdded, selectedType.value]);

  useEffect(() => {
    fxRef?.current?.focus();
  }, []);

  useEffect(() => {
    //Add "enter" key listener which will call validateLink
    const listener = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        validateLink();
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [onCancel, validateLink]);

  return (
    <div className="flex flex-col gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50/50">
      <div className="flex gap-2 items-center">
        <Select
          value={selectedType.value}
          onValueChange={(value) => {
            const type = FILE_TYPES.find((t) => t.value === value);
            if (type) setSelectedType(type);
          }}
          data-testid="link-type"
        >
          <SelectTrigger className="h-9 w-32 text-xs border-gray-300 bg-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {FILE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1 min-w-0">
          <FormulaBar
            ref={fxRef}
            variables={variables}
            wrapContent
            defaultInputContent={linkData}
            placeholder="Enter link here"
            onInputContentChanged={onInputContentChanged}
            slotProps={{
              container: {
                "data-testid": "file-link",
                className: "min-h-[36px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400",
              },
            }}
          />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={validateLink}
          className="h-9 w-9 p-0 hover:bg-green-50 hover:text-green-600 transition-colors"
          data-testid="check-icon"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 transition-colors"
          data-testid="close-icon"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      {error && (
        <Label className="text-xs text-red-600 ml-1" data-testid="file-link-error">
          {error}
        </Label>
      )}
    </div>
  );
};

export default AddLinkItem;
