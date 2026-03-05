import React, {
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const DEBOUNCE_MS = 280;

const runValidation = (trimmed) => {
  if (!trimmed) return { valid: false, parsed: null, error: null };
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed !== null && typeof parsed === "object") {
      return { valid: true, parsed, error: null };
    }
    return {
      valid: false,
      parsed: null,
      error: "JSON must be an object or array",
    };
  } catch (e) {
    return { valid: false, parsed: null, error: e.message || "Invalid JSON" };
  }
};

const JsonDialogContent = ({
  initialValue,
  onClose = () => {},
  onModify = () => {},
  accentColor,
}) => {
  const initial = initialValue ?? "{}";
  const [value, setValue] = useState(initial);
  const [debouncedValue, setDebouncedValue] = useState(initial);
  const debounceRef = useRef(null);

  useEffect(() => {
    const next = initialValue ?? "{}";
    setValue(next);
    setDebouncedValue(next);
  }, [initialValue]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedValue(value);
      debounceRef.current = null;
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const validation = useMemo(
    () => runValidation(debouncedValue.trim()),
    [debouncedValue],
  );

  const isValidJSON = validation.valid;

  const handleChange = useCallback((e) => {
    setValue(e.target.value);
  }, []);

  const handleFormat = useCallback(() => {
    const result = runValidation(value.trim());
    if (!result.valid || !result.parsed) return;
    setValue(JSON.stringify(result.parsed, null, 2));
  }, [value]);

  const handleSave = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed) return;
    const result = runValidation(trimmed);
    if (!result.valid || !result.parsed) return;
    onModify(result.parsed);
    onClose();
  }, [value, onModify, onClose]);

  return (
    <div
      className="flex flex-col min-h-0 flex-1 gap-4"
      data-testid="json-content"
      style={accentColor ? { "--json-accent": accentColor } : undefined}
    >
      <div className="flex flex-col gap-1.5 flex-1 min-h-0 p-1">
        <label className="text-sm font-medium text-foreground">JSON</label>
        <Textarea
          value={value}
          onChange={handleChange}
          placeholder='{"key": "value"}'
          className="min-h-[280px] w-full font-mono text-sm resize-none"
          data-testid="json-textarea"
        />
      </div>
      {validation.error && (
        <p
          className="text-sm text-destructive flex-shrink-0"
          data-testid="json-error"
        >
          Invalid JSON: {validation.error}
        </p>
      )}
      <div className="flex gap-2 justify-end items-center flex-shrink-0 border-t border-border pt-4">
        {isValidJSON && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleFormat}
            data-testid="format-json"
          >
            Format
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClose}
          data-testid="cancel-json"
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!isValidJSON || !value.trim()}
          onClick={handleSave}
          data-testid="save-json"
          className={
            accentColor
              ? "bg-[var(--json-accent)] hover:opacity-90 text-white"
              : undefined
          }
        >
          Save JSON
        </Button>
      </div>
    </div>
  );
};

export default JsonDialogContent;
