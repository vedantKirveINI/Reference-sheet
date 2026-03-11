import { X, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePublish } from "../context";

const Header = ({ title, onClose, onPublish, isPublishing }) => {
  const { isPublished } = usePublish();

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-zinc-900">{title || "Publish Form"}</h1>
          <p className="text-sm text-zinc-500">
            {isPublished ? "Your form is live" : "Configure and publish your form"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isPublished && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium">
            <Check className="w-4 h-4" />
            Published
          </div>
        )}
        <Button
          onClick={onPublish}
          disabled={isPublishing}
          className="bg-[#1C3693] hover:bg-[#152a75] text-white px-6"
        >
          {isPublishing ? "Publishing..." : isPublished ? "Update" : "Publish"}
        </Button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-zinc-500" />
        </button>
      </div>
    </div>
  );
};

export default Header;
