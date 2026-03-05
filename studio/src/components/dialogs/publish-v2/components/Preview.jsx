import { useState } from "react";
import { Monitor, Smartphone, RotateCcw, Globe } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { usePublish } from "../context";

const Preview = ({ questions, mode, onRestart }) => {
  const [viewport, setViewport] = useState("desktop");
  const { settings, formUrl, isPublished } = usePublish();

  return (
    <div className="flex flex-col h-full bg-zinc-100">
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-200">
        <span className="text-sm font-medium text-zinc-700">Preview</span>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={viewport}
            onValueChange={(v) => v && setViewport(v)}
            className="bg-zinc-100 p-0.5 rounded-lg"
          >
            <ToggleGroupItem
              value="desktop"
              className="px-2.5 py-1.5 rounded-md data-[state=on]:bg-white data-[state=on]:shadow-sm"
            >
              <Monitor className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="mobile"
              className="px-2.5 py-1.5 rounded-md data-[state=on]:bg-white data-[state=on]:shadow-sm"
            >
              <Smartphone className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <button
            onClick={onRestart}
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
            title="Restart preview"
          >
            <RotateCcw className="w-4 h-4 text-zinc-500" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
        <div
          className={`
            bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300
            ${viewport === "mobile" ? "w-[375px] h-[667px]" : "w-full max-w-4xl h-full"}
          `}
        >
          {isPublished && formUrl ? (
            <iframe
              src={formUrl}
              className="w-full h-full border-0"
              title="Form Preview"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <Globe className="w-8 h-8 text-zinc-300" />
              </div>
              <div className="text-center">
                <p className="text-lg font-medium text-zinc-600">Preview unavailable</p>
                <p className="text-sm text-zinc-400 mt-1">Publish your form to see a live preview</p>
              </div>
              {settings.removeBranding && (
                <div className="mt-4 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">Branding will be removed</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Preview;
