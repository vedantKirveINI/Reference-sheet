import React from "react";
import { Globe, Search, Sparkles, CheckCircle2 } from "lucide-react";

const FeatureItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-blue-600" />
    </div>
    <div>
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

const InitialiseTab = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Web Search
          </h2>
          <p className="text-sm text-gray-500">
            Search the web for real-time information and integrate results directly into your workflow.
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 mb-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Globe size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Search the entire web</h3>
              <p className="text-xs text-gray-500">Get up-to-date information instantly</p>
            </div>
          </div>

          <div className="space-y-3">
            <FeatureItem
              icon={Search}
              title="Natural Language Queries"
              description="Search using everyday language, not just keywords"
            />
            <FeatureItem
              icon={Sparkles}
              title="Configurable Results"
              description="Control how many results to return"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 size={14} className="text-green-500" />
            <span>Enter your search query on the next screen</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 size={14} className="text-green-500" />
            <span>Test with real-time web results</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialiseTab;
