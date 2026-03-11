import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { icons } from "@/components/icons";
import { parseBulkImport } from "./utils";

export function BulkImportModal({ open, onOpenChange, onImport }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState([]);

  const handleTextChange = (e) => {
    const value = e.target.value;
    setText(value);
    setError("");
    
    if (value.trim()) {
      try {
        const parsed = parseBulkImport(value);
        if (parsed.length === 0) {
          setError("Could not parse any valid key-value pairs");
          setPreview([]);
        } else {
          setPreview(parsed);
        }
      } catch (err) {
        setError("Invalid format");
        setPreview([]);
      }
    } else {
      setPreview([]);
    }
  };

  const handleImport = () => {
    if (preview.length > 0) {
      onImport(preview);
      setText("");
      setPreview([]);
      onOpenChange(false);
    }
  };

  const handleClose = () => {
    setText("");
    setError("");
    setPreview([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle className="flex items-center gap-2" style={{ fontFamily: "Radio Canada Big, sans-serif" }}>
            <icons.upload className="w-5 h-5 text-[#1C3693]" />
            Bulk Import
          </DialogTitle>
          <DialogDescription style={{ fontFamily: "Archivo, sans-serif" }}>
            Paste JSON object, JSON array, or key:value pairs (one per line)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 min-w-0 overflow-hidden flex flex-col">
          <Textarea
            value={text}
            onChange={handleTextChange}
            placeholder={`{"key1": "value1", "key2": "value2"}\n\nor\n\nkey1: value1\nkey2: value2`}
            className="min-h-[150px] font-mono text-sm break-all min-w-0 w-full resize-y"
            data-testid="bulk-import-textarea"
          />

          {error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <icons.alertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {preview.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700" style={{ fontFamily: "Archivo, sans-serif" }}>
                Preview ({preview.length} items)
              </p>
              <div className="max-h-[120px] min-w-0 overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-2">
                {preview.slice(0, 5).map((row, i) => (
                  <div key={i} className="text-xs font-mono py-0.5 text-gray-600 break-all">
                    <span className="text-[#1C3693] font-medium break-all">{row.key}</span>
                    <span className="text-gray-400">: </span>
                    <span className="text-gray-700 break-all">{row.value.length > 50 ? row.value.slice(0, 50) + "..." : row.value}</span>
                  </div>
                ))}
                {preview.length > 5 && (
                  <div className="text-xs text-gray-400 pt-1">
                    +{preview.length - 5} more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={preview.length === 0}
            className="bg-[#1C3693] hover:bg-[#152a75]"
          >
            Import {preview.length > 0 && `(${preview.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
