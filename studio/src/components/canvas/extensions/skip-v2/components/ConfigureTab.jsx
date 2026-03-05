import React from "react";
import { SkipForward } from "lucide-react";

const ConfigureTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-[#6366F1]/5 rounded-xl p-4 flex items-start gap-3">
        <SkipForward className="w-5 h-5 text-[#6366F1] mt-0.5" />
        <div>
          <p className="text-sm text-gray-700">
            Skip will move to the next item in the Iterator, bypassing any remaining steps in the current iteration.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          When the flow reaches this node, it will immediately skip to the next iteration. Use an If/Else node before this if you need conditional skipping.
        </p>
      </div>
    </div>
  );
};

export default ConfigureTab;
