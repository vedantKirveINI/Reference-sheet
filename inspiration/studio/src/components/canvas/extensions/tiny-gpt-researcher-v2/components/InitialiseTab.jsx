import React from "react";
import { cn } from "@/lib/utils";
import { Search, BookOpen, Newspaper, Building2, CheckCircle2 } from "lucide-react";

const FeatureItem = ({ icon: Icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
      <Icon size={16} className="text-violet-600" />
    </div>
    <div>
      <h4 className="text-sm font-medium text-gray-900">{title}</h4>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </div>
);

const InitialiseTab = ({ onStart, onStartResearch }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            AI Research Assistant
          </h2>
          <p className="text-sm text-gray-500">
            Get comprehensive research on any topic with AI-powered analysis and source verification.
          </p>
        </div>

        <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 mb-6 border border-violet-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <Search size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">What you can research</h3>
              <p className="text-xs text-gray-500">Topics, trends, companies, technologies, and more</p>
            </div>
          </div>

          <div className="space-y-3">
            <FeatureItem
              icon={BookOpen}
              title="Deep Analysis"
              description="From quick overviews to comprehensive studies"
            />
            <FeatureItem
              icon={Newspaper}
              title="Multiple Sources"
              description="Academic, news, government, and industry data"
            />
            <FeatureItem
              icon={Building2}
              title="Fact Verification"
              description="Cross-reference with configurable rigor"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 size={14} className="text-green-500" />
            <span>Configure depth, sources, and output format</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <CheckCircle2 size={14} className="text-green-500" />
            <span>Test with real-time AI processing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InitialiseTab;
