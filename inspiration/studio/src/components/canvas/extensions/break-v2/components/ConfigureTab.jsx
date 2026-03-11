import React from "react";
import { StopCircle } from "lucide-react";

const ConfigureTab = () => {
  return (
    <div className="space-y-6">
      <div className="bg-[#EF4444]/5 rounded-xl p-4 flex items-start gap-3">
        <StopCircle className="w-5 h-5 text-[#EF4444] mt-0.5" />
        <div>
          <p className="text-sm text-gray-700">
            Stop Loop will exit the loop entirely, stopping all remaining iterations from running.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          When the flow reaches this node, it will immediately exit the loop. Use an If/Else node before this if you only want to stop the loop under certain conditions.
        </p>
      </div>
    </div>
  );
};

export default ConfigureTab;
