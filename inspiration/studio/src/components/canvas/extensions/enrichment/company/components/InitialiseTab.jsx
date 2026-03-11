import React from "react";
import { Building2, Globe, Users, DollarSign, MapPin, Briefcase, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const InitialiseTab = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-[#3B82F6]/10 rounded-2xl flex items-center justify-center">
          <Building2 className="w-8 h-8 text-[#3B82F6]" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Company Enrichment</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Get comprehensive company data using just the domain name
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#3B82F6]" />
          When to use Company Enrichment
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#3B82F6] mt-0.5">•</span>
            <span><strong>Account research</strong> — Get detailed company info for sales outreach</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#3B82F6] mt-0.5">•</span>
            <span><strong>Lead scoring</strong> — Score leads based on company size, industry, and revenue</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#3B82F6] mt-0.5">•</span>
            <span><strong>Market analysis</strong> — Gather competitive intelligence and market data</span>
          </li>
        </ul>
      </div>

      <div className="bg-[#3B82F6]/5 rounded-xl p-4 space-y-3 border border-[#3B82F6]/10">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
          Data you'll receive
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Building2 className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Company name & logo</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Industry & category</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Employee count</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <DollarSign className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Revenue range</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Headquarters location</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Globe className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span>Social profiles</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
        <h3 className="font-medium text-gray-900 text-sm">What you'll need to provide</h3>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Globe className="w-4 h-4 text-gray-400" />
            <span>Company Domain</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-2 bg-[#3B82F6]/10 px-3 py-2 rounded-lg border border-[#3B82F6]/20">
            <Building2 className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-[#3B82F6] font-medium">Full company data</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Use the company's main domain (e.g., "acme.com") rather than subdomains
        </p>
      </div>
    </div>
  );
};

export default InitialiseTab;
